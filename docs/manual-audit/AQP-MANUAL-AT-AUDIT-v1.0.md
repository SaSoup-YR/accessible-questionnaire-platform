# AQP manual assistive-technology audit v1.2

Status: **protocol ready; audit not yet executed**
Protocol revised: 2026-08-10
Release under test: **record the immutable release tag and commit SHA before testing**
Deployed URL: **record after the verified build is deployed**

## Evidence boundary

This is a manual technical audit, not a study with disabled participants. It can
show what named browser and assistive-technology combinations expose on named AQP
screens. It cannot establish usability, benefit for disabled users, score
equivalence, universal accessibility or complete WCAG conformance.

An outcome is a pass only when the mechanism is usable in the tested route. A
live region, label or focus call that exists in the markup but does not produce a
timely, understandable announcement or operable control is a **fail**, not a pass.

Do not publish an empty cell as a pass. Until a required route has been run, mark
it **NT (not tested)** and report the corresponding claim as **Not evidenced**.

## Outcome and severity codes

- **P — Pass:** the expected information and operation are available without an
  undocumented workaround.
- **F — Fail:** the expected information or operation is missing, late,
  misleading, duplicated to the point of being unusable, or cannot be operated.
- **NA — Not applicable:** the criterion genuinely does not apply to the state or
  route; give a reason.
- **NT — Not tested:** no observation exists. NT is never counted as a pass.
- **S1 minor:** noticeable inconvenience with an immediate safe route.
- **S2 major:** task can continue only after a substantial workaround or repeated
  recovery.
- **S3 critical:** blocks completion, causes an unintended response, loses data,
  or presents a false success.

## Frozen test environments

Record exact versions; do not substitute one engine as evidence for another.

| Route ID | Required combination | Version and configuration | Auditor/date | Status |
| --- | --- | --- | --- | --- |
| R1 | NVDA + Firefox on Windows | Windows: ___; NVDA: ___; Firefox: ___; NVDA speech/browse-mode settings: ___ | ___ | NT |
| R2 | NVDA + Chrome on Windows | Windows: ___; NVDA: ___; Chrome: ___; NVDA speech/browse-mode settings: ___ | ___ | NT |
| R3 | VoiceOver + Safari on macOS | macOS: ___; VoiceOver: ___; Safari: ___; Quick Nav/verbosity settings: ___ | ___ | NT |
| R4 | One operating-system voice-control route | Product/version: ___; OS: ___; browser: ___; command-overlay settings: ___ | ___ | NT |

Use a clean browser profile. Keep the same questionnaire definition, participant
code pattern and assigned answers across R1–R4. Browser extensions must be listed.
Do not enter personal or research data.

## Fixed test data

- SUS participant code: `AUDIT-SUS-[route]`.
- SUS answer vector: `5, 1, 4, 2, 3, 5, 1, 4, 2, 3`.
- Expected SUS score: `50` under Brooke's scoring rule, implemented by the
  configured `sus-standard-v1` scorer.
- NASA-TLX pairwise case: six ratings of `50`, then inspect the first pair.
- Recovery case: save exactly three of ten SUS answers, reload, and inspect the
  offer before resuming.
- Voice proposal phrase: `number four`.
- Voice safety phrase: `not four`; the interface must not propose or record 4.
- Imported label case: use the committed five-point German fixture with endpoint
  labels and labelled middle options.

## How to record evidence

For every required cell, record:

1. P, F or NA;
2. the exact spoken announcement where the check concerns speech;
3. the control or element that receives focus;
4. the exact voice command and observed target for R4;
5. an evidence ID (`R1-A06`, for example);
6. issue ID and severity for every failure.

Quotes must be transcribed from the observed output, not copied from source code.
Record unexpected silence as `[no announcement]` and harmful repetition exactly.

## State-by-state audit record

Complete every route column with `P/F/NA — exact observation (evidence ID)`.

