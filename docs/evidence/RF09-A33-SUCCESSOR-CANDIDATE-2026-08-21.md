# RF-09 / A33 successor candidate — 21 August 2026

Status: **external research and source/test implementation complete; generated-release synchronization, canonical CI and manual R3/R4 evidence pending**

## Audit identity and evidence boundary

- Branch: `agent/fix-rf09-support-setting-feedback`.
- Stacked base: final retained RF-06 head `e45a59d25e2188f194484c8dadd877cdbdf80ea1`.
- First RF-09 immutable runtime: `d3af4889c4479a41d54f9c6d4754694f2e0233ed` at `/rf09-preview/`.
- Current successor source/test work follows the first candidate's manual failure and is not yet a post-fix Pass.
- Frozen q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.
- The post-fix unresolved count remains **10** until a new immutable R3/R4 route test satisfies the complete A33 rule.

The frozen A33 operation changes text size, interruption recovery and automatic audio one at a time. Each real change must give one timely, accurate result without moving focus or changing a questionnaire answer. DOM structure and browser-engine automation do not substitute for actual VoiceOver or Voice Access output.

## First candidate: useful implementation, failed manual gate

The first candidate added accurate visible setting-result text and a body-level polite log. It preserved the activated control's focus and retained the preselected answer in the captured routes. The supplied `第二次修f(9).docx` final pages nevertheless established two failures:

- **R3-A33 remained F:** VoiceOver captions recorded the native radio/checkbox state (`selected`, `checked`, `unchecked`) but not the separate AQP setting-result text.
- **R4-A33 remained F:** `Click Standard` opened `Which one?` because both `Standard 21-value scale` and Text size `Standard` matched. `Click text size standard` was not found, and the complete six-change sequence was not finished.

Persistent adjudication: `docs/evidence/RF09-A33-POSTFIX-MANUAL-AUDIT-2026-08-21.md`.

## External research for the successor

The successor was selected only after comparing standards, platform behaviour and mature open-source implementations. No source proves universal success; together they identify a stronger, production-tested architecture and a bounded manual hypothesis.

### 1. W3C status-message semantics

- WCAG 2.2 SC 4.1.3 applies to content that reports an action result without taking focus.
- `role=status` is advisory/polite rather than an interruptive alert.
- W3C failure F103 requires the status mechanism to exist before the dynamic message and recognises real assistive-technology non-announcement as a failure.

Sources:

- https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- https://www.w3.org/WAI/WCAG22/Techniques/failures/F103.html
- https://www.w3.org/TR/wai-aria/#status

### 2. Microsoft Voice Access target naming

Microsoft documents commands based on visible item names and numbered disambiguation when multiple matching targets exist. The observed `Which one?` is therefore addressed in the UI rather than through a command workaround:

- visible and programmatic names become **Standard text** and **Large text**;
- the native radio roles and checked states remain unchanged;
- the visible wording remains at the start of the programmatic name.

Source:

- https://support.microsoft.com/windows/use-voice-access-to-interact-with-items-on-the-screen-4e4d9f3e-1b7a-4f75-89ed-886b070f6fbd

### 3. Adobe React Aria

Commit-pinned `LiveAnnouncer` uses persistent body-level polite/assertive logs, appends a fresh child and records that Safari announcements were inconsistent when the announcer/message was added in less than 100 ms.

- Repository: `adobe/react-spectrum`
- Commit: `5d191ab94472daa8fa53d02e3c425639c2f381a7`
- File: `packages/react-aria/src/live-announcer/LiveAnnouncer.tsx`

### 4. Angular CDK and Microsoft Fluent UI

Both use persistent, non-focus-moving live output and delayed mutation rather than a transient component-only message. These sources informed the first candidate but did not by themselves close the real Safari route.

- Angular CDK commit `587f4ae518be71c20a62afbc38082a2677d456fb`, `src/cdk/a11y/live-announcer/live-announcer.ts`
- Fluent UI commit `b5ec47fc035849b21b35d6f6054d60c0a64ff3db`, `packages/react/src/components/Announced/Announced.base.tsx`

### 5. GitHub ARIA Notification polyfill

GitHub's current open-source polyfill is a materially stronger successor to another hand-written live-region variation:

