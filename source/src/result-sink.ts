import type { StudyConfig, StudyResultRecord } from './study';

export const QUALTRICS_SUBMIT_MESSAGE = 'accessible-questionnaire:qualtrics-submit:v2';
export const QUALTRICS_RECEIPT_MESSAGE = 'accessible-questionnaire:qualtrics-receipt:v2';
export const QUALTRICS_PARENT_READY_MESSAGE = 'accessible-questionnaire:qualtrics-parent-ready:v2';
export const QUALTRICS_CHILD_READY_MESSAGE = 'accessible-questionnaire:qualtrics-child-ready:v2';
export const QUALTRICS_ADVANCE_FAILED_MESSAGE = 'accessible-questionnaire:qualtrics-advance-failed:v2';
export const QUALTRICS_BRIDGE_BUILD = '0.8.10-q10';

export type QualtricsBridgeState = 'connecting' | 'connected' | 'failed';

export interface QualtricsBridgeStateDetail {
  state: QualtricsBridgeState;
  message: string;
}

/**
 * Page-side staging acknowledgement from the approved host bridge.
 * It proves that the bridge accepted this submission ID for staging.
 * It does not prove that Qualtrics has durably recorded the response.
 */
export interface ResultSinkStagingReceipt {
  accepted: true;
  submissionId: string;
  receiptId?: string;
}

export interface ApprovedResultSink {
  name: string;
  submit(record: StudyResultRecord): Promise<ResultSinkStagingReceipt>;
}

interface QualtricsReceiptMessage {
  type: typeof QUALTRICS_RECEIPT_MESSAGE;
  accepted: boolean;
  submissionId: string;
  receiptId?: string;
  error?: string;
  bridgeBuild?: string;
}

export interface InstalledStudyResultSink {
  sink: ApprovedResultSink;
  bridge: {
    getState(): QualtricsBridgeState;
    disconnect(): void;
  };
}

declare global {
  interface Window {
    accessibleQuestionnaireResultSink?: ApprovedResultSink;
    /** @deprecated Version 0.7 host integration name retained during migration. */
    accessibleNasaTlxResultSink?: ApprovedResultSink;
  }
}

export function configuredResultSink(windowRef: Window = window) {
  const sink =
    windowRef.accessibleQuestionnaireResultSink ??
    windowRef.accessibleNasaTlxResultSink;
  if (!sink || typeof sink.name !== 'string' || !sink.name.trim() || typeof sink.submit !== 'function') return null;
  return sink;
}

export function installStudyResultSink(
  config: StudyConfig,
  windowRef: Window = window,
  onBridgeStateChange: (detail: QualtricsBridgeStateDetail) => void = () => undefined,
  onAdvanceFailure: (message: string) => void = () => undefined,
): InstalledStudyResultSink | null {
  if (config.collection.mode !== 'qualtrics') return null;
  const bridge = installQualtricsBridgeHandshake(
    config.collection.parentOrigin,
    windowRef,
    onBridgeStateChange,
    onAdvanceFailure,
  );
  const sink = createQualtricsParentResultSink(
    config.collection.parentOrigin,
    windowRef,
    12_000,
    () => bridge.getState() === 'connected',
  );
  windowRef.accessibleQuestionnaireResultSink = sink;
  // Keep the old property for a bounded Version 0.7 migration period. Both
  // properties refer to the same origin-bound sink and do not duplicate data.
  windowRef.accessibleNasaTlxResultSink = sink;
  return { sink, bridge };
}

