// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import { installRf04SavedSessionRecovery } from '../src/rf04-saved-session-recovery';
import { installRf04NativeRecoveryDialog } from '../src/rf04-native-recovery-dialog';
import {
  buildQuestionnairePairs,
  getQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import { progressStorageKey } from '../src/study';

installRf04SavedSessionRecovery();
installRf04NativeRecoveryDialog();

const nasaTlx = getQuestionnaireDefinition('nasa-tlx-weighted')!;
const savedSession = {
  version: 4,
  instrumentId: 'nasa-tlx-weighted',
  questionnaireDefinition: nasaTlx,
  savedAt: 1722123456789,
  startedAt: '2026-07-27T12:00:00.000Z',
  configId: 'demo-config',
  participantCode: 'DEMO',
  stage: 'ratings',
  ratingIndex: 2,
  pairIndex: 0,
  pairOrder: buildQuestionnairePairs(nasaTlx),
  pairResponses: {},
  ratings: { mental: 40, physical: 25, temporal: 60 },
  ratingInputRoutes: {},
  pairInputRoutes: {},
  supportChanges: [],
  support: {
    answerMode: 'standard',
    showSimpleLanguage: false,
    largeText: false,
    audioGuidance: false,
  },
} as const;

let originalShowModal: PropertyDescriptor | undefined;
let originalClose: PropertyDescriptor | undefined;

function installDialogTestPlatform() {
  originalShowModal = Object.getOwnPropertyDescriptor(
    HTMLDialogElement.prototype,
    'showModal',
  );
  originalClose = Object.getOwnPropertyDescriptor(
    HTMLDialogElement.prototype,
    'close',
  );

  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
      this.querySelector<HTMLElement>('[autofocus]')?.focus();
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    },
  });
}

function restoreDialogTestPlatform() {
  if (originalShowModal) {
    Object.defineProperty(
      HTMLDialogElement.prototype,
      'showModal',
      originalShowModal,
    );
  } else {
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  }
  if (originalClose) {
    Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
  } else {
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
  }
}

async function renderComponent() {
  const component = document.createElement(
    'accessible-nasa-tlx',
  ) as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  await Promise.resolve();
  await component.updateComplete;
  await Promise.resolve();
  return component as any;
}

beforeEach(() => {
  installDialogTestPlatform();
  localStorage.clear();
  sessionStorage.clear();
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  restoreDialogTestPlatform();
  vi.restoreAllMocks();
});

describe('RF-04 native saved-session dialog successor', () => {
  it('opens a real dialog with the exact count and focuses the primary Resume action', async () => {
    localStorage.setItem(
      progressStorageKey('demo-config', 'DEMO'),
      JSON.stringify(savedSession),
    );

    const component = await renderComponent();
    const dialog = component.querySelector(
      '#saved-session-dialog',
    ) as HTMLDialogElement;
    const resume = component.querySelector(
      '#resume-saved-questionnaire',
    ) as HTMLButtonElement;

    expect(dialog).toBeInstanceOf(HTMLDialogElement);
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe('saved-session-heading');
    expect(dialog.getAttribute('aria-describedby')).toBe(
      'saved-session-count saved-session-actions',
    );
    expect(resume.hasAttribute('autofocus')).toBe(true);
    expect(resume.getAttribute('aria-describedby')).toBe(
      'saved-session-count saved-session-actions',
    );
    expect(component.querySelector('#saved-session-count')?.textContent).toContain(
      '3 of 21',
    );
    expect(component.querySelector('#saved-session-actions')?.textContent?.trim()).toBe(
      'Resume saved questionnaire. Erase saved answers.',
    );
    expect(document.activeElement).toBe(resume);
    expect(component.statusMessage).toBe('');
  });

  it('lets Escape/close return to a visible reopen control and reopens with Resume focused', async () => {
    localStorage.setItem(
      progressStorageKey('demo-config', 'DEMO'),
      JSON.stringify(savedSession),
    );

    const component = await renderComponent();
    const dialog = component.querySelector(
      '#saved-session-dialog',
    ) as HTMLDialogElement;
    dialog.close();
    await component.updateComplete;
    await Promise.resolve();

    const reopen = component.querySelector(
      '#open-saved-session-dialog',
    ) as HTMLButtonElement;
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(reopen);

    reopen.click();
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(
      component.querySelector('#resume-saved-questionnaire'),
    );
  });

  it('preserves direct resume at the first unanswered item and all committed answers', async () => {
    localStorage.setItem(
      progressStorageKey('demo-config', 'DEMO'),
      JSON.stringify(savedSession),
    );

    const component = await renderComponent();
    const resume = component.querySelector(
      '#resume-saved-questionnaire',
    ) as HTMLButtonElement;
    resume.click();
    await component.updateComplete;
    await Promise.resolve();

    expect(component.stage).toBe('ratings');
    expect(component.ratingIndex).toBe(3);
    expect(component.querySelector('#rating-heading')?.textContent).toContain(
      'Performance',
    );
    expect(document.activeElement).toBe(component.querySelector('#rating-heading'));
    expect(component.ratings).toEqual(savedSession.ratings);
    expect(component.querySelector('#saved-session-dialog')).toBeNull();
  });

  it('erases only after the explicit destructive action and removes the modal offer', async () => {
    const key = progressStorageKey('demo-config', 'DEMO');
    localStorage.setItem(key, JSON.stringify(savedSession));

    const component = await renderComponent();
    const erase = component.querySelector(
      '#erase-saved-questionnaire',
    ) as HTMLButtonElement;
    expect(localStorage.getItem(key)).not.toBeNull();

    erase.click();
    await component.updateComplete;

    expect(localStorage.getItem(key)).toBeNull();
    expect(component.savedSession).toBeNull();
    expect(component.querySelector('#saved-session-dialog')).toBeNull();
    expect(component.statusMessage).toBe('Saved answers erased.');
  });
});
