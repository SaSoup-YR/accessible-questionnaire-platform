# Accessibility evidence boundary

## What each automated layer can establish

### jsdom component checks

These tests protect DOM structure, names, relationships, live-region content and
regression behaviour. jsdom has no layout engine. These tests do not establish focus
visibility, reflow, target size, announcement order in an assistive technology, or
colour contrast in a rendered browser. Regex checks of CSS tokens are implementation
guards only.

### Rendered Chromium checks

Playwright serves the production build, opens the rendered application and scans
named states with `@axe-core/playwright`. The suite also uses the Tab key, inspects
computed focus styling, measures critical target dimensions and checks horizontal
overflow. Every state is checked at 1280, 768 and 320 CSS-pixel widths, with a
Chromium CDP page-scale factor of 2.0 and the corresponding 640 CSS-pixel reflow
layout. It covers introduction, missing-answer error, voice listening, confirmed-
voice proposal, voice-recognition error, item, recovery, review, completion,
NASA-TLX pairwise, semantic-differential and fully labelled imported-scale states.

A zero axe count means no automatically detectable violation was found in those
states under the reported browser, viewport and rule tags. It is not a full WCAG
conformance result and is not evidence that a screen-reader or voice-input user can
complete the task.

### Manual assistive-technology technical audit

The versioned audit protocol requires every participant screen to be walked
through with NVDA/Firefox, NVDA/Chrome, VoiceOver/Safari and one operating-system
voice-control route. It records pass, fail or not applicable per WCAG success
criterion and exact announcements for dynamic states. A mechanism present in the
markup but not announced usefully is a failure. Until the audit is executed, its
cells remain **Not tested** and cannot support a claim.

### Disabled-user benefit evidence

Representative-user work is required for claims about actual route usability,
benefit or barrier removal. The current dissertation route does not collect that
evidence and therefore does not claim that AQP is generally "more accessible".

## Reproducibility

CI builds the production site, runs `npm run test:browser` after installing Chromium
and uploads:

- `docs/evidence/axe-browser-report.json`;
- `docs/evidence/axe-browser-report.html`; and
- an HTML Playwright report and traces for failed runs.

The same counts and per-state results are written to the GitHub Actions job summary,
so the evidence can be inspected without treating a green check mark as the result.
The downloadable artifact is retained for 90 days. The workflow can also be run
manually for an exact revision.

The report records the exact revision, generation time, Chromium version, profile,
requested and observed scale, pre-specified scanned states, rule tags, violations,
incomplete checks, horizontal overflow and measured critical targets for every
state. A missing state/profile combination, undersized critical target or overflow
failure fails the suite. An incomplete axe result must be inspected rather than
silently counted as a pass.

## Source

Playwright's own guidance states that automated accessibility testing detects only
some problems and recommends combining it with other methods:
https://playwright.dev/docs/accessibility-testing
