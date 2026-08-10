# Observer Coding Sheet

**Activity:** Observed Evaluation of Questionnaire Study-Setup Workflows
**Status:** Protocol draft only; use only after written amendment approval.
**Version:** 1.1, 10 August 2026

## Session record

| Field | Record |
| --- | --- |
| Participant code | |
| Session date/time | |
| Observer | |
| Consent/PIS versions checked | |
| Recording consent active | Yes / No — stop if No |
| Allocation slot and assigned order | S01–S08; AQ / QA |
| Allocation list version / seed evidence ID | |
| AQP release tag / SHA / URL | |
| Qualtrics template ID / checksum | |
| End-state map / measures-sheet versions | |
| Device, OS, browser | |
| Prior questionnaire tools / number of studies | |
| Protocol deviation or outage | |

## Condition log — complete once for AQP and once for Qualtrics

**Condition:** AQP / Qualtrics
**Started at first system action:** ____  **Participant declaration/limit:** ____
**Researcher-owned outage/break seconds:** ____  **Active seconds:** ____

| Time | Event/category | Recovered? | Assist? | Critical? | Final effect / note |
| --- | --- | --- | --- | --- | --- |
| | content/order; labels/values; required; scoring/name; code/data; collection/link; navigation; false completion | Yes / No | exact observer words or None | Yes / No | |
| | | | | | |
| | | | | | |
| | | | | | |

Critical = an unrecovered error that fails an end-state checkpoint or leaves an
incorrect participant/data identity, scoring rule, stored response value or
unusable participant link. A recovered error remains counted but is not critical
in the final artefact.

### Immediate post-condition measures

Administer the fixed Post-Condition Measures Sheet before verification or
discussion.

| Field | Record |
| --- | --- |
| Measures sheet version / evidence ID | |
| SEQ (1–7 or M) | |
| SUS raw responses 1–10 | |
| SUS score (0–100 or M; no imputation) | |
| Any declined/missing item | |

### Untimed end-state verification — run after both post-condition sheets

Use vector `5, 1, 4, 2, 3, 5, 1, 4, 2, 3`; expected `SUS score = 50`.
Do not repair the participant's configuration. Verification actions/time are not
participant task time and are not assists.

**Verification started:** ____  **Ended:** ____  **Export evidence ID:** ____

| Check | Pass / Fail | Evidence or exact difference |
| --- | --- | --- |
| Exact title/task in the platform-specific visible location | | |
| AQP local collection OR Qualtrics anonymous-link/`participant_code` route | | |
| 10 supplied items in order | | |
| Values 1–5 and supplied endpoint labels | | |
| Every item required | | |
| One question per screen | | |
| Working link opens without editor authentication | | |
| Stored participant code is `RESEARCHER-DEMO` | | |
| Brooke score is named `SUS score` and equals 50 | | |
| Export contains the 10 vector values, code and score | | |

**Outcome:** success without assist / success with assist / failure
**Assist count:** ____  **Error count:** ____  **Critical unrecovered errors:** ____

## Planted-discrepancy log

Start: ____  End/detection: ____  Detected before assist/debrief: Yes / No
Exact reported difference: ________________________________________________
False positives: ____  Assists and exact words: ____________________________

## Session close

Deliver the exact discrepancy debrief before asking these formative questions.
The responses below are post-debrief data and must not be coded as discrepancy-
detection evidence.

Open responses — most difficulty: _________________________________________
What helped most: ________________________________________________________
One change: ______________________________________________________________

SUS-AQP: ____ /100 or M  SUS-Qualtrics: ____ /100 or M
Debrief delivered: Yes / No  Withdrawal route repeated: Yes / No
Recording transferred and verified in approved RDSS location: Yes / No
Temporary copy removed: Yes / No / Pending  Evidence/log ID: __________
