# Observed researcher study protocol v1.2

Status: **planned additional formative study; do not run without approved amendment**
Protocol revised: 2026-08-10
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
- **RQ3:** Can researchers detect one seeded discrepancy while using the AQP
  source-review workflow before a participant link is released?
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
exclude a participant after seeing task outcomes. Before recruitment, generate
and freeze eight concealed allocation slots containing four AQ and four QA
assignments, using the preregistered seed and algorithm. Allocate the next slot in
enrolment order. If only 6 or 7 usable sessions result, report the actual order
counts and any imbalance; do not adapt later assignments after seeing outcomes.

A slot may be reused only when the enrolled person withdraws before the order is
revealed and before any condition action or recording begins. Keep the same slot
if that person is rescheduled after a study-owned failure before data collection.
Once a condition action has occurred, do not reuse the slot after withdrawal,
technical failure or exclusion; retain the case disposition and report it. Never
replace a difficult case because of performance.

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
| End-state map | Approved AQP/Qualtrics checkpoint-map version, synthetic-vector file hash and post-condition measures-sheet version |
| Preregistration | Public/approved record URL or DOI, timestamp, random seed, generation algorithm and concealed eight-slot AQ/QA allocation list |
| Recruitment | Approved invitation location, eligibility route and recruitment start/end dates |
| Recording/storage | Approved meeting/recording tool, exact RDSS project path, transfer check and deletion log location |
| Coding | Named UCL second coder, role, confidentiality/access approval and two recordings selected before outcome review |

An empty gate means the study remains planned work. Do not infer a value from the
software repository or replace it with a placeholder during a live session.

### Condition A — AQP ready-made SUS route

Starting state: the researcher opens the AQP researcher landing page with no
saved setup. `System Usability Scale (SUS)` is available in the built-in instrument
catalogue. Its 10 items, 1–5 response codes and executable SUS scorer are already
part of the named release. No study title, task, participant code or participant
link has been configured. The required collection end state is frozen as
**This browser only** (`collection.mode = local`); participants may not choose a
different collection route.

### Condition Q — Qualtrics SUS template route

Starting state: the researcher is already authenticated in the approved UCL
Qualtrics account and opens a fresh copy of the frozen `AQP-SUS-COMPARISON-v1`
template. The template contains the same 10 original SUS items in the same order,
1–5 response values, required-response setting, one question per page and the
pre-verified Brooke score calculation. It contains a blank first-page descriptive
text placeholder and an empty Survey Flow Embedded Data field named
`participant_code`, but no study-specific title/task, code value or distribution
link. The library/template is explicitly available; participants are **not**
asked to type ten items from scratch.

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

The participant's timed task is configuration only. They do not answer SUS as part
of the timed setup. Timing stops when they declare the setup complete or reach the
limit. The observer then performs the frozen, untimed synthetic verification below.
A page saying “complete” is not sufficient.

### Frozen condition-to-checkpoint mapping

| Requirement | AQP observable pass | Qualtrics observable pass |
| --- | --- | --- |
| Study title and task | Generated participant page shows the exact title and task from the configuration. | Project is named `Researcher setup comparison`; the first visible descriptive-text page shows the exact title and task. |
| Participant code | Generated participant-specific link opens with editable code `RESEARCHER-DEMO`; configuration uses local collection. | Anonymous distribution link carries `participant_code=RESEARCHER-DEMO`; the response row stores that exact value in the `participant_code` Embedded Data field. |
| Instrument | Built-in SUS displays the frozen 10 items in order, values 1–5 and endpoint anchors. | Frozen template retains the same 10 items/order, numeric values and endpoint anchors. |
| Required/paging | Runner requires each item and presents one item per screen. | Force Response remains enabled for all 10 items and each item has its own page break. |
| Score | Completed synthetic response reports `SUS score = 50`. | Synthetic Data & Analysis row/export contains the frozen `SUS score` field with value 50. |
| Export | The same-browser conductor result export contains all 10 item values, participant code and score. | A CSV export of the synthetic row contains all 10 item values, participant code and score. |
| Working link | Link opens the generated local participant page in a separate tab in the same browser. | Anonymous distribution link opens the published survey without editor authentication. |

These are whole-tool end states, not claims that the two implementations expose
identical controls or collection architecture.

### Untimed observer verification

After both timed conditions and their immediate post-condition measures, the
observer opens each preserved link and submits the same fixed synthetic vector:

`5, 1, 4, 2, 3, 5, 1, 4, 2, 3`

The expected Brooke SUS score is `50`. The observer then checks every mapped
checkpoint and exports the resulting record. Observer actions and verification
time are excluded from participant active time and are not assists. The observer
must not repair the artefact. A participant configuration error that prevents the
synthetic submission, changes an expected value/score/identity, or prevents export
causes the corresponding checkpoint to fail.

## Design and counterbalancing

Use a within-participant A/Q design.

| Assignment | First condition | Second condition |
| --- | --- | --- |
| AQ | AQP | Qualtrics |
| QA | Qualtrics | AQP |

Before recruitment, create eight slots containing four AQ and four QA assignments,
randomise their order using the frozen seed and algorithm, and seal the list. The
next assignment remains concealed until enrolment. Publish the seed, algorithm and
final list with the preregistration or its time-stamped private appendix, according
to the approved concealment route. Each participant uses the same fixed task and
required end state in both conditions. The slot-reuse rule in **Participants** is
part of the preregistration.

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
6. End time when the participant declares the setup complete or reaches the
   20-minute condition limit. Do not wait for observer verification.
7. Before discussion or feedback, administer the fixed post-condition sheet for
   that system: SEQ first, then all ten SUS items. Record missing items; do not
   impute a score.
