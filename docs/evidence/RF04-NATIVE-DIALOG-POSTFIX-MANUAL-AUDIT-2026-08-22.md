# RF-04 native recovery dialog — final VoiceOver + Safari adjudication

Date: 22 August 2026  
Route: **R3 — macOS Safari + VoiceOver**  
Exact source/runtime candidate: `0444d6f8a3a77f7cb9409d79c01a75ff42d9471d`  
Canonical automated verification: workflow `32542362335` — success  
Historical baseline: q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Frozen checks

- **A14:** after exactly three saved SUS responses, reload with VoiceOver already running. Focus must enter the saved-progress recovery choice; the exact `3 of 10` count and Resume/Erase choices must be available without searching outside the recovery surface.
- **A15:** activating Resume must preserve the three answers, continue at Item 4 and place focus on the normal Item 4 heading without changing an answer automatically.

## Submitted observations

### Observation 1 — automatic recovery-dialog entry

Immediately after reload, the VoiceOver caption showed:

> Saved questionnaire found, web dialog, with 6 items

The visible native modal simultaneously contained:

- `3 of 10 responses are saved in this browser.`
- `Resume saved questionnaire`
- `Hear saved-progress message`
- `Erase saved answers`

The VoiceOver focus ring enclosed the named modal rather than remaining on the underlying participant page. The page behind the modal was visually inert. This is materially different from the earlier R3 failure, where the VoiceOver cursor remained outside the inline recovery offer and required a page search.

The first caption named the containing web dialog rather than repeating the Resume button label. This is retained as an exact observation, not rewritten as different speech. On the exact candidate, deterministic unit and rendered-browser checks separately establish that `Resume saved questionnaire` is the dialog's autofocus/active DOM control. The live observation establishes that VoiceOver entered the same modal accessibility context. The primary Resume action was then usable without searching outside that context.

Submitted screenshot SHA-256: `6c647eb672d1d667dbcc4ae6c000f4e3f2035621fd742bf3368a9a081e4a22ae`.

### Observation 2 — direct continuation and answer preservation

After the Resume action, the VoiceOver caption showed:

> heading level 2, Item 4, Item 4, region

The rendered progress stated `Ratings: 3 of 10 responses completed`, and the questionnaire displayed `Rating 4 of 10` / `Item 4`. No previously entered answer was lost or changed.

Submitted screenshot SHA-256: `7e8998213f37832099f9a220c3da4d90fe78c224605c9f1f1652b9a64465833c`.

## Adjudication

- **R3-A14: F → P.** The exact candidate moved the real VoiceOver cursor into the named modal recovery context; the exact saved count and recovery choices were present there, and the primary Resume action was immediately operable. No manual search of the underlying page was required.
- **R3-A15: P retained.** Resume continued directly to Item 4, focused its heading and preserved all three committed answers.

This closes the final RF-04 residual cell. RF-04 therefore has targeted post-fix Pass evidence for all six historical A14/A15 failures while the historical q8 matrix remains unchanged.

## Updated residual ledger

After this adjudication, **6 historical F cells remain unresolved**:

- RF-01: R3-A26;
- RF-06: R4-A10;
- RF-07: R3-A11, R3-A12, R4-A11 and R4-A12.

## Claim boundary

This is a configuration-bounded manual technical result for the named Safari + VoiceOver route and exact candidate. It does not establish universal focus behaviour, complete WCAG conformance, usability, psychometric equivalence or benefit for disabled users. The screenshots were supplied for adjudication; their hashes are retained here without publishing the uncropped browser images in the public repository.