export function installQualtricsBridgeHandshake(
  parentOrigin: string,
  windowRef: Window = window,
  onStateChange: (detail: QualtricsBridgeStateDetail) => void = () => undefined,
  onAdvanceFailure: (message: string) => void = () => undefined,
) {
  let state: QualtricsBridgeState = 'connecting';
  let timeoutId: number | null = null;
  const setState = (nextState: QualtricsBridgeState, message: string) => {
    if (state === 'connected' || (state === 'failed' && nextState !== 'connected')) return;
    state = nextState;
    onStateChange({ state, message });
  };
  const receiveParentMessage = (event: MessageEvent<unknown>) => {
    if (event.source !== windowRef.parent || event.origin !== parentOrigin) return;
    const message = event.data as {
      type?: unknown;
      protocolVersion?: unknown;
      bridgeBuild?: unknown;
      error?: unknown;
    } | null;
    if (message?.type === QUALTRICS_ADVANCE_FAILED_MESSAGE) {
      if (
        message.bridgeBuild === QUALTRICS_BRIDGE_BUILD &&
        typeof message.error === 'string' &&
        message.error.trim()
      ) {
        onAdvanceFailure(message.error);
      }
      return;
    }
    if (message?.type !== QUALTRICS_PARENT_READY_MESSAGE) return;
    if (
      message.protocolVersion !== 2 ||
      message.bridgeBuild !== QUALTRICS_BRIDGE_BUILD
    ) {
      setState(
        'failed',
        `This Qualtrics survey is using an old or incomplete bridge. Expected ${QUALTRICS_BRIDGE_BUILD}. Do not start this questionnaire.`,
      );
      return;
    }
    if (timeoutId !== null) {
      windowRef.clearTimeout(timeoutId);
      timeoutId = null;
    }
    windowRef.parent.postMessage({
      type: QUALTRICS_CHILD_READY_MESSAGE,
      protocolVersion: 2,
      bridgeBuild: QUALTRICS_BRIDGE_BUILD,
    }, parentOrigin);
    setState(
      'connected',
      `Secure Qualtrics bridge ${QUALTRICS_BRIDGE_BUILD} connected.`,
    );
  };

  windowRef.addEventListener('message', receiveParentMessage);
  onStateChange({
    state,
    message: `Checking Qualtrics bridge ${QUALTRICS_BRIDGE_BUILD}.`,
  });
  timeoutId = windowRef.setTimeout(() => {
    timeoutId = null;
    if (state === 'connected') return;
    setState(
      'failed',
      `The required Qualtrics bridge ${QUALTRICS_BRIDGE_BUILD} did not connect. Do not start this questionnaire.`,
    );
  }, 8_500);

  return {
    getState: () => state,
    disconnect() {
      if (timeoutId !== null) {
        windowRef.clearTimeout(timeoutId);
        timeoutId = null;
      }
      windowRef.removeEventListener('message', receiveParentMessage);
    },
  };
}

export function createQualtricsParentResultSink(
  parentOrigin: string,
  windowRef: Window = window,
  acknowledgementTimeoutMs = 12_000,
  isConnectionReady: () => boolean = () => true,
): ApprovedResultSink {
  return {
    name: 'UCL Qualtrics',
    submit(record) {
      if (windowRef.parent === windowRef) {
        return Promise.reject(new Error('This centrally collected questionnaire must be opened through its Qualtrics survey.'));
      }
      if (!isConnectionReady()) {
        return Promise.reject(new Error(
          `Qualtrics bridge ${QUALTRICS_BRIDGE_BUILD} is not connected. The response remains in the local backup.`,
        ));
      }

      return new Promise<ResultSinkStagingReceipt>((resolve, reject) => {
        let settled = false;
        const finish = (action: () => void) => {
          if (settled) return;
          settled = true;
          windowRef.clearTimeout(timeoutId);
          windowRef.removeEventListener('message', receiveReceipt);
          action();
        };
        const receiveReceipt = (event: MessageEvent<unknown>) => {
          if (event.source !== windowRef.parent || event.origin !== parentOrigin) return;
          const message = event.data as Partial<QualtricsReceiptMessage> | null;
          if (
            !message ||
            message.type !== QUALTRICS_RECEIPT_MESSAGE ||
            message.submissionId !== record.submissionId ||
            message.bridgeBuild !== QUALTRICS_BRIDGE_BUILD
          ) {
            return;
          }
          if (message.accepted !== true) {
            finish(() => reject(new Error(
              typeof message.error === 'string' && message.error
                ? message.error
                : 'Qualtrics did not accept the response.',
            )));
            return;
          }
          finish(() => resolve({
            accepted: true,
            submissionId: record.submissionId,
            receiptId: typeof message.receiptId === 'string' ? message.receiptId : undefined,
          }));
        };
        const timeoutId = windowRef.setTimeout(() => {
          finish(() => reject(new Error('Qualtrics did not acknowledge the response in time.')));
        }, acknowledgementTimeoutMs);
        windowRef.addEventListener('message', receiveReceipt);
        windowRef.parent.postMessage({
          type: QUALTRICS_SUBMIT_MESSAGE,
          bridgeBuild: QUALTRICS_BRIDGE_BUILD,
          record,
        }, parentOrigin);
      });
    },
  };
}

export async function submitToApprovedResultSink(
  record: StudyResultRecord,
  sink: ApprovedResultSink,
  timeoutMs = 15_000,
): Promise<ResultSinkStagingReceipt> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('The study platform did not acknowledge the staged response in time.')), timeoutMs);
  });
  let receipt: ResultSinkStagingReceipt;
  try {
    receipt = await Promise.race([sink.submit(record), timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
  if (
    !receipt ||
    receipt.accepted !== true ||
    receipt.submissionId !== record.submissionId ||
    (receipt.receiptId !== undefined && typeof receipt.receiptId !== 'string')
  ) {
    throw new Error('The study platform returned an invalid submission receipt.');
  }
  return receipt;
}