8. Preserve the generated link/configuration without discussing or verifying the
   result, then repeat steps 4–7 for the other condition.
9. Without asking the participant to act and without revealing pass/fail, run the
   untimed synthetic verification for both preserved setups and freeze both
   checkpoint vectors. Do not discuss the result or ask open feedback questions.
10. Run the separate AQP planted-discrepancy task below.
11. Debrief the discrepancy immediately. Only after that debrief, collect the
    three fixed formative open responses; label them as post-debrief data and do
    not use them as discrepancy-detection evidence.
12. Stop recording, confirm the withdrawal route and securely transfer the
    recording.

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

An unrecovered error is **critical** when it causes any required end-state
checkpoint to fail or leaves an incorrect participant/data identity, scoring rule,
stored response value or unusable participant link. Code `Critical = Yes/No` for
every error. A recovered error remains in the error count but is not critical in
the final artefact.

### Time

Active task time is elapsed time from the first system action to completion/failure,
minus researcher-owned outages and participant-requested breaks. Do not pause for
reading, search, backtracking or self-correction because these are part of task
performance. Stop at the participant's declaration or 20-minute limit. Post-task
measures, observer synthetic completion, export inspection and checkpoint coding
are outside active task time.

## Planted-discrepancy task

After both setup conditions, give the participant a **sealed source sheet** and a
**sealed imported definition** that differ in exactly one response label.
Everything else must match. The location, source wording and altered wording are
frozen in the private ethics/preregistration appendix and are not published in
the repository before data collection.

The discrepancy previously described in public repository history must not be
used. A participant could have seen its answer, so it cannot yield interpretable
detection evidence. Before recruitment, the researcher must use a different
single discrepancy, record both file hashes in the private appendix, and give the
second coder the sealed answer only after their independent coding is frozen.

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

> The difference was intentionally inserted by the research team. The source
> wording was [read the sealed source wording] and the imported file showed [read
> the sealed altered wording]. It was not your mistake. We used it only to test
> whether the difference was detected while you used the review workflow. Your
> right to withdraw is unchanged.

The bracketed wording is filled from the ethics-approved sealed appendix during
the debrief; it is not improvised by the observer.

## Measures

Primary observed measures per setup condition:

- task success category and each end-state checkpoint;
- active time in seconds;
- assist count and assist categories;
- error count, categories, recovery, critical status and final validity; and
- the untimed observer-verification checkpoint vector.

The planted-discrepancy outcome is a separate AQP source-review task, not a
per-condition setup measure. Report detection, time, assists and false positives
separately.

Post-condition measures:

- Single Ease Question (SEQ), administered immediately after each condition as
  “Overall, how difficult or easy was this task to complete?”, with numbered
  responses 1 `Very difficult` to 7 `Very easy`;
- the original ten-item System Usability Scale (SUS), administered immediately
  after the SEQ for that system and before discussion. Use the original item order,
  1 `Strongly disagree` to 5 `Strongly agree`, and the Brooke scoring rule: odd
  item contribution = response − 1; even item contribution = 5 − response; sum ×
  2.5 for a 0–100 score. If any item is declined/missing, report the SUS score as
  missing and do not impute.

Post-session formative prompts, collected only after the planted-discrepancy
debrief:

- “What caused the most difficulty?”;
- “What helped most?”; and
- “What one change would you make?”.

These post-debrief responses may inform future design work. They are not evidence
that the discrepancy was or was not detected.

Use `docs/ethics/AQP-POST-CONDITION-MEASURES-SHEET-v1.0.md` as the exact neutral
administration surface for both systems. The observer displays the same read-only
sheet, names the system, reads wording verbatim if needed and records the numeric
response. Self-report does not replace observed success, time, assists or errors.

## Second coding and agreement

The primary observer codes all sessions from the fixed event sheet. A second
person, blind to the primary codes, independently codes at least two complete
recordings selected before outcome review (one AQ and one QA when available).

For each double-coded session report:

- exact agreement on condition-level task-success category and every end-state
  checkpoint;
- each coder's raw assist and error totals;
- one-to-one event agreement within the same condition, event type and predefined
  category where timestamps differ by no more than 10 seconds. Each event may be
  matched once. Choose the maximum-cardinality set; break ties by the smallest
  absolute time difference and then the earlier timestamp; and
- matched events divided by the union of both coders' events (`P + S − matched`),
  with disagreements listed and resolved only after the independent result is
  frozen.

Do not report agreement only after consensus. Preserve the pre-consensus numbers.

## Analysis plan

For each participant and condition report success, time, assists, errors, SEQ, SUS
and critical incidents. Summarise numeric measures with n, median, minimum and
maximum. Report counts and denominators for success and discrepancy detection.
Show AQ and QA order groups separately before any overall summary.

Do not run null-hypothesis significance tests, fit a model or claim population
effects at n=6–8. Do not average away critical errors. Analyse the post-debrief
open responses with a small deductive incident table linked to the observed task
state and severity; treat them as formative feedback, not discrepancy evidence,
and do not claim thematic saturation.

## Preregistration and deviations

Before the first session, register on OSF or the approved repository:

- this protocol version and claim boundary;
- frozen systems, templates, source sheet and end-state checklist;
- participant criteria and target n;
- random seed and AQ/QA schedule;
- allocation generation/slot-reuse rule;
- frozen condition-to-checkpoint map, synthetic vector and expected score;
- task-success, assist and error definitions;
- exact post-condition measures sheet, administration order and analysis plan;
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

No payment is planned under protocol version 1.2. Any change to payment,
recording, storage, participant group or task requires prior ethics confirmation
and updated participant materials.
