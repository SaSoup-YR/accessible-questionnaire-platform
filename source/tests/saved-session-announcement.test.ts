// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import {
  installRf04SavedSessionRecovery,
  resolveDirectResumePosition,
} from '../src/rf04-saved-session-recovery';
import {
  buildQuestionnairePairs,
  getQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import { progressStorageKey } from '../src/study';

installRf04SavedSessionRecovery();

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
  ratings: { mental: 40, physical: 25 },
  ratingInputRoutes: {},
  pairInputRoutes: {},
  supportChanges: [],
  support: {
    answerMode: 'standard',
    showSimpleLanguage: false,
    largeText: false,
    audioGuidance: true,
  },
} as const;

const savedSessionAfterThreeRatings = {
  ...savedSession,
  savedAt: savedSession.savedAt + 1,
  ratingIndex: 2,
  ratings: { mental: 40, physical: 25, temporal: 60 },
} as const;

async function renderComponent() {
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component as any;
}

beforeEach(() => {
  vi.useFakeTimers();
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
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('saved questionnaire recovery announcement', () => {
  it('loads a real saved session after refresh and focuses Resume while preserving the exact message', async () => {
    localStorage.setItem(
      progressStorageKey('demo-config', 'DEMO'),
      JSON.stringify(savedSession),
    );
    const speakText = vi
      .spyOn(AccessibleNasaTlx.prototype as any, 'speakText')
      .mockImplementation(() => undefined);

    const component = await renderComponent();
    await Promise.resolve();
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(650);

    expect(component.querySelector('#saved-session-offer')).not.toBeNull();
    expect(document.activeElement).toBe(component.querySelector('#resume-saved-questionnaire'));
    expect(speakText).toHaveBeenCalledWith(
      'Saved questionnaire found. 2 of 21 responses are saved in this browser. Resume saved questionnaire. Erase saved answers.',
    );
  });

  it('migrates a valid Version 0.7 weighted NASA-TLX recovery copy before offering resume', async () => {
    const legacyKey = 'accessible-nasa-tlx-v0.7-progress:demo-config:DEMO';
    const {
      instrumentId: _instrumentId,
      questionnaireDefinition: _questionnaireDefinition,
      ...legacySession
    } = savedSession;
    localStorage.setItem(
      legacyKey,
      JSON.stringify({ ...legacySession, version: 3 }),
    );

    const component = await renderComponent();
    await Promise.resolve();
    await component.updateComplete;

    expect(component.querySelector('#saved-session-offer')).not.toBeNull();
    expect(localStorage.getItem(legacyKey)).toBeNull();
    expect(JSON.parse(
      localStorage.getItem(progressStorageKey('demo-config', 'DEMO'))!,
    )).toMatchObject({
      version: 4,
      instrumentId: 'nasa-tlx-weighted',
      ratingIndex: 2,
      ratings: { mental: 40, physical: 25 },
    });
  });

  it('adds the immutable built-in definition snapshot to an early Version 4 recovery copy', async () => {
    const currentKey = progressStorageKey('demo-config', 'DEMO');
    const { questionnaireDefinition: _questionnaireDefinition, ...earlyVersion4 } = savedSession;
    localStorage.setItem(currentKey, JSON.stringify(earlyVersion4));

    const component = await renderComponent();
    await component.updateComplete;

    expect(component.querySelector('#saved-session-offer')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(currentKey)!)).toMatchObject({
      version: 4,
      instrumentId: 'nasa-tlx-weighted',
      questionnaireDefinition: {
        id: 'nasa-tlx-weighted',
        version: '1.0.0',
      },
    });
  });

  it('does not mix progress with a changed questionnaire definition snapshot', async () => {
    const currentKey = progressStorageKey('demo-config', 'DEMO');
    localStorage.setItem(currentKey, JSON.stringify({
      ...savedSession,
      questionnaireDefinition: {
        ...nasaTlx,
        version: 'changed-after-session-start',
      },
    }));

    const component = await renderComponent();
    await component.updateComplete;

    expect(component.querySelector('#saved-session-offer')).toBeNull();
    expect(component.querySelector('#saved-session-problem-heading')).not.toBeNull();
    expect(component.textContent).toContain('Start this questionnaire again below');
    expect(localStorage.getItem(currentKey)).toBeNull();
  });

  it('leaves an invalid Version 0.7 recovery copy untouched instead of guessing', async () => {
    const legacyKey = 'accessible-nasa-tlx-v0.7-progress:demo-config:DEMO';
    const {
      instrumentId: _instrumentId,
      questionnaireDefinition: _questionnaireDefinition,
      ...legacySession
    } = savedSession;
    const invalidLegacy = { ...legacySession, version: 3, pairOrder: [] };
    localStorage.setItem(legacyKey, JSON.stringify(invalidLegacy));

    const component = await renderComponent();
    await component.updateComplete;

    expect(component.querySelector('#saved-session-offer')).toBeNull();
    expect(component.querySelector('#saved-session-problem-heading')?.textContent).toContain(
      'Saved progress could not be restored',
    );
    expect(component.textContent).toContain(
      'An older saved copy does not match this questionnaire and was not changed or deleted',
    );
    expect(component.textContent).toContain('Start this questionnaire again below');
    expect(localStorage.getItem(legacyKey)).toBe(JSON.stringify(invalidLegacy));
    expect(localStorage.getItem(progressStorageKey('demo-config', 'DEMO'))).toBeNull();
  });

  it('shows a clear restart path and removes a corrupt current-version progress copy', async () => {
    const currentKey = progressStorageKey('demo-config', 'DEMO');
    localStorage.setItem(currentKey, JSON.stringify({ ...savedSession, ratings: { mental: 23 } }));

    const component = await renderComponent();
    await component.updateComplete;

    expect(component.querySelector('#saved-session-offer')).toBeNull();
    expect(component.querySelector('[role="status"]')?.textContent).toContain(
      'The saved copy does not match this questionnaire and was not used',
    );
    expect(component.textContent).toContain('Start this questionnaire again below');
    expect(localStorage.getItem(currentKey)).toBeNull();
  });

  it('focuses Resume and exposes the exact saved count and choices', async () => {
    const component = await renderComponent();
    component.savedSession = savedSession;
    component.announceSavedSessionOffer(savedSession);
    await component.updateComplete;
    await Promise.resolve();

    const offer = component.querySelector('#saved-session-offer') as HTMLElement;
    const resume = component.querySelector('#resume-saved-questionnaire') as HTMLButtonElement;
    expect(document.activeElement).toBe(resume);
    expect(offer.getAttribute('aria-describedby')).toBe(
      'saved-session-count saved-session-actions',
    );
    expect(resume.getAttribute('aria-describedby')).toBe(
      'saved-session-count saved-session-actions',
    );
    expect(component.querySelector('#saved-session-count')?.textContent).toContain('2 of 21');
    expect(component.querySelector('#saved-session-actions')?.textContent?.trim()).toBe(
      'Resume saved questionnaire. Erase saved answers.',
    );
  });

  it('resolves direct recovery to the first unanswered rating instead of the saved page index', () => {
    expect(resolveDirectResumePosition(
      nasaTlx.items,
      buildQuestionnairePairs(nasaTlx),
      savedSessionAfterThreeRatings.ratings,
      {},
    )).toEqual({ stage: 'ratings', ratingIndex: 3 });
  });

  it('resumes three saved ratings directly at the first unanswered item and focuses its heading', async () => {
    const component = await renderComponent();
    component.savedSession = savedSessionAfterThreeRatings;

    component.restoreSavedSession();
    await component.updateComplete;
    await Promise.resolve();

    const heading = component.querySelector('#rating-heading') as HTMLElement;
    expect(component.stage).toBe('ratings');
    expect(component.ratingIndex).toBe(3);
    expect(heading.textContent).toContain('Performance');
    expect(document.activeElement).toBe(heading);
    expect(component.querySelector('#resume-heading')).toBeNull();
    expect(component.resumeSummaryVisible).toBe(false);
    expect(component.interruptionSummaryShown).toBe(false);
    expect(component.ratings).toEqual(savedSessionAfterThreeRatings.ratings);
  });

  it('creates a delayed live-region change and attempts built-in speech only after prior opt-in', async () => {
    const component = await renderComponent();
    component.savedSession = savedSession;
    component.audioGuidance = true;
    const speakText = vi.spyOn(component, 'speakText').mockImplementation(() => undefined);

    component.announceSavedSessionOffer(savedSession);
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(650);

    expect(component.statusMessage).toBe(
      'Saved questionnaire found. 2 of 21 responses are saved in this browser. Resume saved questionnaire. Erase saved answers.',
    );
    expect(speakText).toHaveBeenCalledWith(component.statusMessage);
  });

  it('provides a user-activated replay route for browsers that block speech after reload', async () => {
    const component = await renderComponent();
    component.savedSession = savedSession;
    const speakText = vi.spyOn(component, 'speakText').mockImplementation(() => undefined);

    component.repeatSavedSessionOffer();

    expect(component.readAloudUsed).toBe(true);
    expect(speakText).toHaveBeenCalledTimes(1);
    expect(speakText.mock.calls[0][0]).toContain('Resume saved questionnaire');
    expect(speakText.mock.calls[0][0]).toContain('Erase saved answers');
  });
});
