# AQP Code Overview

This document explains the current code in simple terms. It is not a substitute for the source or tests.

## Public entry points

| Path | Purpose |
| --- | --- |
| `source/index.html` | Platform landing page, demonstration selection, and configured participant entry. |
| `source/study.html` | Researcher setup entry. |
| `source/src/main.ts` | Chooses between the landing page and the shared participant runner. |
| `source/src/study-main.ts` | Starts the researcher setup component. |

## Main participant code

| File | Purpose |
| --- | --- |
| `source/src/accessible-nasa-tlx.ts` | Shared participant runner. It handles the introduction, questions, comparisons, review, submission, local backup, and optional support controls. The historical filename is retained for source provenance. |
| `source/src/questionnaire-definition.ts` | Defines the supported questionnaire data format and rejects invalid or incompatible definitions. |
| `source/src/scoring.ts` | Contains the allowlisted scoring implementations for weighted NASA-TLX, raw NASA-TLX, SUS, and the documented generic strategies. |
| `source/src/study.ts` | Creates and validates study configurations, participant links, result records, definition fingerprints, and local exports. |
| `source/src/result-sink.ts` | Sends a completed record to local storage or the approved Qualtrics bridge and reports failure states without claiming that data was recorded when it was only staged. |
| `source/src/voice-input.ts` | Parses browser speech-recognition alternatives. It uses strict matching, checks negation, shows a proposal, and requires confirmation before changing an answer. |
| `source/src/webgazer-adapter.ts` | Loads and limits the optional experimental gaze route. Ordinary controls remain available. |

## Researcher setup and import

| File | Purpose |
| --- | --- |
| `source/src/study-conductor.ts` | Researcher workflow for selecting or importing a questionnaire, choosing support and collection settings, and generating participant links. |
| `source/src/custom-questionnaire.ts` | Builds a small questionnaire inside the supported data profile. |
| `source/src/platform-questionnaire-import.ts` | Reviews and converts the documented subset of Qualtrics QSF and LimeSurvey LSS, LSG, and LSQ exports. Unsupported content is blocked or named for confirmation. |

## Accessibility and recovery modules

| File | Purpose |
| --- | --- |
| `source/src/accessibility-utils.ts` | Shared focus and reveal operations. |
| `source/src/accessibility-announcer.ts` | Shared status-notification channel. |
| `source/src/rf04-saved-session-recovery.ts` | Restores validated interrupted progress. |
| `source/src/rf04-native-recovery-dialog.ts` | Opens saved-progress choices in a native modal dialog. |
| `source/src/rf05-reflow.css` | Protects the participant interface at narrow CSS widths. |
| `source/src/rf06-speech-lifecycle.ts` | Controls page-level voice listening, stop, timeout, and recovery states. |
| `source/src/rf08-smiley-voice-access.css` | Keeps the real smiley radio controls visible to speech-control target numbering. |
| `source/src/rf09-support-setting-feedback.ts` | Reports changes to text size, recovery, and automatic audio without changing the selected questionnaire answer. |

The `rf` names record the repair-family history. They are not separate products. They are retained in the frozen implementation to avoid a large post-evaluation refactor.

## Qualtrics integration

| Path | Purpose |
| --- | --- |
| `integrations/qualtrics/question-html-template.html` | HTML pasted into the reviewed Qualtrics question. |
| `integrations/qualtrics/qualtrics-question.js` | Parent-page bridge, version handshake, result staging, native advance, and failure recovery. |
| `integrations/qualtrics/embedded-data-fields.txt` | Required Qualtrics fields. |
| `integrations/qualtrics/end-of-survey-message.txt` | Reviewed completion message. |

## Tests

| Path | Purpose |
| --- | --- |
| `source/tests/*.test.ts` | Unit and component tests for definitions, scoring, state, integrity, recovery, import, and accessibility contracts. |
| `source/tests/e2e/` | Rendered participant and failure-recovery tests. |
| `source/tests/e2e-support/` | Cross-browser mechanism, reflow, smiley-target, and setting-feedback tests. |
| `source/tests/fixtures/` | Synthetic questionnaire and source-platform files used only by tests. |

Automated tests cannot prove that a real screen reader or live speech-recognition service produces a specific result. The manual evidence records are kept separately in `docs/manual-audit/` and `docs/evidence/`.

## Build outputs

| Path | Purpose |
| --- | --- |
| `assets/` | Generated JavaScript and CSS served by GitHub Pages. |
| `index.html` and `study.html` | Generated public entry pages. |
| `questionnaires/` | Generated distributable copies of the source questionnaire definitions and schema. |
| `source/demo/accessible-questionnaire-platform-v0.8.html` | Self-contained participant build. |

Run `npm run build:release` from `source/` to regenerate these files. Do not edit generated bundles by hand.
