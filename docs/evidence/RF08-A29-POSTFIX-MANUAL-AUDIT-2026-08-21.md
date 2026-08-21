# RF-08 / R4-A29 post-fix manual audit — 21 August 2026

Status: **R4-A29 historical failure closed on the exact RF-08 runtime.** Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Evidence boundary

This record is a manual technical observation on Windows Voice Access + Chrome. It is not evidence of disabled-user benefit, usability improvement, psychometric equivalence, universal accessibility or complete WCAG conformance.

Exact product runtime under test: `f91d74c06bf5a29fde278f167c3a32949f88f3ec`.

The exact Windows, Chrome and Voice Access version strings were not captured in the supplied screenshots, so they are not invented here. The route identity is the frozen R4 Windows Voice Access + Chrome route used for RF-08.

## Frozen A29 requirement

R4-A29 requires that the NASA-TLX smiley-landmark view retain useful names/values, remain explicitly experimental, keep the official precise scale available, and be operable through the declared Windows voice-control route.

The historical R4 failure was targetability: the smiley radios were semantically native radios but visually clipped to 1 × 1 CSS px, so Voice Access could not reliably target them by visible name or number overlay.

## Observed post-fix results

### Direct named target: Middle

Command: `Click Middle`.

Observed Voice Access feedback: `Left clicked 50, Middle, for Mental Demand`.

Observed page state: **50 / Middle selected**.

Outcome: **Pass**.

### Direct named target: Closer to High

Command: `Click Closer to High`.

Observed Voice Access feedback: `Left clicked 75, Closer to High, for Mental Demand`.

Observed page state: **75 / Closer to High selected**.

Outcome: **Pass**.

### Number-overlay targetability

The auditor reported that `Show numbers` now exposes usable number targets for the smiley radios and that speaking the assigned number activates the corresponding smiley.

Retained screenshot observation: Voice Access displayed `Clicked 38`; the resulting selected card was **25 / Closer to Low**. This is direct evidence that the restored native radio geometry participates in the standard Voice Access number-overlay route.

Outcome: **Pass**.

### Experimental disclosure and precise-scale fallback

The smiley screen still displays:

`Each face is one official value. Facial expression may imply good or bad, so this route is experimental.`

The disclosure `Choose a more precise value on the full scale` expanded normally. The official scale remained available as 21 values from 0 to 100 in steps of 5, with the current value retained.

Outcome: **Pass**.

## Additional non-blocking observation: `High`

A short command using only `High` produced the Voice Access disambiguation prompt `Which one?` rather than one-command activation.

This does **not** reverse the A29 pass. The visible word `High` occurs in both `Closer to High` and `High`; Microsoft documents that Voice Access supports partial-name matching and, when a command has multiple possible matches, intentionally asks the user to choose among numbered matches. Microsoft also documents `Show numbers` as the standard fallback for on-screen interactive items. The frozen RF-08 manual gate therefore uses the unique command `Click Closer to High` plus number-overlay targetability, both of which passed.

This record does not claim that every partial label fragment uniquely activates one smiley in one command.

## Screenshot integrity

Supplied evidence files and SHA-256 digests:

- `屏幕截图 2026-08-21 194423.png` — `b5eff5d4210808f99c90d2b79d2d29ded357b495c89f4fbdad38c77c40464a0b`
- `屏幕截图 2026-08-21 194608.png` — `eb1a2fb2c9dd40afd34d83d144b02aa5c2381683253557e064e267e5cab7aa30`
- `屏幕截图 2026-08-21 194647.png` — `da5a5a79cca228712ab9de22263a6dbf22fcf5b0e9c6e7a3252d0ebf81b6a7e5`
- `屏幕截图 2026-08-21 194819.png` — `934b14b0cd2397a93aba6ce15707fe8d1a3d7c9ccc021ecfe1c5548a6c7f429d`
- `屏幕截图 2026-08-21 194945.png` — `ac254ec7dab14dd8bebb6fe1bee47e5dd9b4504cf1bb7818be293686912e4673`

The screenshots themselves remain conversation evidence; these digests let later copies be checked for byte-for-byte identity.

## Adjudication

**R4-A29: F → P on runtime `f91d74c06bf5a29fde278f167c3a32949f88f3ec`.**

The historical q8 matrix is not rewritten. This is targeted post-fix closure evidence.

R1/R2/R3 were not manually rerun in this evidence record. Their earlier semantic/name/fallback results and the RF-08 Chromium/Firefox/WebKit automated regression remain separate evidence; this file does not relabel an unexecuted manual regression as a pass.

## Primary external basis

- Microsoft Support, *Use voice to interact with items on the screen*: direct `Click <item name>`, partial-name matching, deliberate numbered disambiguation for multiple matches, and `Show numbers` overlays.
- W3C WCAG Label in Name / native labelled-control guidance as cited in the RF-08 repair-candidate record.
- `docs/evidence/RF08-A29-REPAIR-CANDIDATE-2026-08-21.md` for root cause, implementation scope and automated verification.
