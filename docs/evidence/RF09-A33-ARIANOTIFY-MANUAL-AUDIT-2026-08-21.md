# RF-09 / A33 ariaNotify successor manual audit — 21 August 2026

Status: **second candidate manually observed; R3 remains failed on the audio-on transition; R4 target-name collision is resolved but full-cell invariants are not overclaimed from cropped evidence**

## Candidate and evidence boundary

- Candidate runtime / immutable preview source: `98b8cd63b345f7e16e9fe24ada63f31db06c71f3`.
- Immutable preview used: `/rf09-arianotify-preview/`.
- Route R3: VoiceOver + Safari on macOS.
- Route R4: Windows Voice Access + Chrome.
- Evidence supplied by the auditor: the current manual observations plus eleven retained screenshots in the dissertation audit conversation.
- Screenshot captions are treated as evidence only for text actually visible in the VoiceOver / Voice Access overlay or AQP UI. A cropped screenshot is not used to infer an unseen answer, focus target or spoken phrase.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.
- Frozen A33 requirement remains unchanged: change text size, interruption recovery and automatic audio one at a time; each real change must produce one timely, accurate setting-result message without moving focus or changing a questionnaire answer.

## R3 — VoiceOver + Safari

### Setting-result observations

The supplied VoiceOver caption overlays contain the separate AQP result for five of the six required transitions:

1. `Large text selected.`
2. `Standard text selected.`
3. `Interruption recovery is on. Incomplete answers will be stored in this browser.`
4. `Interruption recovery is off. The saved in-progress copy has been removed.`
5. Audio **on**: auditor reports no automatic AQP result; no screenshot records the audio-on result.
6. `Built-in audio guidance is off. New questions and feedback will not be spoken automatically.`

The AQP page itself also shows the matching blue visible result for the captured states.

### Adjudication

**R3-A33 remains F on candidate `98b8cd63...`.**

The failure is now narrow: the transition that enables `Read new questions and feedback aloud` does not produce the required automatic AQP setting-result message in the observed Safari + VoiceOver route. The subsequent audio-off transition does. The other captured RF-09 setting-result transitions are no longer the blocker on this candidate.

Do not infer that the Web Speech API actually spoke the missing audio-on message merely because the checkbox became checked or because `speechSynthesis.speak()` was called. Real-AT evidence is decisive.

## R4 — Windows Voice Access + Chrome

### Direct target observations

The successor's unique visible text-size names remove the first candidate's `Standard` collision:

- `Choose large text` produced `Ticked Large text`; the `Large text` radio became selected.
- `click standard text` produced `Left clicked Standard text`; the `Standard text` radio became selected.
- No `Which one?` disambiguation state is present in the supplied successor screenshots.

The supplied screenshots also show direct Voice Access activation of the two checkbox groups and accurate visible AQP results, including:

- interruption recovery on;
- interruption recovery off;
- built-in audio guidance on;
- built-in audio guidance off.

### Adjudication boundary

The target-name defect that blocked the first R4 candidate is **resolved in the supplied successor evidence**. However, the current cropped screenshots do not independently show the preselected rating at every transition, so this record does not silently convert the complete R4-A33 cell to Pass. Final R4-A33 closure still requires the frozen answer-retention/focus invariants to be explicitly retained or reported for the exact final candidate.

## Root-cause finding from the R3 observation

The second candidate suppressed `ariaNotify()` whenever the component's `audioGuidance` boolean indicated that built-in browser speech *should* be the spoken channel. That is not equivalent to evidence that speech actually started.

The base speech function queues a `SpeechSynthesisUtterance` with `speechSynthesis.speak()`. The Web Speech API distinguishes a queued request from an utterance that has actually begun. The new R3 observation demonstrates why the suppression condition must be based on real speech start rather than intended audio state.

## Effect on the evidence ledger

- Historical q8: unchanged.
- R3-A33: **F remains F** on `98b8cd63...`.
- R4 first-candidate visible-name ambiguity: resolved by `Standard text` / `Large text` on `98b8cd63...`.
- PR #77 remains Draft; this candidate is retained as reproducible intermediate evidence and is not overwritten.
