# RF-08 / A29 smiley Voice Access repair candidate — 21 August 2026

Status: **source/test candidate prepared; automated and real Voice Access verification pending**

## Frozen defect boundary

RF-08 targets only historical **R4-A29** on Windows Voice Access + Chrome.

The frozen A29 requirement is conjunctive:

- NASA-TLX smiley landmarks remain explicitly experimental;
- the five official landmark values remain 0 / 25 / 50 / 75 / 100 with useful Low / Closer to Low / Middle / Closer to High / High naming;
- the precise official scale remains available;
- the smiley choices themselves must be operable on the named route.

Pre-fix R1/R2/R3 passed the semantic/name/fallback checks. R4 failed because Voice Access could not select `Middle` or `Closer to High` by visible label, and the auditor reported that `Show numbers` still did not make the smiley radios selectable. The full precise scale remained available. Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Root-cause evidence in the retained source

The underlying controls are already native `<input type="radio">` elements inside `<label>` elements and already expose useful names such as `50, Middle, for Mental Demand` plus the experimental description.

However, the base stylesheet intentionally reduces every `.smiley-option input` to a clipped **1 × 1 CSS-pixel** element using absolute positioning, `overflow:hidden`, `clip:rect(0 0 0 0)` and `clip-path:inset(50%)`. The large card is visually clickable through its label, but the actual radio is not a real on-screen target for an OS voice-control overlay.

This explains why the screen-reader routes can receive correct semantics while the Windows Voice Access route can still fail direct/number-overlay targetability.

## Standards and platform review

The candidate is based on primary platform/accessibility guidance rather than a Voice Access-specific command parser:

- Microsoft Voice Access supports `Click <item name>` / `Tap <item name>` for UI items and partial word matches. If several items match, Voice Access deliberately asks the user to disambiguate. It also provides number overlays for on-screen interactive targets.
- WCAG 2.5.3 Label in Name exists specifically so people using speech input can operate controls by the words they see. W3C recommends matching the accessible name to the visible label where practical.
- WAI-ARIA APG recommends native radio semantics where possible; each radio must have a useful label/name and the group must remain labelled.
- W3C G211/G208 favour visible label text as the accessible name rather than hidden speech-command-only names.
- Mature systems including GitHub Primer and Adobe React Aria retain native radio inputs/label relationships for radio groups rather than adding bespoke voice-control roles. React Aria also documents implementation trade-offs around visually hidden native inputs; AT behavior must still be tested on the actual route.

References:

- https://support.microsoft.com/en-us/accessibility/windows/voice-access/use-voice-to-interact-with-items-on-the-screen
- https://www.w3.org/WAI/WCAG21/Understanding/label-in-name
- https://www.w3.org/WAI/WCAG21/Techniques/general/G211
- https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- https://primer-docs-preview.github.com/product/components/radio-group/
- https://github.com/adobe/react-spectrum/discussions/6390

## Bounded implementation

`source/src/rf08-smiley-voice-access.css` overrides only the smiley-radio hiding rule:

- keep the native `<input type="radio">` and existing label/accessibility attributes;
- restore a real 1.5rem × 1.5rem on-screen radio target in the top-left of each card;
- remove clip/clip-path/hidden overflow from that radio;
- retain the large surrounding `<label>` as the pointer/touch target;
- retain the existing card selected state and experimental help;
- add visible native-radio focus without removing the card-level `:focus-within` halo;
- leave scoring, response values, answer storage, voice input, gaze input, Qualtrics and the 21-value precise scale unchanged.

The candidate deliberately does **not** replace native radios with custom `role=radio`, does not add Voice Access-only command strings, and does not remove the existing useful value/landmark accessible names that already passed R1-R3.

## Automated gate

New rendered cross-browser regression `source/tests/e2e-support/rf08-smiley-voice-access.spec.ts` checks Chromium, Firefox and WebKit for:

- all five smiley radios present and visible;
- each native radio has a real layout box of at least 20 × 20 CSS px;
- the radio is no longer clipped with the historical `inset(50%)` rule;
- existing accessible names remain `0, Low`, `25, Closer to Low`, `50, Middle`, `75, Closer to High`, `100, High` plus item context;
- the experimental disclaimer remains associated through `aria-describedby`;
- normal native-radio selection still commits through the existing response path;
- the precise 21-value full scale still opens and remains available.

Automation can establish the DOM/layout mechanism and regress R1-R3 browser semantics. It cannot prove Windows Voice Access operability; R4-A29 remains F until the exact candidate passes the frozen real Voice Access commands/overlay check.
