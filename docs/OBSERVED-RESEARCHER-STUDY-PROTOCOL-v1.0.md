# AQP observed researcher study protocol v1.0

Status: **planned additional formative study; do not run without approved amendment**
Protocol date: 2026-08-09
Target sample: 6–8 adults acting as novice questionnaire researchers
Analysis: descriptive and per-participant only; no significance testing

## Role in the dissertation

The dissertation evaluation is complete without these sessions. Quantified
technical evaluation and the manual assistive-technology audit are the core
evaluation. If the amendment is approved and sessions finish in time, this study
is reported as an additional formative study. Otherwise the protocol is reported
as planned work and the researcher-usability claim remains **Not evidenced**.

Submit the amendment by 11 August 2026. If written approval is not in hand by
18 August, do not include sessions in the 21 August draft and do not delay the
draft.

## Research questions

- **RQ1:** Can novice questionnaire researchers produce a valid SUS study from
  AQP and from a precisely specified Qualtrics template starting state?
- **RQ2:** What time, assistance and observable errors occur in each whole-tool
  workflow?
- **RQ3:** Can the AQP source-review workflow help researchers detect one seeded
  discrepancy before a participant link is released?
- **RQ4:** What barriers and improvement suggestions arise during observed use?

This is a formative whole-workflow comparison. It does not isolate one interface
mechanism and does not establish that one platform is generally easier.

## Participants

Eligibility:

- aged 18 or over;
- able to use a desktop/laptop browser independently;
- no prior development work on AQP;
- novice or occasional questionnaire researcher, operationalised as no more than
  two previously configured online questionnaire studies; and
- able to use the approved session language and consent to screen recording.

Record prior Qualtrics and survey-platform experience before assignment. Do not
exclude a participant after seeing task outcomes. Target 6 or 8 participants so
the two orders contain 3/3 or 4/4 participants. If exactly 7 complete, assign the
last order at random and report the 4/3 imbalance. Do not replace a difficult case
because of performance.

## Frozen systems and starting states

Record the AQP release tag, commit SHA, deployed URL, Qualtrics account type,
template version and browser before the first session. No system update is allowed
mid-study unless a safety-critical defect stops the study; if that occurs, freeze
the affected data and document the protocol deviation.

### Activation record — complete before recruitment

The protocol is fully specified but must not be activated until this record is
complete and attached to the preregistration:

| Gate | Required frozen value |
| --- | --- |
| Ethics | Approval ID, approving route/committee, written amendment decision and approved document versions |
| AQP | Immutable release tag, commit SHA, deployment URL and passing evidence-report links |
| Qualtrics | Survey/template ID, `AQP-SUS-COMPARISON-v1` export checksum, account type and verified starting-state screenshot |
| Preregistration | Public/approved record URL or DOI, timestamp, random seed and concealed AQ/QA allocation list |
| Recruitment | Approved invitation location, eligibility route and recruitment start/end dates |
| Recording/storage | Approved meeting/recording tool, exact RDSS project path, transfer check and deletion log location |
| Coding | Named UCL second coder, role, confidentiality/access approval and two recordings selected before outcome review |

An empty gate means the study remains planned work. Do not infer a value from the
software repository or replace it with a placeholder during a live session.

### Condition A — AQP ready-made SUS route

Starting state: the researcher opens the AQP researcher landing page with no
saved setup. `System Usability Scale (SUS)` is available in the built-in instrument
catalogue. Its 10 items, 1–5 response codes and executable SUS scorer are already
part of the named release. No study title, task, participant code, collection
choice or participant link has been configured.

### Condition Q — Qualtrics SUS template route

Starting state: the researcher is already authenticated in the approved UCL
Qualtrics account and opens a fresh copy of the frozen `AQP-SUS-COMPARISON-v1`
template. The template contains the same 10 original SUS items in the same order,
1–5 response values, required-response setting, one question per page and the
pre-verified Brooke score calculation. It contains no study-specific title/task,
participant code or distribution link. The library/template is explicitly
available; participants are **not** asked to type ten items from scratch.

This starting state is chosen because it matches a realistic ready-made route in
both systems. The AQP scorer being executable platform code and the Qualtrics
formula being frozen template content are declared system differences. Therefore
time differences describe these two whole starting states, not an isolated effect
of the AQP wizard.