### Introduction and item entry (A01–A04)

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | 1.3.1, 1.3.2, 2.4.6 | Open the participant introduction from its generated link. | One useful page heading, short task purpose, logical reading order and one Start action are exposed before optional detail. | NT | NT | NT | NT |
| A02 | 3.3.2, 4.1.2 | Inspect the participant-code field. | The link-supplied pseudonymous code is present, editable, labelled and not announced as invalid before Start. | NT | NT | NT | NT |
| A03 | 1.3.1, 4.1.2 | Expand and collapse “Adjust accessibility support (optional)”. | Name, role and expanded state are exposed; the full audio-guidance panel occurs here once and is not repeated on item screens. | NT | NT | NT | NT |
| A04 | 1.3.1, 2.4.3, 2.4.6 | Start SUS and arrive at item 1. | Focus moves to the item heading; item number/progress and complete item statement are announced once in a useful order. | NT | NT | NT | NT |

### Item operation and voice availability (A05–A09)

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A05 | 1.3.1, 3.3.2, 4.1.2 | Navigate all response options for item 1 without selecting. | One required radio group is exposed with its question, each option has its value and answer label, and arrow-key/state feedback is usable. | NT | NT | NT | NT |
| A06 | 2.4.3, 3.3.1, 3.3.3, 4.1.3 | Activate Next with no answer. | “There is a problem” and the corrective message are announced; focus moves to a useful error location without requiring a search. Record exact speech. | NT | NT | NT | NT |
| A07 | 2.4.3, 3.2.2 | Correct the error, choose 5 and activate Next. | Selection alone does not change screen; Next moves to item 2 and focus reaches its heading. | NT | NT | NT | NT |
| A08 | 1.3.1, 2.4.3, 4.1.2 | Complete NASA-TLX ratings and enter the first pairwise comparison. | The comparison prompt, both named choices, checked state and progress are exposed as one operable group. | NT | NT | NT | NT |
| A09 | 3.3.2, 4.1.2, 4.1.3 | Open built-in voice input on a rating screen. | Supported routes expose a labelled Start control and instructions; unsupported routes expose a clear unavailable state rather than a hidden or dead control. | NT | NT | NT | NT |

### Voice listening and safety (A10–A13)

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A10 | 4.1.3 | Start built-in voice recognition and wait without speaking. | Listening status is announced promptly and once; the interface remains cancellable. Record exact speech and delay. | NT | NT | NT | NA unless this route also uses built-in recognition: ___ |
| A11 | 2.4.3, 3.3.3, 3.3.4, 4.1.3 | Say `number four` and wait at the proposal. | The proposed value/label is announced, remains uncommitted and focus reaches a useful Confirm/Reject control. | NT | NT | NT | NA unless tested through built-in recognition: ___ |
| A12 | 3.3.4 | First say `not four`; then say `number four`, reject the proposal, repeat it and confirm. | `not four` must not propose or record 4. Reject leaves the stored answer unchanged; Confirm records only the stated proposal. | NT | NT | NT | NA unless tested through built-in recognition: ___ |
| A13 | 3.3.1, 3.3.3, 4.1.3 | Trigger the no-speech/error state. | A specific error and safe next action are announced; no answer is committed. | NT | NT | NT | NA unless tested through built-in recognition: ___ |

### Recovery, review and submission (A14–A18)

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A14 | 2.4.3, 4.1.3 | After three SUS answers, reload and wait on the saved-progress offer. | Focus reaches Resume; the exact saved count `3 of 10`, Resume and Erase choices are available and announced. Record exact speech. | NT | NT | NT | NT |
| A15 | 2.4.3, 3.2.2 | Resume the saved session. | The three answers remain; the logical next item and heading receive focus; no answer changes automatically. | NT | NT | NT | NT |
| A16 | 1.3.1, 2.4.6, 2.5.3, 3.3.4, 4.1.2 | Reach the SUS review screen and navigate each record. Pay particular attention to Item 3 = 4. | Every record exposes the full item statement and selected value. If the questionnaire declares a label for that value, the label is visible; otherwise the declared scale endpoints are visible so the position can be interpreted without invented response wording. Its visible **Change item N answer** control is unique, begins its accessible name with the same words and is available to the declared gaze route. | NT | NT | NT | NT |
| A17 | 2.4.3, 3.3.4, 4.1.3 | Note item 2's value and input route. Open item 2, select 5 and Cancel. Reopen item 2, select 5 and Save. | Cancel returns focus to review, truthfully announces that the original answer was kept, and leaves the original value, route, recovery record and calculated score unchanged. Save alone commits 5, returns focus to item 2, announces the updated label and leaves every other answer unchanged. Record exact speech for both paths. | NT | NT | NT | NT |

