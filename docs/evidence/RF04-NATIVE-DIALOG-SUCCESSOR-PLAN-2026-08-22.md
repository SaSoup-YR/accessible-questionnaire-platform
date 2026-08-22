# RF-04 / R3-A14 native recovery-dialog successor — 22 August 2026

Status: **one final structurally different candidate implemented; no F→P claim before exact live VoiceOver + Safari retest.**

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. Immediately before this candidate, the targeted unresolved ledger contained **7** historical F cells.

## Frozen target

R3-A14 requires that, after reloading a valid interrupted questionnaire, the saved count and the Resume/Erase choices are available and that focus reaches **Resume saved questionnaire** in the named VoiceOver + Safari route.

The retained RF-04 repair already closes direct resumption at the first unanswered item and preserves saved answers. Its sole remaining failure is the initial VoiceOver cursor/accessibility-focus placement after reload.

## Why another attempt is justified

The prior follow-up used a Safari-only delayed blur/refocus sequence. It passed automation but repeatedly failed the real VoiceOver + Safari route and was removed. Repeating timing changes, browser sniffing or additional focus calls would not be a materially new mechanism.

This successor changes the interaction structure instead:

- the saved-session choice is rendered as the native HTML `<dialog>` element;
- `showModal()` makes the rest of the questionnaire inert while the decision is open;
- the Resume button is the first action and carries `autofocus`;
- the browser's dialog focusing steps are used, with one immediate in-dialog focus safeguard and no delayed refocus loop;
- the dialog has a visible title and a simple `aria-describedby` description containing the exact saved count and both choices;
- Escape closes the dialog non-destructively and returns focus to a visible **Open saved-questionnaire choices** control;
- reopening returns focus to Resume;
- the existing validated direct-resume and erase handlers remain the source of truth.

## Standards and platform basis

- W3C Technique H102 describes the native HTML dialog as a sufficient focus-order technique and notes that the browser moves focus into an opened modal, returns it on close, and limits keyboard focus to the modal contents.
- The WAI-ARIA Authoring Practices modal-dialog pattern requires focus to move inside a modal and permits initial focus on the most frequently used Continue-style action for a short decision.
- WebKit's implementation guidance states that `showModal()` supplies modal/inert behavior, that manually toggling `open` is not equivalent because proper focus adjustments can be lost, and that `autofocus` identifies the initial focus target.
- W3C's current APG examples caution that browser/assistive-technology support gaps remain possible and require testing in the named real environment. This candidate therefore cannot be adjudicated from DOM focus or WebKit automation alone.

Primary references:

- https://www.w3.org/WAI/WCAG21/Techniques/html/H102
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://webkit.org/blog/12209/introducing-the-dialog-element/

## Mature implementation comparison

The review considered the focus-scope/dialog architectures used by Adobe React Aria/React Spectrum and GitHub Primer as well as the W3C APG implementation. Those systems explicitly manage containment, initial focus and restoration. Adding a framework-scale focus manager to this dependency-light custom element would enlarge the executable and create a second focus architecture.

The retained candidate instead uses the browser's native modal/top-layer implementation and adds only the AQP-specific saved-session actions. This is the smallest structural change that directly addresses the failed accessibility-context transition.

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

Automation must establish that:

1. a valid interrupted session renders an opened native dialog;
2. the dialog has an accessible title and the exact saved count/choices;
3. Resume is the autofocus/active control;
4. Escape/close is non-destructive and exposes a visible reopen action;
5. reopening returns focus to Resume;
6. Resume still reaches the first unanswered item and preserves all committed answers;
7. Erase acts only after explicit activation and removes the stored copy;
8. the complete unit/component, rendered-browser, Chromium/Firefox/WebKit, production, standalone, release and generated-freshness gates remain green.

Automation remains implementation evidence only. It cannot establish the VoiceOver cursor result.

## Final manual stop rule

After an immutable exact-SHA preview is published, run only R3 VoiceOver + Safari:

1. create exactly three saved SUS answers;
2. reload with VoiceOver already on;
3. do not manually navigate after reload;
4. record whether VoiceOver enters the **Saved questionnaire found** dialog and lands on **Resume saved questionnaire**, with the exact `3 of 10` count and both choices available;
5. activate Resume and verify Item 4 receives focus with the three answers retained.

Decision:

- exact automatic dialog/Resume focus plus preserved direct resume → **R3-A14 F→P**;
- VoiceOver remains outside the dialog or requires manual search → retain **R3-A14 residual F**, remove/close the candidate without merge, and freeze prototype repair work.

No further Safari timing, blur/refocus, browser sniffing or forced screen-reader speech will follow a failed native-dialog attempt.