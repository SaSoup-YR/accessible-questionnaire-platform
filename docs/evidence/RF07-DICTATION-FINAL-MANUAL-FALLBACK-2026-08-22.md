# RF-07 dictation-quality successor — final manual fallback and stop decision

Date: 22 August 2026

Status: **the final materially different RF-07 successor did not expose a dictation-capable on-device route on the tested Windows Chrome environment; RF-07 remains residual F and stops.**

The historical q8 baseline remains immutable at **94 P / 31 F / 7 NA / 0 NT**. This is targeted post-fix evidence only and does not rewrite that matrix.

## Exact candidate

- Pull request: `#81` — `Retry RF-07 with dictation-quality on-device recognition`.
- Exact source/runtime SHA: `f7226f8e47ddcb8649bdacef7ce2e56aae0ef81a`.
- Canonical verification run: `32538921754` — success.
- Fixed SUS launcher: `/rf07-dictation-sus-preview/`.
- Launcher `SOURCE-SHA.txt`: `f7226f8e47ddcb8649bdacef7ce2e56aae0ef81a`.
- Frozen manual phrases: `number four` and `not four`.

## Automated boundary before the live gate

The exact candidate passed:

- 26/26 test files and 237/237 unit/component tests;
- 10/10 dictation-route tests;
- 3/3 component-integration tests;
- 12/12 rendered-browser accessibility tests;
- 15/15 Chromium/Firefox/WebKit support tests;
- production, standalone and release builds;
- generated-release freshness;
- locked-dependency audit with zero reported vulnerabilities.

These results establish deterministic implementation and regression behaviour. They cannot establish that the tested Chrome installation exposes or uses a dictation-capable local speech model.

## Live Windows-Chrome observation

The auditor opened the exact fixed SUS launcher on Windows desktop Chrome and reported the route result:

> `browser speech service fallback`

This means the candidate did not obtain either of its required verified local routes:

- on-device `en-US`, `quality: "dictation"`; or
- on-device `en-GB`, `quality: "dictation"`.

The application therefore followed its deliberate safe fallback to the established remote browser speech service. No screenshot or exact Chrome/Windows version string was supplied for this final fallback observation, so none is invented here.

## Why the fallback does not close A11/A12

The remote Windows-Chrome route had already been manually observed to truncate the frozen two-word phrases, including:

- `not four` → `Not`;
- `number four` → `Number`.

The preceding local command-quality successor likewise failed the frozen two-word action even though bare one-word numbers could sometimes be recognised. The final successor was justified only if Chrome could provide a materially different dictation-capable local model. Because the live browser instead selected the previously unreliable remote service, the frozen A11/A12 mechanism was not newly evidenced.

The fallback itself is therefore sufficient to apply the predeclared stop rule. Repeating the same remote `number four` test is not required to establish a new failure mechanism and would not justify weakening the parser.

## Final adjudication

No RF-07 historical failure is changed to P by this successor:

- R3-A11: remains F;
- R3-A12: remains F;
- R4-A11: remains F;
- R4-A12: remains F.

The application-side safety boundary remains valuable and retained as evidence:

- incomplete transcripts are not completed or guessed;
- negation/exclusion alternatives are vetoed;
- a recognised proposal remains uncommitted until explicit confirmation;
- Try again/Reject preserves the prior answer;
- visible native answer controls remain available.

However, this evidence must not be restated as reliable speech-recognition performance on Windows Chrome.

## Engineering stop

RF-07 has now tested three distinct levels without closing the frozen route:

1. remote Web Speech plus strict parsing/contextual hints;
2. on-device command-quality recognition;
3. a dictation-quality on-device request with safe remote fallback.

The final tested browser did not expose the third route. Further application-side work would require one of the following unacceptable or unsupported changes:

- guessing a missing number from `Number`;
- changing the frozen action to a bare one-word number after seeing it work;
- adding unrestricted fuzzy matching or an invented confidence threshold;
- bundling or transmitting audio to a new third-party recogniser without a new privacy, architecture and validation plan;
- claiming that feature detection or CI proves live recognition accuracy.

Accordingly, PR #81 should close without merge. RF-07 is frozen as a browser/device-dependent residual limitation, with its fail-safe parser and supplementary Edge/mobile observations documented separately.

## Claim boundary

Safe dissertation wording:

> A final Chromium-specific successor requested a dictation-capable on-device speech model, but the tested Windows Chrome installation fell back to the browser speech service. Because that remote route had previously truncated the fixed two-word commands, the four RF-07 A11/A12 cells remained unresolved. The interface nevertheless preserved answer integrity by refusing to infer missing words and by requiring explicit confirmation before committing a recognised proposal.

Do not claim that RF-07 was repaired, that bare-number recognition satisfied the frozen test, or that automated tests establish speech-recognition accuracy.