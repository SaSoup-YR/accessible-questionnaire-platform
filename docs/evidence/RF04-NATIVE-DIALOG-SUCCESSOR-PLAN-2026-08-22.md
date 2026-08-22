# RF-04 / R3-A14 native recovery-dialog successor — 22 August 2026

Status: **targeted manual closure achieved on the exact VoiceOver + Safari route; R3-A14 F → P.**

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. Immediately before this candidate, the targeted unresolved ledger contained **7** historical F cells. After the exact manual adjudication, **6** remain.

## Frozen target

R3-A14 requires that, after reloading a valid interrupted questionnaire, the saved count and the Resume/Erase choices are available and that focus reaches the recovery decision in the named VoiceOver + Safari route without a search of the underlying page.

The retained RF-04 repair already closed direct resumption at the first unanswered item and preserved saved answers. Its sole remaining failure was the initial VoiceOver cursor/accessibility-focus placement after reload.

## Why another attempt was justified

The prior follow-up used a Safari-only delayed blur/refocus sequence. It passed automation but repeatedly failed the real VoiceOver + Safari route and was removed. Repeating timing changes, browser sniffing or additional focus calls would not have been a materially new mechanism.

This successor changed the interaction structure instead:

- the saved-session choice is rendered as the native HTML `<dialog>` element;
- `showModal()` makes the rest of the questionnaire inert while the decision is open;
- the Resume button is the first action and carries `autofocus`;
- the browser's dialog focusing steps are used, with one immediate in-dialog focus safeguard and no delayed refocus loop;
- the dialog has a visible title and a simple `aria-describedby` description containing the exact saved count and both choices;
- Escape closes the dialog non-destructively and returns focus to a visible **Open saved-questionnaire choices** control;
- reopening returns focus to Resume;
- the existing validated direct-resume and erase handlers remain the source of truth.

## Standards and platform basis

- W3C Technique H102 describes the native HTML dialog as a sufficient focus-order technique and notes that the browser moves focus into an opened modal, returns it on close and limits keyboard focus to the modal contents.
- The WAI-ARIA Authoring Practices modal-dialog pattern requires focus to move inside a modal and permits initial focus on the most frequently used Continue-style action for a short decision.
- WebKit's implementation guidance states that `showModal()` supplies modal/inert behavior, that manually toggling `open` is not equivalent because proper focus adjustments can be lost, and that `autofocus` identifies the initial focus target.
- W3C's APG examples caution that browser/assistive-technology support gaps remain possible and require testing in the named real environment. The candidate was therefore not adjudicated from DOM focus or WebKit automation alone.

Primary references:

- https://www.w3.org/WAI/WCAG21/Techniques/html/H102
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://webkit.org/blog/12209/introducing-the-dialog-element/

## Mature implementation comparison

The review considered the focus-scope/dialog architectures used by Adobe React Aria/React Spectrum and GitHub Primer as well as the W3C APG implementation. Those systems explicitly manage containment, initial focus and restoration. Adding a framework-scale focus manager to this dependency-light custom element would enlarge the executable and create a second focus architecture.

The retained candidate instead uses the browser's native modal/top-layer implementation and adds only the AQP-specific saved-session actions. This was the smallest structural change that directly addressed the failed accessibility-context transition.

## Bounded implementation

Files added or changed:

- `source/src/rf04-native-recovery-dialog.ts`;
- `source/src/rf04-native-recovery-dialog.css`;
- `source/src/main.ts`;
- `source/tests/rf04-native-recovery-dialog.test.ts`;
- `source/tests/e2e/rf04-saved-session-recovery.spec.ts`.

The candidate does **not** change:

- questionnaire content, answer values or scoring;
- saved-session validation or immutable definition snapshots;
- participant-code binding;
- the first-unanswered-item resolution;
- answer/input-route restoration;
- Qualtrics collection or submission;
- any RF-01, RF-06, RF-07, RF-08 or RF-09 behavior.

## Automated gates

Automation established that:

1. a valid interrupted session renders an opened native dialog;
2. the dialog has an accessible title and the exact saved count/choices;
3. Resume is the autofocus/active control;
4. Escape/close is non-destructive and exposes a visible reopen action;
5. reopening returns focus to Resume;
6. Resume reaches the first unanswered item and preserves all committed answers;
7. Erase acts only after explicit activation and removes the stored copy;
8. the complete unit/component, rendered-browser, Chromium/Firefox/WebKit, production, standalone, release and generated-freshness gates remain green.

Exact source/runtime candidate: `0444d6f8a3a77f7cb9409d79c01a75ff42d9471d`.

Canonical workflow `32542362335` completed successfully:

- 26/26 test files and 241/241 tests passed;
- native-dialog RF-04 tests 4/4 passed;
- quantified technical evaluation passed;
- rendered-browser accessibility passed;
- Chromium, Firefox and WebKit support routes passed;
- production, standalone and release builds passed;
- committed generated-release freshness passed.

Automation remained implementation evidence only; it did not replace the VoiceOver observation.

## Final manual result

The exact immutable SUS preview was run on R3 VoiceOver + Safari after saving exactly three answers and reloading with VoiceOver already active.

Observed after reload:

> Saved questionnaire found, web dialog, with 6 items

The VoiceOver focus ring entered the named modal rather than remaining on the underlying page. The modal exposed `3 of 10 responses are saved in this browser`, Resume and Erase. The first VoiceOver caption named the containing dialog rather than repeating the Resume label; this exact wording is preserved. On the same exact candidate, automated evidence establishes Resume as the active autofocus control, and the live route showed that the primary action was immediately operable without searching outside the recovery context.

After activating Resume, VoiceOver reported:

> heading level 2, Item 4, Item 4, region

The page showed `Ratings: 3 of 10 responses completed`, confirming that the first three answers were retained and the logical next item received focus.

Persistent adjudication record:

`docs/evidence/RF04-NATIVE-DIALOG-POSTFIX-MANUAL-AUDIT-2026-08-22.md`

## Decision

- **R3-A14: F → P**;
- **R3-A15: P retained**;
- RF-04 is now closed for the six historical A14/A15 failure cells;
- the targeted unresolved ledger decreases from **7 to 6**;
- no further Safari timing, blur/refocus, browser sniffing or forced screen-reader speech work will be undertaken.

This remains a bounded technical result for the named route, not a claim of universal accessibility, complete WCAG conformance, usability or disabled-user benefit.