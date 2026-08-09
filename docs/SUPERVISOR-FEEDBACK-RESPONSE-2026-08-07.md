# Response to supervisor review, 7 August 2026

## Decision

The dissertation will use the supervisor's recommended **technical contribution
route for the 21 August deadline**. The existing asynchronous researcher form and
four-to-six-person participant comparison are withdrawn. They must not be used for
recruitment or presented as evidence that AQP is more accessible or psychometrically
equivalent to a standard survey administration.

This is a scope correction, not a claim that user involvement is unnecessary. A
proper observed researcher study and a disabled-participant study remain future
work requiring a confirmed ethics route, appropriate recruitment, observation and
analysis plans.

## Code corrections in the current candidate

| Supervisor finding | Correction | Release evidence required |
| --- | --- | --- |
| Review showed only item number and numeric value. | Every review card now shows the item statement, stored value with its visible answer label, and input route, with a direct **Change this answer** control. Saving or cancelling returns focus to that review item. | Component regression plus rendered-browser review/edit/focus test. |
| Participant code caused an initial validation failure. | The conductor creates a pseudonymous code per link. The participant page prefills it from the URL and keeps the field editable as a fallback. A link code overrides stale tab-scoped data and becomes the recovery key for that run. | Prefill, edit, isolation and no-initial-error regression tests. |
| Intro and repeated audio guidance obscured the task. | The intro now contains the task essentials only. Audio help is in one collapsed support disclosure and is not repeated above every item. | Rendered word-count and critical-state checks. |
| The result could not reveal which exact definition was displayed. | A stable SHA-256 definition fingerprint is placed in the configuration, generated package, result record, CSV and Qualtrics fields. A stale fingerprint is rejected at link loading and again at submission; the latter remains on Review and focuses an explicit error. | Determinism, altered-definition rejection, submission-blocking UI regression and fresh Qualtrics row. |
| jsdom axe tests were described too strongly. | Playwright plus `@axe-core/playwright` serves the production build and scans rendered Chromium states, uses actual Tab traversal, checks computed focus styling, target dimensions and 320-CSS-pixel overflow, and publishes axe JSON/HTML plus Playwright HTML evidence in CI. jsdom tests are retained only as structural regression tests. | CI must run the browser suite; zero axe findings are not a WCAG or usability claim. |
| UEQ-S presentation used visible 1-7 numbers. | Semantic-differential positions are visually unnumbered; accessible names identify position and endpoints; stored values remain 1-7 and score contributions remain -3 to +3. | Rendered-browser test. Public redistribution remains blocked pending permission; see `UEQS-RELEASE-GATE.md`. |
| A response endpoint was repeated in the instruction, anchor row and endpoint option. | The legend now gives only the action. A fully labelled imported scale shows each label once, inside its option, and suppresses the duplicate anchor row. Unlabelled scales show their endpoints once above numeric options. Complete option names remain available to assistive technology. | Component regression plus rendered-browser check at desktop and 320 CSS pixels. |
| Plain-language support was inconsistent. | Built-in scored instruments now retain sourced item statements. Plain language is used for interface instructions and errors. A researcher may supply clearly separated supplemental help in a custom definition; that definition receives a distinct fingerprint and its use is logged. | Definition/support-gate tests and the documented boundary below. |

The definition fingerprint is an integrity identifier, not a signature. It lets a
researcher compare a returned record with the saved expected fingerprint. Anyone who
can rewrite both an unsigned link and its fingerprint can still create a different,
self-consistent configuration. The dissertation must state this limitation.

## Frozen contribution framing

AQP is **not** claimed to invent JSON-defined questionnaires, save/resume, QSF/LSS
import or a universal questionnaire platform. Those patterns and features already
exist, and the implementation supports only a bounded single-scale profile with
allowlisted scorers.

The defensible contribution is an evidence-led engineering case study of preserving
measurement integrity while adding accessibility-oriented interaction to a shared
runner. Its strongest concrete outputs are:

1. a conservative definition/import/result pipeline with safe rejection, recomputed
   scoring, exact-definition fingerprints and auditable provenance;
2. a corrected sequential runner with direct review/correction, recovery, explicit
   status/focus behaviour and confirmed voice proposals; and
3. a reproducible technical-evidence harness across critical rendered states, with
   explicit claim boundaries and documented unresolved measurement questions.

The dissertation does not answer whether linearised administration produces scores
equivalent to standard matrix administration. Fixed answer vectors test software
fidelity only. A psychometric equivalence study requires real construct responses,
matched or explicitly whole-design conditions, and an a-priori powered analysis.

## Evaluation decision

For this dissertation release, the evaluation contains no human-participant result.
The primary evidence is:

- hand-derived score oracles and exact stored-value comparisons;
- supported and adverse import fixtures;
- definition-fingerprint and provenance checks;
- correction, reload and submission state checks;
- a fresh synthetic Qualtrics route check for bridge `0.8.8-q8`; and
- rendered-browser accessibility regression over named states.

The old participant comparison and self-administered researcher forms are superseded.
If human work resumes, the researcher study must be observed with task success, time,
assists, errors, a planted discrepancy, SEQ and SUS; the disabled-participant study
must be separately redesigned and preregistered.

## Release blockers

The candidate must not be tagged or deployed as a new evidence release until:

1. rendered Chromium CI passes and publishes its report;
2. a fresh synthetic UCL Qualtrics row contains the correct definition fingerprint,
   values, score and provenance for bridge `0.8.8-q8`;
3. UEQ-S item-text redistribution permission is obtained in writing or UEQ-S is
   removed from the public release; and
4. a repository licence is chosen by the repository owner, `CITATION.cff` is checked,
   and the exact release is archived.

## Evaluation literature used for this correction

- Ledo et al. (2018), *Evaluation Strategies for HCI Toolkit Research*,
  https://doi.org/10.1145/3173574.3173610
- Olsen (2007), *Evaluating User Interface Systems Research*,
  https://doi.org/10.1145/1294211.1294256
- Liu and Cernat (2018), *Item-by-item Versus Matrix Questions*,
  https://doi.org/10.1177/0894439316674459
- Couper et al. (2013), *The Design of Grids in Web Surveys*,
  https://doi.org/10.1177/0894439312469865
- Playwright accessibility testing guidance,
  https://playwright.dev/docs/accessibility-testing
