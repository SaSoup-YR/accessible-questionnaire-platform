# RF-01 successor / R3-A26 dedicated connection announcer — 21 August 2026

Status: **new materially different repair candidate started; no F→P claim until exact VoiceOver + Safari retest**.

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Why this residual failure is being reopened

The earlier RF-01 investigation closed with one residual cell: **R3-A26, VoiceOver + Safari** did not automatically announce the initial Qualtrics `Connecting questionnaire package …` advisory status. R1 NVDA + Firefox, R2 NVDA + Chrome and R4 Windows voice-control routes passed the targeted RF-01 checks; clean connection and blocking connection-error behavior remained intact.

Two earlier R3 follow-ups were intentionally discarded: a longer delay and a Safari-specific urgency/timing shim did not make VoiceOver expose the advisory status. Repeating those timing ideas would violate the RF-01 stop rule.

A materially different mechanism now exists inside the same AQP repair programme: RF-09 subsequently demonstrated that a **dedicated assistive-technology announcement channel**, based on GitHub's `ariaNotify` production polyfill architecture and separated from the visible setting result, could produce the previously missing VoiceOver + Safari announcement on the user's exact route. That new empirical result did not exist when RF-01 was frozen, so a single bounded successor attempt is justified.

## External standards and open-source review

### W3C / MDN ARIA Notification API

Current WAI-ARIA 1.3 and Core-AAM drafts define `ariaNotify()` as an explicit mechanism for announcing content to assistive technologies. MDN describes it as avoiding some of the error-prone DOM-mutation workarounds associated with ad-hoc live regions, but also marks the API as **Limited availability**. It therefore cannot be treated as a universal native-browser dependency yet.

### GitHub Accessibility / Primer

`github/arianotify-polyfill` is maintained by GitHub Accessibility and Primer and is documented as used in production on github.com. Its fallback architecture creates a persistent off-screen live region in a stable root, lets that region register before the first message, then changes its text; it also queues notifications and avoids requiring a focus move.

AQP RF-09 already pins and vendors upstream commit `15d720f075fbe12583e2cc0dab72956384e5c5ef`. The successful RF-09 VoiceOver + Safari observation is direct project-specific evidence that this **separate announcement-channel architecture** is worth trying for R3-A26.

### Safari/WebKit evidence

WebKit added its initial `ariaNotify` implementation in late 2025, but WebKit's January 2026 accessibility tracker explicitly recorded that Safari + VoiceOver still required downstream AT work and a separate bug reported no announcement in Safari + VoiceOver. Current MDN therefore still correctly treats native `ariaNotify` as limited availability.

For this reason the RF-01 successor will **not depend solely on native `ariaNotify()` being present** and will not infer that an exposed method is necessarily audible in VoiceOver.

### Mature announcer comparison

Angular CDK/Material continues to maintain explicit live-announcement infrastructure and documents support across Safari/iOS and VoiceOver routes. Its implementation also treats announcement timing/containers as a distinct accessibility responsibility rather than relying on visible UI text alone.

## Root cause boundary

The retained RF-01 outer Qualtrics bridge already does the conventional ARIA22 pattern: it establishes `role=status`, clears the initial text, and mutates the message later. That structure passed NVDA routes but did not produce the required automatic VoiceOver + Safari observation. More delay did not repair it.

The successor therefore does **not** add another arbitrary delay to the same node. It separates two responsibilities:

1. the visible Qualtrics connection status remains visible and programmatically a `role=status` element;
2. the automatic advisory announcement is emitted through one dedicated, persistent, body-level polite announcer created before the message occurs.

For the advisory `Connecting` state, the visible status has `aria-live="off"` so the visible node and dedicated announcer do not become two competing automatic channels. Blocking failures continue to use the existing visible `role=alert` / assertive path, which already worked and must not be weakened.

## Selected implementation

The candidate will:

- create one empty body-level, visually-hidden `role=status` / `aria-live=polite` / `aria-atomic=true` announcer before the initial connection message;
- keep it persistent for the Qualtrics question lifetime rather than creating/removing a live region for each message;
- update the visible connection status and the dedicated announcer with the same `Connecting questionnaire package …` string after the registration delay;
- cancel that pending advisory announcement if the verified child connection arrives first;
- leave clean-connection text, bridge version checks, iframe reveal, Qualtrics diagnostic fields, response staging, offline recovery, submission and blocking-error semantics unchanged;
- remove the dedicated announcer on Qualtrics unload;
- avoid browser/VoiceOver sniffing, focus changes, assertive escalation, duplicate browser TTS, external runtime dependencies or global `Element.prototype` modification.

This is intentionally narrower than embedding the full GitHub polyfill into the Qualtrics global page. It reuses the mature fallback architecture while avoiding global monkey-patching and avoiding an external script load/CSP/network dependency in a paste-in Qualtrics integration.

## Regression gates

Automated tests must show:

1. the dedicated announcer exists empty before `Connecting` is populated;
2. the visible advisory remains `role=status` but `aria-live=off` while the dedicated polite announcer is the single automatic channel;
3. the exact visible and announced `Connecting` strings match;
4. an early verified child connection cancels the pending `Connecting` announcement and cannot be overwritten by it;
5. missing/mismatched bridge failures remain visible `role=alert`, assertive and actionable;
6. no participant iframe is exposed before verified connection;
7. the existing full repository verification remains green.

## Manual stopping rule

Only after automated verification, retest the exact approved Qualtrics fixture on **R3 VoiceOver + Safari**:

- load the question without moving the VoiceOver cursor to the visible status;
- wait for the initial advisory result;
- record exact automatic speech and harmful duplication;
- then confirm the normal connected state or the frozen failure fixture remains truthful.

If VoiceOver still does not automatically expose `Connecting`, freeze **R3-A26 = F** and stop. Do not add another timing/browser-sniff/urgency workaround.

A successful manual observation would support only the bounded R3-A26 technical closure for that exact environment. It would not establish usability, disabled-user benefit, universal accessibility or complete WCAG conformance.
