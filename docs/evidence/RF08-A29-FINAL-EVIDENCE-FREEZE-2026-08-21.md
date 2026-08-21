# RF-08 / A29 final evidence freeze — 21 August 2026

Status: **complete targeted manual closure on R1–R4; historical R4-A29 F → P.**

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. This file records targeted post-fix evidence only.

## Exact candidate

- PR: `#78` — Fix RF-08 smiley Voice Access targetability.
- Product runtime: `f91d74c06bf5a29fde278f167c3a32949f88f3ec`.
- Canonical post-sync workflow: `32513123702` — success.
- Immutable preview: `/rf08-smiley-preview/`.

## Frozen defect and repair boundary

RF-08 addressed historical **R4-A29** only. The native smiley radio inputs already carried useful names and values, but CSS clipped each real input to a 1 × 1 CSS-pixel box. The retained repair restores real on-screen geometry for the native radios without replacing them with custom ARIA controls, changing the five official landmark values, changing scoring, or removing the precise 21-value scale.

## R4 targeted failure closure

The preceding post-fix record established on Windows Voice Access + Chrome that:

- `Click Middle` selected **50 / Middle**;
- `Click Closer to High` selected **75 / Closer to High**;
- `Show numbers` exposed usable number targets and speaking a displayed number selected the intended native radio;
- the experimental disclosure remained visible;
- `Choose a more precise value on the full scale` still opened the complete 0–100 scale in steps of 5.

Adjudication: **R4-A29 F → P**.

## Required R1–R3 minimal regression — completed

The frozen repair plan required one representative accessible name/value-context check and one precise-scale disclosure check on each route that had already passed before RF-08.

### R1 — NVDA + Firefox

Observed:

- the selected representative landmark was exposed as `50, Middle, for Mental Demand`, as a checked radio button, with the experimental disclosure associated;
- the NVDA Speech Viewer also exposed the item/value selection context;
- `Choose a more precise value on the full scale` expanded successfully and exposed the 0–100 response set with 50 retained.

Outcome: **P regression**.

### R2 — NVDA + Chrome

Observed:

- the selected representative landmark was exposed as `50, Middle, for Mental Demand`, as a checked radio button, with the experimental disclosure associated;
- `Choose a more precise value on the full scale` expanded successfully and exposed the 0–100 response set with 50 retained.

Outcome: **P regression**.

### R3 — VoiceOver + Safari

Observed:

- VoiceOver presented the selected representative landmark as `50, Middle, for Physical Demand`, selected radio button, 3 of 5, followed by the experimental disclosure;
- activating `Choose a more precise value on the full scale` exposed its expanded summary state and the complete 0–100 response set with 50 retained.

Outcome: **P regression**.

Exact browser, operating-system and assistive-technology version strings were not captured in the supplied screenshots and are not invented here.

## Screenshot integrity

Conversation evidence supplied for this final regression and SHA-256 digests:

- `屏幕截图 2026-08-21 233748.png` — `aa883f7a90c104b415a30277619e7b0b8ab4fcf3b699d9b064c4b806d9dee8b4`
- `屏幕截图 2026-08-21 233815.png` — `6d4003dd51a61c06e71182cd2af931617afb477d1e5732f082db840b6e0e5f18`
- `c1506859-6587-4dc8-91a5-ddc34769150e.png` — `d872813a89af09be1b258e1a5d699b44051faec9e7c9e5d6965670868e7753d7`
- `21cee799-e211-4ded-97f2-03c3c1f1f89b.png` — `b883a78b974e2a609892ca2962318480de25135a8576bfe5c29cd0e6b8f00172`
- `07e9285a769e37df290f468640bed5ef.jpg` — `c1d2d4fab7d8d6e0ea37dfbfeeecf5883b824eaeeeba6c1e0f41a73b8418adc2`
- `2178ab2abebfe5d391e931a0eb44b04b.png` — `30e22797acd7b78b2e5580834ab7fcdd5dfbc11449d872f9d5a2a6e76cc1dd4f`

The image files remain conversation evidence; the digests support later byte-for-byte identity checking.

## Final adjudication

- R1-A29: **P regression retained**.
- R2-A29: **P regression retained**.
- R3-A29: **P regression retained**.
- R4-A29: **F → P on the exact RF-08 runtime**.

RF-08 is therefore **technically and manually closed for A29 on the named routes**. No further RF-08 product-code change is justified by the frozen defect.

PR #78 remains unmerged because it is stacked on other repair branches; this integration state does not reverse the targeted manual closure.

## Claim boundary

This evidence supports only the named technical route checks. It does not establish disabled-user benefit, usability improvement, psychometric equivalence, universal accessibility or complete WCAG conformance.
