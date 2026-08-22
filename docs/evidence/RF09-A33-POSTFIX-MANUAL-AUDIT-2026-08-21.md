# RF-09 / A33 post-fix manual audit — 21 August 2026

Status: **manual evidence adjudicated; neither historical A33 failure is closed**

## Evidence source and boundary

- Candidate runtime: `d3af4889c4479a41d54f9c6d4754694f2e0233ed`.
- Immutable preview used for the requested re-test: `/rf09-preview/`.
- Source supplied by the auditor: `第二次修f(9).docx`, final six rendered pages (95–100).
- The screenshots were visually inspected. No speech, command or invariant is inferred from source code when it is absent from the screenshots.
- Frozen A33 requirement: change text size, recovery and audio settings one at a time; each change must produce one timely, accurate status message without moving focus or changing an answer. Exact speech and harmful duplication must be recorded.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## R3 — VoiceOver + Safari — A33

### Observed sequence

The screenshots show all six requested state changes after a rating of `70` had been selected:

1. Large text selected.
2. Standard text selected.
3. Built-in audio guidance on.
4. Built-in audio guidance off.
5. Interruption recovery on.
6. Interruption recovery off.

For Standard, both audio states and both recovery states, the new blue visible AQP result is present and accurate. The Large screenshot does not include the lower result location in its crop, so the visible Large result is not claimed from that image.

The VoiceOver caption panel records only the focused native-control state, including:

- `Large, selected, radio button, 2 of 2, Text size`
- `Standard, selected, radio button, 1 of 2, Text size`
- `checked` / `unchecked` followed by the audio checkbox label and description
- `checked` / `unchecked` followed by the recovery checkbox label and description

No screenshot records VoiceOver announcing the separate blue AQP result such as `Standard text selected.` or the recovery result describing whether the saved in-progress copy was retained or removed.

The visible focus ring remains on the control that was changed. The preselected rating `70` remains selected throughout the captured sequence. No harmful duplicate AQP result is evidenced; the problem is that the separate setting-result message is not evidenced in VoiceOver speech.

### Adjudication

**R3-A33 = F — retained.**

Issue: `RF09-R3-A33-POST-1` — **S1 minor**.

Reason: the controls remain operable, native selected/checked state is exposed, focus is retained and the answer is safe, but the live AQP setting-result content is not surfaced in the recorded VoiceOver output. Under the frozen protocol and WCAG 4.1.3 evidence boundary, markup or a visible status cannot be credited as a screen-reader pass when the real AT observation does not contain the message.

## R4 — Windows Voice Access + Chrome — A33

### Observed sequence

- Command `Click Large` produced `Left clicked Large`.
- Command `Click Standard` produced a `Which one?` disambiguation state because two visible targets were named Standard: the `Standard 21-value scale` answer-format option and the Text size `Standard` option.
- A more specific command, `Click text size standard`, produced `We can't find text size standard. Please try again.`
- Command `Click save progress and show return summary` produced `Left clicked Save progress and show a return summary`; the visible result correctly stated that interruption recovery was on.
- The captured rating `50` remained selected in the recovery screenshot.
- No completed evidence is present for Standard text selection, recovery off, audio on or audio off. The final page ends after the heading for step 4.

### Adjudication

**R4-A33 = F — retained; the re-test does not support F→P.**

Issue: `RF09-R4-A33-POST-1` — **S2 major**.

Reason: one required text-size change could not be reached by the tested visible-label commands, and the remaining recovery/audio states were not completed. One successful visible recovery result cannot satisfy a cell that requires all three setting groups one at a time. The Standard disambiguation is also relevant to the frozen R4 label-in-name check A21, where a disambiguation menu is explicitly a failure of the one-command target requirement.

## Effect on the evidence ledger

- R3-A33: historical **F remains F**.
- R4-A33: historical **F remains F**.
- RF-09 closes **0** failed cells.
- The post-fix unresolved-failure count remains **10**.
- PR #77 must remain Draft and must not be represented as a successful A33 closure.

## Engineering conclusion

The first RF-09 candidate produced useful visible setting feedback and preserved focus and answers in the captured routes, but it did not meet the full manual gate. A successor candidate must:

1. use a VoiceOver/Safari-proven persistent status mechanism rather than crediting the current polite log from DOM tests alone;
2. give the Text size controls unique visible voice targets, for example `Standard text` and `Large text`, without changing the native radio semantics;
3. repeat only the affected R3/R4 A33 sequence on a new immutable preview before any F→P claim.
