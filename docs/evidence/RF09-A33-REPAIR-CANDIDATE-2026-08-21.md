# RF-09 / A33 support-setting feedback candidate — 21 August 2026

Status: **research, implementation, focused tests, generated-release synchronization and immutable preview complete; final canonical read-only CI and manual R3/R4 adjudication pending**

## Identity and audit boundary

- Stacked base: final retained RF-06 branch head `e45a59d25e2188f194484c8dadd877cdbdf80ea1`.
- Branch: `agent/fix-rf09-support-setting-feedback`.
- Synchronized RF-09 runtime and immutable preview source: `d3af4889c4479a41d54f9c6d4754694f2e0233ed`.
- Immutable preview path: `/rf09-preview/`.
- Generated synchronization/publish run: `32488814604` — **success**.
- A documentation-only successor must pass the restored canonical read-only workflow before automated closure.
- Frozen q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.
- RF-09 targets only historical **R3-A33** and **R4-A33**.

The frozen A33 operation is to change text size, interruption recovery and automatic audio one at a time. Each real change must give one timely, accurate status message without moving focus or changing a questionnaire answer.

## Historical defect evidence

### R3 — VoiceOver + Safari — F

Native keyboard state feedback for the audio checkbox was accurate, but ordinary mouse/label activation of text-size, recovery and audio controls did not consistently produce a separate timely setting-result announcement. An occasional later attempt spoke a state, which was not sufficient for the frozen one-message requirement.

### R4 — Windows Voice Access + Chrome — F

Voice Access changed Large text and automatic read-aloud without an overlay and without an unexpected focus move. The final clarified record confirms questionnaire answers did not change. The retained failure was the absence of a visible AQP status message identifying what setting changed.

## External evidence review

### W3C status-message boundary

WCAG 2.2 SC 4.1.3 covers content that reports the result of an action without taking focus. W3C advises that assistive technology should notify the user while their current context remains unchanged. For advisory results, `role=status` / polite live-region behaviour is appropriate; an assertive alert is not justified for an ordinary preference change.

W3C failure F103 also states that a status role/property must exist before the dynamic content is added and that a real assistive-technology failure to surface the message confirms the failure. This project therefore does not credit DOM structure alone.

Primary sources:

- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://www.w3.org/WAI/WCAG22/Techniques/failures/F103.html
- https://www.w3.org/TR/wai-aria/#status

### Mature open-source announcer implementations

The implementation was compared with three established libraries rather than inventing a component-local timing workaround:

1. **Adobe React Aria `LiveAnnouncer`** — commit-pinned source creates persistent body-level polite/assertive logs, appends a fresh child per message, retains messages for seven seconds and records that Safari announcements were inconsistent when the announcer/message was added too quickly.
   - https://github.com/adobe/react-spectrum/blob/5d191ab94472daa8fa53d02e3c425639c2f381a7/packages/react-aria/src/live-announcer/LiveAnnouncer.tsx
2. **Angular CDK `LiveAnnouncer`** — commit-pinned source creates a persistent visually hidden body-level live element, clears the previous content and writes after a 100 ms delay for browser/screen-reader compatibility and repeated messages.
   - https://github.com/angular/components/blob/587f4ae518be71c20a62afbc38082a2677d456fb/src/cdk/a11y/live-announcer/live-announcer.ts
3. **Microsoft Fluent UI `Announced`** — commit-pinned source defaults to polite `role=status` output and uses delayed rendering.
   - https://github.com/microsoft/fluentui/blob/b5ec47fc035849b21b35d6f6054d60c0a64ff3db/packages/react/src/components/Announced/Announced.base.tsx

These sources do not prove that any implementation will pass every AT/browser pair. They support the selected architecture; R3/R4 manual evidence remains decisive.

## Retained RF-09 design

### Native controls remain authoritative

