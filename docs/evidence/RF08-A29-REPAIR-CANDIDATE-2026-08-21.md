# RF-08 / A29 smiley Voice Access repair candidate — 21 August 2026

Status: **implementation, generated release and canonical automated verification complete; real Voice Access adjudication pending**

## Identity

- Stacked base: RF-09 branch with its final manual success evidence retained separately.
- RF-08 branch: `agent/fix-rf08-smiley-voice-access`.
- Synchronized product runtime: **`f91d74c06bf5a29fde278f167c3a32949f88f3ec`**.
- Canonical verified evidence head: `302b998ddfea85f9e6fe4e798e58b70346d52990`.
- Final canonical read-only run: **`32513123702` — success**.
- The release-sync workflow removed itself before the runtime commit and is not retained.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Frozen defect boundary

RF-08 targets only historical **R4-A29** on Windows Voice Access + Chrome.

The frozen A29 requirement is conjunctive:

- NASA-TLX smiley landmarks remain explicitly experimental;
- the five official landmark values remain 0 / 25 / 50 / 75 / 100 with useful Low / Closer to Low / Middle / Closer to High / High naming;
- the precise official scale remains available;
- the smiley choices themselves must be operable on the named route.

Pre-fix R1/R2/R3 passed the semantic/name/fallback checks. R4 failed because Voice Access could not select `Middle` or `Closer to High` by visible label, and the auditor reported that `Show numbers` still did not make the smiley radios selectable. The full precise scale remained available.

## Root-cause evidence in the retained source

The underlying controls are already native `<input type="radio">` elements inside `<label>` elements and already expose useful names such as `50, Middle, for Mental Demand` plus the experimental description.

However, the base stylesheet intentionally reduces every `.smiley-option input` to a clipped **1 × 1 CSS-pixel** element using absolute positioning, `overflow:hidden`, `clip:rect(0 0 0 0)` and `clip-path:inset(50%)`. The large card is visually clickable through its label, but the actual radio is not a real on-screen target for an OS voice-control overlay.

This explains why the screen-reader routes can receive correct semantics while the Windows Voice Access route can still fail direct/number-overlay targetability.

## Standards, platform and mature implementation review

The candidate is based on primary platform/accessibility guidance rather than a Voice Access-specific command parser:

- Microsoft Voice Access documents direct `Click <item name>` / `Tap <item name>` activation, partial word matching and `Show numbers` overlays for on-screen interactive items; multiple matches deliberately trigger numbered disambiguation.
- WCAG 2.5.3 Label in Name exists specifically so people using speech input can operate controls by the words they see. W3C G208/G211 recommend including or matching the visible text in the accessible name and prefer native label/name relationships where practical.
- WAI-ARIA APG retains ordinary radio semantics and group labelling rather than requiring custom voice-control roles.
- Adobe React Spectrum implements Radio with a real native `<input>` associated with a `<label>`; its CSS deliberately gives that input a real full control hit area rather than clipping it to a 1 × 1 offscreen box. This is useful precedent for preserving native semantics while keeping an on-screen interactive input geometry.
- GitHub Primer and Microsoft Fluent UI likewise expose radio groups through ordinary radio/control labelling patterns rather than speech-command parsers.

References:

- https://support.microsoft.com/en-us/accessibility/windows/voice-access/use-voice-to-interact-with-items-on-the-screen
- https://www.w3.org/WAI/WCAG21/Understanding/label-in-name
- https://www.w3.org/WAI/WCAG21/Techniques/general/G208
- https://www.w3.org/WAI/WCAG21/Techniques/general/G211
- https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/@adobe/react-spectrum/src/radio/Radio.tsx
- https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/@adobe/spectrum-css-temp/components/radio/index.css
- https://github.com/microsoft/fluentui/blob/b5ec47fc035849b21b35d6f6054d60c0a64ff3db/packages/react-components/react-radio/stories/src/RadioGroup/RadioGroupAccessibilitySpec.mdx

This review does not prove that any one styling pattern is universally optimal for Windows Voice Access. The chosen change is the smallest standards-aligned correction to the concrete root cause observed in AQP: the actual native radio was clipped out of ordinary on-screen geometry.

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

Before generated-release synchronization, canonical run `32512653253` established that all source tests, production build, 12/12 rendered-browser accessibility checks and the full cross-browser support step passed. It failed only the expected final freshness gate because the new source/CSS had not yet been regenerated into committed release files. The release was then regenerated by CI and committed as runtime `f91d74c06bf5a29fde278f167c3a32949f88f3ec`.

Final canonical read-only run **`32513123702` completed successfully** after synchronization. Every gate passed: locked install and unit/component tests, production build, rendered-browser accessibility regression, cross-browser support (including the RF-08 case in Chromium/Firefox/WebKit), production/standalone/release generation, and committed generated-release freshness.

Automation establishes the DOM/layout mechanism and regresses R1-R3 browser semantics. It cannot prove Windows Voice Access operability; **R4-A29 remains F until the exact candidate passes the frozen real Voice Access commands/overlay check.**