#### Submission (A18)

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A18 | 3.3.4, 4.1.3 | Submit the reviewed answers. | Completion and storage status are truthful and announced; a failure must not be presented as success. | NT | NT | NT | NT |

### Route-wide and imported-scale checks (A19–A23)

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A19 | 2.1.1, 2.1.2 | Repeat the complete route using keyboard commands only. | All functions are reachable and escapable; no keyboard trap occurs in details, voice, recovery, review or completion states. | NT | NT | NT | NT |
| A20 | 2.4.7, 2.4.11 | Inspect visible focus on every interactive control at 100% and 200% zoom. | Focus is visible and not fully obscured. Screen-reader routes still record the visual result separately. | NT | NT | NT | NT |
| A21 | 2.5.3 | In R4, use the visible wording to activate Start, an answer, Next, **Change item 2 answer**, Save and Submit. | Each command reaches the intended single control; visible label text occurs at the start of the accessible name. Record commands verbatim and record any disambiguation menu as a failure of the one-command target check. | NA | NA | NA | NT |
| A22 | 1.4.10 | At 320 CSS pixels and at 200% zoom, inspect introduction, item, pairwise, error, voice, recovery, review and completion. | Content reflows without two-dimensional scrolling for ordinary content; controls and announcements remain usable. | NT | NT | NT | NT |
| A23 | 1.3.1, 4.1.2 | Open the imported five-point German item. | Endpoint labels are announced through the legend and are not repeated visually inside endpoint options; the three distinct middle labels remain visible and exposed with their options. | NT | NT | NT | NT |

### Remaining reachable runner and recovery states (A24–A33)

These rows close the state inventory in
`docs/PARTICIPANT-RUNNER-STATE-INVENTORY-v1.md`. Qualtrics rows require the
approved frozen bridge test survey. Gaze rows require explicit webcam consent
from the auditor and use no participant/research data. If a route is technically
incapable of the mechanism, record NA with the observed limitation; do not turn
NA into a pass for that mechanism.

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A24 | 3.3.1, 3.3.3, 4.1.3 | Open the frozen invalid-link fixture. | The problem and safe next action are exposed; Start is disabled; no questionnaire content is presented as valid. Record exact speech. | NT | NT | NT | NT |
| A25 | 2.4.3, 3.3.4, 4.1.3 | Complete the local SUS route, reopen the same participant link and inspect the recovered-completion offer. | The page distinguishes a local backup from confirmed collection, advises against repeating, and exposes both recovery downloads. | NT | NT | NT | NT |
| A26 | 3.3.1, 3.3.3, 4.1.3 | In the approved Qualtrics fixture, inspect the bridge connecting state and then the frozen bridge-failure route. | Connecting is exposed as status; failure is exposed as an alert with Start unavailable and no false connection claim. Record exact speech. | NT | NT | NT | NT |
| A27 | 2.4.3, 3.3.4, 4.1.3 | Submit through the approved Qualtrics fixture, then run its frozen advance-failure callback. | The short transition does not demand action; an unconfirmed recording produces a focused actionable alert and never says the result was recorded. | NT | NT | NT | NT |
| A28 | 3.3.1, 3.3.3, 3.3.4, 4.1.3 | Run the frozen sink-refusal and browser-storage-failure fixtures. | Answers remain reviewable; Retry, Change and backup actions are exposed; storage/host failure is not hidden as success. | NT | NT | NT | NT |

#### Support and alternative-input states (A29–A33)

