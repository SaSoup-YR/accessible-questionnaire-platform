# RF-07 on-device command-model manual observation — 22 August 2026

Status: **the command-quality on-device successor did not close the frozen two-word A11/A12 route; a higher-capability dictation-quality successor is justified.**

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. This is targeted post-fix evidence only.

## Exact candidate and environment boundary

- PR: `#81` — `Retry RF-07 with on-device command recognition`.
- Exact source/runtime SHA under test: `f4c60d3b70a9b86fa06bb3071ba6a2155be4963b`.
- Frozen launcher: `/rf07-on-device-sus-preview/`.
- Environment reported by the auditor: Windows desktop Chrome; Windows Voice Access was not used for this built-in-recognition check.
- AQP exposed the route message: `Listening for one answer using on-device English recognition (en-GB).`

Exact Windows and Chrome version strings were not captured in the supplied screenshots and are not invented here.

## Observed recognition behaviour

The auditor repeatedly tested the frozen `number <value>` form on the SUS 1–5 route.

Observed pattern:

- for values 2–5, saying `number <value>` usually returned only `Number`, so AQP could not safely propose the intended value;
- `number one` produced the transcript/value `1` on one observed attempt;
- saying a **bare number** without the `number` prefix was recognised sufficiently to produce proposals, including retained screenshots showing `I heard: 5` / proposal 5 and `I heard: 1` / proposal 1.

This is evidence that the browser-installed command model and AQP parser can support a bare single-token number on this device. It is **not** evidence that the frozen two-word phrase is reliable.

## Safety result

AQP did not infer a missing value from the incomplete `Number` transcript. The proposal/Confirm/Try again boundary remained visible, and a proposal remained uncommitted until explicit confirmation.

That fail-safe behaviour is retained. Mapping the incomplete word `Number` to any response would be unsafe and is not proposed.

## Frozen-cell adjudication

The A11/A12 fixed test data requires the two-word phrase `number four`, with `not four` as the negation-safety phrase. Bare-number success does not silently replace that frozen action.

Therefore the command-quality candidate does **not** change any historical RF-07 cell to P:

- R3-A11: unchanged;
- R3-A12: unchanged;
- R4-A11: remains F on this candidate;
- R4-A12: remains F on this candidate.

## Why one further architecture change is justified

The current Web Speech API now distinguishes model capability levels. `command` is the lowest floor for short, limited-vocabulary commands; `dictation` is a higher semantic-capability floor. MDN and the current Web Speech specification explicitly demonstrate checking/installing a `dictation`-quality on-device pack before starting recognition.

The next bounded successor therefore:

1. requires `quality: "dictation"` rather than silently accepting the command/default pack that was manually observed truncating the frozen phrase;
2. prefers the documented Chrome local-English `en-US` pack, with `en-GB` as a bounded local fallback;
3. retains remote `en-GB` when no dictation-capable local model is available or the quality API is blocked;
4. changes no parser, answer, score, storage, submission or confirmation semantics;
5. still requires an exact live `number four` / `not four` retest before any F→P claim.

If the dictation-quality successor also returns only `Number` or otherwise fails the frozen phrase, RF-07 must return to residual-F and stop; bare-number recognition may be documented as a supplementary route but must not be used to rewrite the frozen result.

## Screenshot integrity

Conversation evidence files and SHA-256 digests:

- `1ad99098-d71b-47a8-aa3f-e6aa4a98869b.png` — `f33d41deadc2c3d1e226bee6e4e6cacf520f628406a539c22dd2e9611188e925`;
- `c08189ac-76a6-4cf5-8b58-c00242a836ff.png` — `ca801256437a6e04e232ece5125a04a195f67c32b487f3ca4ac49d3b8f426b7c`;
- `5fef7e2a-631b-4517-82fd-4eefe7e679f3.png` — `1819c203cb8fd054165cce53d67b8ee93a2d6a42e23edcbbbb1af5853f2afbd7`.

The screenshots remain conversation evidence; the digests allow later byte-for-byte verification.