### Required end state for both conditions

The participant must produce a working participant link for:

- study title `Researcher setup comparison`;
- task label `Use the test product, then answer SUS`;
- pseudonymous participant code `RESEARCHER-DEMO` supplied through the approved
  route rather than a person's name/email;
- ten original SUS items in frozen order;
- stored response values 1–5 with endpoints Strongly disagree/Strongly agree;
- every item required;
- one question per screen;
- Brooke SUS score named `SUS score`; and
- a result/export route containing the ten final item values and computed score.

The coordinator verifies the artefact after the task. A page saying “complete” is
not sufficient.

## Design and counterbalancing

Use a within-participant A/Q design.

| Assignment | First condition | Second condition |
| --- | --- | --- |
| AQ | AQP | Qualtrics |
| QA | Qualtrics | AQP |

For n=6 allocate 3 AQ and 3 QA; for n=8 allocate 4 AQ and 4 QA. Generate the
assignment list before recruitment with a reproducible random seed, conceal the
next assignment until the participant is enrolled, and publish the seed and list
with the preregistration. Each participant uses the same fixed task and required
end state in both conditions.

## Observed procedure

1. Confirm approved information-sheet version, active consent and permission to
   record the study window and audio needed for coding.
2. Ask the participant to close unrelated windows and notifications. Remind them
   that their own machine may still reveal names, tabs, notifications or file
   paths in a recording.
3. Record experience, assigned order, device, OS and browser.
4. Read the fixed introduction script. Give the first condition task sheet.
5. Start time when the participant says they understand the task and first acts on
   the system. Observe without coaching.
6. End time when the participant says the end state is complete or reaches the
   20-minute condition limit.
7. Administer one SEQ item immediately. Then verify the generated artefact against
   the frozen checklist without revealing the second condition.
8. Repeat steps 4–7 for the other condition.
9. Administer SUS separately for AQP and Qualtrics, clearly naming the system for
   each response set. Collect the fixed open questions.
10. Run the AQP planted-discrepancy task below.
11. Debrief the discrepancy, stop recording, confirm the withdrawal route and
   securely transfer the recording.

## Fixed observer script

Opening:

> We are testing the setup workflows, not you. Please work as you normally would.
> You may speak aloud if you want, but you do not have to. I will not tell you how
> to complete a step. If you ask for help, I may first repeat the task. You can
> pause or stop at any time.

Permitted neutral prompts, used only after 20 seconds of silence or when the
participant asks what the task means:

- “Please continue in the way that makes most sense to you.”
- “What are you trying to do now?”
- “I can repeat the task wording, but I cannot tell you which control to use.”

The observer must not name a control, point, take control, validate an unfinished
choice or reveal the planted discrepancy before the task ends.

## Outcome definitions

### Task success

- **Success without assist:** all required end-state checks pass within 20 minutes
  and no assist occurred.
- **Success with assist:** all checks pass within 20 minutes after one or more
  assists. This is not counted as independent success.
- **Failure:** time limit reached, participant stops, a required check fails, or a
  critical error remains in the final artefact.

### Assist

An assist is any observer action that adds procedural or factual information not
contained in the task sheet: naming a control, giving a navigation path, explaining
how scoring is configured, pointing, taking control or confirming that a choice is
correct before final verification. Repeating the task verbatim, asking a permitted
neutral prompt, resolving a study-owned login/outage or granting an approved break
is not an assist. Record timestamp, exact words, trigger and category.

### Error

An error is an observable participant action that must be reversed/corrected or
would produce an invalid end state if left unchanged. Categories:

- content/order error;
- response-label or stored-value error;
- required-status error;
- scoring/name error;
- participant-code/data-handling error;
- collection/link error;
- navigation error (enters an irrelevant route and must return); or
- false completion (declares done while one or more required checks fail).

Exploration that does not change state and ordinary reading are not errors. Record
self-corrected errors; mark whether recovered, whether an assist was needed and
whether the final artefact remained invalid.

### Time

Active task time is elapsed time from the first system action to completion/failure,
minus researcher-owned outages and participant-requested breaks. Do not pause for
reading, search, backtracking or self-correction because these are part of task
performance.

## Planted-discrepancy task

