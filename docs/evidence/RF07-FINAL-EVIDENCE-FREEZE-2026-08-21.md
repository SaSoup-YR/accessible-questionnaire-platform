# RF-07 / A11–A12 final evidence freeze — 21 August 2026

Status: **engineering family frozen with a residual browser/device-dependent recognition limitation; no further parser weakening justified**.

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. This record is targeted post-fix evidence only and does not rewrite the historical matrix.

## Exact retained candidate

- PR: `#79` — `Harden RF-07 speech proposal and negation safety`.
- Product/runtime source SHA: `f6b03bdba4fde876e606a94b6ad3e957cae99e09`.
- Canonical verification run: `32518516660` — success.
- Frozen SUS manual launcher: `/rf07-sus-speech-preview/`.
- Frozen phrases: `number four` and `not four` on the SUS 1–5 response scale.

## Retained implementation boundary

RF-07 keeps the application-side safety boundary narrow:

1. one-shot final-result Web Speech recognition;
2. up to five ranked alternatives;
3. exact/bounded parsing rather than unrestricted fuzzy matching;
4. veto when any returned alternative contains unresolved negation/exclusion meaning;
5. contextual bias for the currently valid answer vocabulary, including `not <spoken value>`;
6. visible/hearable transcript and proposed answer;
7. no response commit until explicit confirmation;
8. rejection and visible/native answer controls remain available;
9. no invented confidence threshold, deprecated grammar, transcript completion or automatic guess.

The candidate also orders safety-critical value/negation hints before convenience wrappers so the existing 120-phrase runtime cap does not starve later values on the 21-value NASA-TLX scale.

## Windows Chrome observation

On the exact RF-07 SUS candidate, built-in Web Speech recognition in Chrome on the tested Windows computer was intermittent and usually unreliable for the frozen two-word phrases.

Two retained observations:

- The auditor said `not four`; AQP displayed `No answer was selected. I heard “Not”.`.
- The auditor said `number four`; AQP displayed `No answer was selected. I heard “Number”.`.

The important product-side result is fail-safe: AQP did **not** infer or propose 4 from either incomplete transcript. This is evidence that the strict parser preserves answer integrity when the upstream recognizer supplies insufficient text; it is not evidence that Chrome recognition accuracy is satisfactory.

The auditor also reported that Chrome occasionally recognised the complete phrase correctly on the same Windows computer. Occasional success is not used to turn an unreliable frozen route into a Pass.

## Supplementary cross-browser/device observations

The auditor reported the following additional checks with the same AQP speech route:

- Microsoft Edge on the same Windows computer: the A11/A12 sequence worked normally.
- Chrome on a phone: speech recognition worked.
- Chrome on an iPad: speech recognition worked.

Exact phone/iPad models, OS versions, browser versions and repetition counts were not captured, so none is invented here. These are retained as **supplementary compatibility observations**, not substitutions for the frozen Windows-Chrome route and not recognition-accuracy measurements.

The contrast is technically plausible because Web Speech recognition depends on the browser/platform recognition implementation, device audio stack and service path; sharing a Chromium-derived UI/engine does not imply identical recognition behaviour across Edge, desktop Chrome, Android/iOS Chrome or different devices.

## Screenshot integrity and evidential limit

Retained conversation screenshots:

- `4c1c66fb-9b65-460d-98a8-5974f3535377.png` — SHA-256 `ea93ac05f933f6c161d53e133f251528c6b8f1e6868c2b86d3d674c77aadb1e8`.
- `b876bd0b-c57e-4eed-b992-26048b8cd7c1.png` — SHA-256 `41e8f4061b9a3eb79b360de0a9097d93775f0b9e495344863e62833f01d0b721`.

Both screenshots show response value 4 already selected before/through the failed recognition attempts. They therefore prove the incomplete transcripts and AQP's no-new-proposal response, but they do **not by themselves** prove that `not four` preserved an initially empty or non-4 stored answer. That distinction is retained rather than inferred away.

## Adjudication

- **Application-side RF-07 safety hardening:** retained; automated regressions and observed incomplete-transcript behaviour support the bounded parser/error-prevention claim.
- **Windows Chrome recognition reliability:** residual limitation retained. Intermittent recognition is not reclassified as a reliable Pass.
- **Edge / phone Chrome / iPad Chrome:** supplementary working observations only; they do not overwrite the frozen Windows-Chrome result.
- **Any RF-07 route not rerun on this exact candidate:** not silently reclassified in this file.

The appropriate engineering stop is therefore **F→residual-F where live recognition remains unreliable**, not a parser workaround that guesses missing words. No further RF-07 code change is justified without a materially different speech-recognition architecture or browser/platform change.

## Why RF-07 stops here

Web Speech contextual phrases are probabilistic biasing, not a constrained grammar. If the upstream recognizer returns only `Number` or `Not`, the application cannot truthfully reconstruct the missing word `four`. Mapping an incomplete transcript to an answer would increase the risk of an unintended questionnaire response and undermine the explicit proposal/confirmation safety model.

Accordingly, RF-07 closes as an engineering investigation with a documented residual platform limitation. It does not claim universal speech-recognition reliability, accessibility benefit, complete WCAG conformance or psychometric equivalence.

## External basis reviewed

- W3C Web Speech API / current browser documentation for final results, ranked alternatives and contextual phrase biasing.
- Browser/platform documentation showing recognition remains implementation/service dependent.
- `JamesBrill/react-speech-recognition` as a mature open-source comparison: browser-dependence is explicit and fuzzy matching is optional rather than a safe substitute for exact answer semantics.
- The earlier RF-07 repair-plan record for the complete standards/open-source comparison and stop rules.