- it provides the proposed `Element.ariaNotify()` / `Document.ariaNotify()` interface;
- it uses native browser support when available;
- otherwise it creates a live region scoped to the invoking element's document/dialog root;
- it queues messages;
- it waits 250 ms before mutating a newly created region;
- it handles repeated identical strings with a non-audible DOM difference;
- its repository runs Guidepup jobs on macOS and Windows.

Source identity used by AQP:

- Repository: `github/arianotify-polyfill`
- Commit: `15d720f075fbe12583e2cc0dab72956384e5c5ef`
- File: `arianotify-polyfill.js`
- Licence: MIT, Copyright (c) 2024 GitHub

The vendored adaptation is `source/src/vendor/github-arianotify-polyfill.ts`. The source mechanism is retained; AQP adds only TypeScript/module wrapping, project comments and a defensive `CSS.supports` availability check for non-browser test environments. The full attribution is in `THIRD_PARTY_NOTICES.md`.

### 6. WebKit implementation status

Current WebKit source contains `ariaNotify` implementation and macOS accessibility layout tests. This supports feature detection, but it does **not** prove that the auditor's Safari 18.4 build exposes the native API. The GitHub fallback must therefore remain available, and the exact Safari/VoiceOver result remains the deciding evidence.

- WebKit commit inspected: `a74316b16e9a7b2067d23ededbdfebf7741d7e74`
- Relevant paths: `Source/WebCore/dom/*ariaNotify*` and `LayoutTests/accessibility/mac/aria-notify*`

## Successor implementation

### Unique Voice Access targets

The visible Text size labels are normalised to:

- `Standard text`
- `Large text`

The same strings are used as the radio programmatic names. This removes the exact collision with `Standard 21-value scale` while preserving native radio semantics and setting logic.

### Visible result

The blue AQP result remains immediate and accurate for every real setting change. It is not focusable. Each relevant setting control exposes `aria-controls` pointing to that visible advisory result.

### ARIA Notification path

When automatic AQP audio is off:

1. the existing native setting handler commits the radio/checkbox state;
2. RF-09 updates the visible result immediately;
3. after 400 ms, RF-09 invokes `target.ariaNotify(message, {priority: 'normal'})`;
4. where the native API is unavailable, the GitHub fallback creates/uses its scoped polite region and mutates it after its own 250 ms delay.

The resulting fallback message mutation is approximately 650 ms after activation, separating it from VoiceOver's immediate native `selected` / `checked` output without changing focus.

When built-in AQP audio is on, the existing speech-synthesis confirmation remains the sole AQP spoken channel; RF-09 does not add a second notification. Turning audio off uses the normal-priority notification after speech has been cancelled.

### Explicit non-changes

The successor adds no focus or scroll call and does not modify:

- questionnaire answers;
- ratings/pairwise input routes;
- scoring;
- recovery persistence behaviour;
- support-change audit records;
- Qualtrics collection;
- RF-06 speech-recognition logic.

## Automated evidence required

Focused component and cross-browser tests must prove:

- unique `Standard text` / `Large text` visible and programmatic names;
- `aria-controls` relationship to the visible result;
- one normal-priority notification for each applicable real change;
- no notification for audio-on when existing AQP speech is the selected channel;
- one notification for audio-off;
- no notification for unrelated answer-format controls;
- retained focus and preselected answer;
- unchanged older component status and no assertive output;
- Chromium, Firefox and WebKit rendered mechanism coverage.

The vendored fallback also retains its scoped-region creation, queue, 250 ms delay and repeated-message handling from the commit-pinned upstream source.

## Manual gate after immutable deployment

### R3 — VoiceOver + Safari

Use ordinary pointer/label activation after preselecting a rating. Change `Large text`, `Standard text`, recovery on/off and audio on/off one at a time. Record:

- exact automatic VoiceOver/AQP speech;
- any harmful duplicate AQP result;
- actual focus;
- retained answer.

### R4 — Windows Voice Access + Chrome

Use `Click Large text` and `Click Standard text`, then the recovery/audio visible labels. Record:

- command bar result;
- whether any `Which one?` disambiguation remains;
- exact visible AQP result;
- focus behaviour;
- retained answer.

Only the complete route observations can close R3-A33 or R4-A33. If the production-notification successor still does not speak in the exact Safari/VoiceOver route, R3-A33 remains F; source provenance and automation will not override that result.