| ID | WCAG 2.2 success criterion | Screen/state and fixed action | Required observable result | R1 NVDA/Firefox | R2 NVDA/Chrome | R3 VoiceOver/Safari | R4 OS voice control |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A29 | 1.3.1, 3.3.2, 4.1.2 | Select the NASA-TLX smiley-landmark view and inspect one item. | Every visible landmark has one useful name/value, the official precise scale remains available through the declared route, and the experimental view is not silently applied to unsupported definitions. | NT | NT | NT | NT |
| A30 | 1.3.1, 2.1.2, 2.4.3, 4.1.2 | Expand gaze setup, start it, inspect positioning, then enter calibration. | Purpose, camera/privacy warning, dialog name, Cancel route and focus containment/escape are usable; no webcam starts before activation. | NT | NT | NT | NT |
| A31 | 3.3.4, 4.1.3 | Produce one gaze proposal without confirming it. | Looking proposes but does not commit; proposed target and separate Confirm/Cancel actions are exposed; Cancel leaves the response unchanged. | NT | NT | NT | NT |
| A32 | 1.3.1, 3.3.2, 4.1.2 | Open the synthetic seven-position semantic-differential fixture. | Positions are visually unnumbered, programmatic names include ordinal position and endpoints, and no unsupported score-equivalence statement appears. | NT | NT | NT | NT |
| A33 | 3.2.2, 4.1.3 | Change text size, recovery and audio settings one at a time. | Each change produces one timely, accurate status message and does not move focus or change an answer. Record exact speech and harmful duplication. | NT | NT | NT | NT |

## Issue log

| Issue ID | Route/check | Observed result | Expected result | Severity | Reproduction steps | Resolution/re-test |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — |

## WCAG result summary

Report criterion outcomes separately by route. A criterion is a pass for a route
only if every applicable check mapped to it passes. One failed applicable check
makes that route/criterion a fail. NT checks keep it Not evidenced.

### Structure, navigation and operation criteria

| WCAG 2.2 SC | R1 P/F/NA/NT | R2 P/F/NA/NT | R3 P/F/NA/NT | R4 P/F/NA/NT | Evidence IDs and notes |
| --- | --- | --- | --- | --- | --- |
| 1.3.1 Info and Relationships | NT | NT | NT | NT | |
| 1.3.2 Meaningful Sequence | NT | NT | NT | NT | |
| 1.4.10 Reflow | NT | NT | NT | NT | |
| 2.1.1 Keyboard | NT | NT | NT | NT | |
| 2.1.2 No Keyboard Trap | NT | NT | NT | NT | |
| 2.4.3 Focus Order | NT | NT | NT | NT | |
| 2.4.6 Headings and Labels | NT | NT | NT | NT | |
| 2.4.7 Focus Visible | NT | NT | NT | NT | |
| 2.4.11 Focus Not Obscured (Minimum) | NT | NT | NT | NT | |
| 2.5.3 Label in Name | NT | NT | NT | NT | |

### Input, error and status criteria

| WCAG 2.2 SC | R1 P/F/NA/NT | R2 P/F/NA/NT | R3 P/F/NA/NT | R4 P/F/NA/NT | Evidence IDs and notes |
| --- | --- | --- | --- | --- | --- |
| 3.2.2 On Input | NT | NT | NT | NT | |
| 3.3.1 Error Identification | NT | NT | NT | NT | |
| 3.3.2 Labels or Instructions | NT | NT | NT | NT | |
| 3.3.3 Error Suggestion | NT | NT | NT | NT | |
| 3.3.4 Error Prevention | NT | NT | NT | NT | |
| 4.1.2 Name, Role, Value | NT | NT | NT | NT | |
| 4.1.3 Status Messages | NT | NT | NT | NT | |

## Quantified audit summary

Complete only after every required cell has P, F or NA.

- Required route/check cells: ___
- Passed: ___
- Failed: ___
- Not applicable with reasons: ___
- Not tested: ___ (must be zero before calling the audit complete)
- WCAG route/criterion passes: ___ / ___ applicable
- S1 issues: ___; S2 issues: ___; S3 issues: ___
- Markup mechanisms present but unusable in actual announcement/operation: ___

## Publication wording

Use only after replacing the brackets with observed counts:

> A manual technical audit covered [N] pre-specified state checks across
> NVDA/Firefox, NVDA/Chrome, VoiceOver/Safari and [OS voice-control route].
> Results were reported per WCAG 2.2 success criterion as pass, fail or not
> applicable, with exact announcements for dynamic states. [N/N] applicable
> route/check cells passed and [N] failed. This is technical conformance evidence
> for the named configurations, not evidence of benefit or usability for disabled
> users.

## Normative reference

- [W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*](https://www.w3.org/TR/WCAG22/)
- [W3C, *How to Meet WCAG 2.2 (Quick Reference)*](https://www.w3.org/WAI/WCAG22/quickref/)