After both setup conditions, give the participant an AQP source sheet and imported
definition that differ in exactly one place: source label for stored value 3 is
`Neither agree nor disagree`; imported definition shows `Neutral`. Everything else
matches.

Task wording:

> Check the imported questions, answer labels, stored values and scoring against
> the source sheet. Do not edit either file. Tell me every difference you would
> resolve before releasing the participant link.

Detection success requires the participant to identify the exact item/response,
both conflicting labels and the need to stop release, before assist or debrief.
False-positive differences are recorded separately. The task ends after detection
or 8 minutes.

### Information-sheet disclosure and debrief

Information sheet line:

> One task may contain a small intentional difference between two setup materials.
> We do not tell you its location in advance because noticing it is part of the
> task. We will explain it immediately afterwards.

Debrief line:

> The difference was intentionally inserted by the research team: stored value 3
> was labelled “Neither agree nor disagree” in the source and “Neutral” in the
> imported definition. It was not your mistake. We used it only to test whether
> the review workflow supports detection. Your right to withdraw is unchanged.

## Measures

Primary observed measures per condition:

- task success category and each end-state checkpoint;
- active time in seconds;
- assist count and assist categories;
- error count, categories, recovery and final validity; and
- seeded-discrepancy detection, time, assists and false positives.

Post-task/post-condition measures:

- Single Ease Question (SEQ), 1 `very difficult` to 7 `very easy`, after each
  condition;
- System Usability Scale (SUS), scored 0–100 using the standard rule, separately
  for each system; and
- concise open prompts: “What caused the most difficulty?”, “What helped most?”,
  and “What one change would you make?”.

Self-report does not replace observed success, time, assists or errors.

## Second coding and agreement

The primary observer codes all sessions from the fixed event sheet. A second
person, blind to the primary codes, independently codes at least two complete
recordings selected before outcome review (one AQ and one QA when available).

For each double-coded session report:

- exact agreement on condition-level task-success category and every end-state
  checkpoint;
- each coder's raw assist and error totals;
- event agreement where the same predefined category occurs within a 10-second
  window; and
- matched events divided by the union of both coders' events, with disagreements
  listed and resolved only after the independent result is frozen.

Do not report agreement only after consensus. Preserve the pre-consensus numbers.

## Analysis plan

For each participant and condition report success, time, assists, errors, SEQ, SUS
and serious incidents. Summarise numeric measures with n, median, minimum and
maximum. Report counts and denominators for success and discrepancy detection.
Show AQ and QA order groups separately before any overall summary.

Do not run null-hypothesis significance tests, fit a model or claim population
effects at n=6–8. Do not average away critical errors. Analyse open responses with
a small deductive incident table linked to the observed task state and severity;
do not claim thematic saturation.

## Preregistration and deviations

Before the first session, register on OSF or the approved repository:

- this protocol version and claim boundary;
- frozen systems, templates, source sheet and end-state checklist;
- participant criteria and target n;
- random seed and AQ/QA schedule;
- task-success, assist and error definitions;
- measures and analysis plan;
- exclusion/withdrawal rules; and
- second-coder selection rule.

Report every change after registration with date, reason, affected cases and
whether it was made before or after seeing outcomes.

## Recording, privacy and retention amendment text

Active consent to study-window and session-audio recording is required to take part,
because the recording is needed to code task time, assists and errors and to permit
the independent coding check. A person may decline without penalty; they will not
then take part in this recorded study. A recording on a researcher's own computer
may incidentally capture identifying material such as account name, browser tabs,
notifications, file paths or voices. Participants will be asked to close unrelated
windows and mute notifications, but this risk cannot be eliminated.

Recordings will be transferred immediately to an access-controlled UCL Research
Data Storage Service (RDSS) project folder registered by the supervisor,
accessible only to Yurui Wang, Dr Mark Colley and the named UCL second coder in
the approved amendment. They will not be uploaded to GitHub, personal cloud
storage or email. After the transfer is verified, securely remove the temporary
local copy. Securely delete the raw recordings no later than 30 November 2026,
after coding and the agreement check, and record the deletion date. Keep
consent/contact data separately from coded task data. The participant may pause
recording or request removal of identifiable and coded data until seven calendar
days after their session.

No payment is planned under protocol version 1.0. Any change to payment,
recording, storage, participant group or task requires prior ethics confirmation
and updated participant materials.