The existing HTML radio buttons and checkboxes, their labels, checked state, persistence and support-change audit records are unchanged. RF-09 observes the native bubbling `change` event only after the existing target-level Lit handler has committed the actual state. It does not infer a requested state before the control changes.

### Visible result for voice-control and sighted routes

A persistent support-feedback location is rendered alongside the support settings. After a real A33 change it displays exactly one current result, for example:

- `Large text selected.`
- `Standard text selected.`
- `Interruption recovery is on. Incomplete answers will be stored in this browser.`
- `Interruption recovery is off. The saved in-progress copy has been removed.`
- `Built-in audio guidance is on. ...`
- `Built-in audio guidance is off. New questions and feedback will not be spoken automatically.`

The visible element is not focusable and is not used as a second live region.

### One AQP announcement channel per change

The already-proven RF-06 body-level announcer is reused with its **polite** log. When built-in automatic audio is off, RF-09 appends one fresh polite item after 100 ms. This separates the setting-result message from the native checked/radio state event and follows the mature-library timing pattern.

When automatic AQP audio is already on, the existing setting handler already speaks the same result through browser speech synthesis. RF-09 updates the visible status but deliberately does not add a second live-region message. Turning automatic audio on uses the existing spoken confirmation; turning it off uses the polite announcer after speech has been stopped. This avoids two simultaneous AQP announcement channels while preserving a visible result for R4.

No focus call, scroll call, answer write, score calculation or input-route mutation is added.

## Focused automated evidence

### Component tests

`source/tests/rf09-support-setting-feedback.test.ts` covers:

- label activation of Large text and interruption recovery;
- exact visible messages;
- one fresh polite announcement when automatic audio is off;
- no assertive announcement;
- retained focus on the activated native input;
- retained selected questionnaire answer;
- built-in speech as the sole AQP audio-on channel;
- one polite audio-off message;
- no false RF-09 status for the unrelated answer-format control.

### Cross-browser rendered test

`source/tests/e2e-support/rf09-support-setting-feedback.spec.ts` runs in Chromium, Firefox and WebKit. It changes all three frozen A33 settings after selecting a rating and checks visible feedback, polite-channel output where applicable, retained input focus, retained answer and absence of assertive output.

### Automated run history

- Initial implementation run `32487433179` failed the three new component tests. Diagnosis showed that patching `connectedCallback` after custom-element registration does not replace the lifecycle callback cached by the platform, and test teardown removed the pre-created announcer DOM. No manual evidence was collected from that candidate.
- The implementation was corrected to attach the bubbling `change` observer structurally in the rendered settings wrapper and to recreate the stable announcer for each isolated test.
- Corrected-source canonical run `32487897508` passed unit/component tests, production build, rendered-browser accessibility checks, Chromium/Firefox/WebKit support checks and release generation. It failed only the generated-release freshness gate, as expected before new CSS/JS output was committed.
- Synchronization run `32488814604` regenerated release files, restored the canonical read-only workflow before committing, and published the immutable `/rf09-preview/` page. The preview `SOURCE-SHA.txt` is bound to runtime `d3af4889c4479a41d54f9c6d4754694f2e0233ed`.

## Evidence boundary and manual gate

Automation can show the implemented message, DOM channel, focus and answer invariants. It cannot prove actual VoiceOver speech or a usable Voice Access visual result.

Required post-fix manual checks on the immutable deployed candidate:

- **R3 VoiceOver + Safari:** activate Standard/Large, recovery on/off and audio on/off one at a time using ordinary pointer/label activation. Transcribe the exact automatic AQP message, record harmful duplication, verify focus is not moved by the status, and verify a preselected answer does not change.
- **R4 Windows Voice Access + Chrome:** use visible-label commands for Large/Standard, recovery and audio. Verify the intended control changes, the visible AQP result is accurate and timely, focus is not unexpectedly moved, and a preselected answer remains unchanged.

Only those route observations can support R3-A33 or R4-A33 F→P. Historical q8 is never rewritten.
