# Final technical evidence freeze — 18 August 2026

This document freezes the technical-evaluation evidence boundary without converting technical checks into a disabled-user benefit claim.

## Executed source identity

- Executed main revision: `7a74b2a863b775ce6bb9741756dfd022e9afe627`.
- Main push verification: GitHub Actions run `32039156231`, conclusion **success**.
- Exact-main quantified technical artifact: `9291578791`.
- Exact-main rendered accessibility artifact: `9291614890`.
- GitHub Pages deployment commit `b678d2423e5bfeeb4581723ff343ec334b0fc628` records `Deploy verified main 7a74b2a863b775ce6bb9741756dfd022e9afe627`.

A later evidence-only documentation commit does not replace the executed-source identity above. If product code changes, this freeze must be regenerated for the new executable revision.

## Quantified technical evaluation

The exact-main artifact reports:

- fidelity: 8 cases, 31 items, 234 field comparisons, 0 mismatches;
- negative battery: 12 adversarial inputs, 0 silently altered;
- export reconstruction: 8/8 exports and 31/31 response values reconstructed, 0 mismatches; and
- bounded shared-contract reuse: 96/96 required case-contract executions with 0 instrument-specific contract copies for the evaluated cases.

These results apply only to the declared response/scorer/import boundary. They do not establish questionnaire independence or psychometric equivalence.

## Rendered accessibility automation and contrast adjudication

The exact-main rendered artifact reports 27 named states × 5 profiles = 135 scans, with:

- 0 axe violations;
- 13 `color-contrast` incomplete scan results involving 20 node occurrences;
- 0 horizontal-overflow failures;
- 0 critical target-size failures; and
- 0 missing required state/profile rows.

The 20 incomplete node occurrences were then manually adjudicated against the exact-main CSS. All 20 meet a conservative 4.5:1 text-contrast threshold; the minimum calculated ratio is 6.68:1. The auditable selector-level record is `docs/evidence/axe-contrast-manual-adjudication.json`.

The manual adjudication resolves only the listed axe background-determination incompletes. It is not a complete WCAG 2.2 conformance claim.

## A27 q10 targeted manual retest

The previously retained q10 manual evidence is authoritative for A27 and must not be replaced by the older pre-retest wording in `BUILD-INFO.json`.

Frozen routes:

| Route | Configuration | q10 outcome |
| --- | --- | --- |
| R1 | NVDA + Firefox | P |
| R2 | NVDA + Chrome | P |
| R3 | VoiceOver + Safari | P |
| R4 | Voice Access + Chrome | P |

Across the named routes, the retained evidence records truthful waiting with no premature recorded-success claim, preservation of the completed recovery state after the forced host-advance failure, retained backup controls, and a continuing native retry route without reset to `Before you begin`. R4 additionally retained direct OS voice-control evidence: `click next page` was executed as `Left clicked Next page`, followed by the Qualtrics recorded page.

The retained final-method evidence also records six q10 Qualtrics host rows with `AQP_ACCEPTED=1`, bridge `0.8.10-q10`, primary score 50.00, reconstructable raw chunks, the fixed SUS response vector `5,1,4,2,3,5,1,4,2,3`, and consistent definition-hash/submission identifiers.

Therefore the A27 repair trajectory is **q8 F → q9 F → q10 P** for R1–R4. This is a targeted finding. It must not be rewritten as a claim that all manual audit rows or all WCAG criteria pass.

## Claim boundary

The dissertation may state that the named executable revision has reproducible evidence for bounded definition-driven reuse, fidelity, fail-closed behaviour, export reconstruction, the named automated rendered checks, manual resolution of the listed contrast incompletes, and the targeted A27 R1–R4 q10 recovery result.

It must not state that AQP is universally accessible, fully WCAG conformant, psychometrically equivalent across presentation modes, or proven more accessible/beneficial for disabled users without representative-user evidence.
