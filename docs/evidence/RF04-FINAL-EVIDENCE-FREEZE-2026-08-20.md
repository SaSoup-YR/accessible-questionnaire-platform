# RF-04 final evidence freeze — 20 August 2026

This document freezes the RF-04 saved-session recovery repair boundary without rewriting the historical q8 manual audit or converting technical/manual route checks into a disabled-user benefit claim.

## Retained executable identity

The final retained participant runtime is the first RF-04 repair implementation, not the later unsuccessful Safari-only timing workaround.

- First manually tested RF-04 repair head: `652b612eb38b62a327586bb94dad58ed437ba07e`.
- Final runtime synchronization commit after rollback: `53ca17d0fcc3d502e6561997d3c3a48719475a2a`.
- Retained recovery source blob: `b757ecd928c6ec6573bd43b08949394e14d4a636` for `source/src/rf04-saved-session-recovery.ts`.
- Root `index.html` blob: `5768b821f05fc2aae4b64dc2e7f4798cd1de7461`.
- Participant bundle: `assets/participant-Ms9X-S-W.js`.

The recovery source blob and root-index blob above are identical to the first manually tested RF-04 repair head. Later documentation/evidence commits do not replace this participant-runtime identity.

## Automated verification

Standard repository verification run `32314041841` completed **success** at evidence head `b4b8c731096160d9ff45e3a78cfbcd0a481df53b`, which contains the retained participant runtime plus the first committed RF-04 manual-adjudication record.

Retained artifacts from that run:

- quantified technical evaluation artifact: `9387436383`;
- rendered accessibility evidence artifact: `9387490253`.

The standard workflow includes locked dependency installation, automated tests, quantified technical reporting, production build, real-browser accessibility regression, Chromium/Firefox/WebKit support regression, rendered evidence publication, release build, and confirmation that committed deployment files are current.

This automation establishes deterministic implementation/regression evidence only. It does not establish VoiceOver accessibility focus, complete WCAG conformance, usability, or disabled-user benefit.

## Frozen manual RF-04 outcome

The historical q8 RF-04 family contained six failures: A14 and A15 on R1, R3 and R4.

Targeted post-fix adjudication:

| Historical cell | Post-fix outcome |
| --- | --- |
| R1-A14 | **P** |
| R1-A15 | **P** |
| R3-A14 | **F** — unresolved |
| R3-A15 | **P** |
| R4-A14 | **P** |
| R4-A15 | **P** |

Therefore **5/6 historical RF-04 failure cells have targeted post-fix closure evidence. R3-A14 remains F.**

R2 was already passing in q8 and was retained only as a regression route; it is not included in the six-cell closure denominator.

The detailed manual record is `docs/evidence/RF04-POSTFIX-MANUAL-AUDIT-2026-08-20.md`.

## R3-A14 evidence boundary

The decisive observation is operational: with VoiceOver enabled on the recorded Safari/macOS route, reload did not make the VoiceOver cursor/accessibility focus land directly on `Resume saved questionnaire`; manual VoiceOver navigation was required.

A visible focus indication observed with VoiceOver off, browser DOM focus, and automated WebKit focus checks were not substituted for the named VoiceOver + Safari route requirement.

Later `VO+Fn+F4` keyboard-focus query attempts are not used as decisive evidence because the tested Mac exposed the function-key control itself as `F4 button`. The R3-A14 Fail therefore rests on the direct post-reload VoiceOver interaction, not on that unreliable diagnostic shortcut.

## Unsuccessful Safari-only follow-up

A later experimental follow-up added a Safari-only delayed blur/refocus transition after the saved-progress status settled. Its exact head `ae2f5c9c667a67307a056c69df98d3d1553a7691` passed standard verification run `32311772049`, but repeated manual VoiceOver + Safari testing still did not make the recovery route land directly on Resume.

Because the follow-up added browser-specific timing complexity without closing its only manual target, it was removed. The final runtime therefore returns to the first repair implementation described above.

## Historical audit preservation

The frozen q8 manual audit remains:

- 132 route-cells;
- 94 P;
- 31 F;
- 7 NA;
- 0 NT.

Do **not** recalculate this as a new global post-fix total. Only selected repair families were retested after q8; a complete 132-cell post-fix re-audit was not performed.

For RF-04, the dissertation may report a targeted trajectory of **six historical failures → five targeted closures + one remaining R3-A14 failure**.

## Relationship to the q10 evidence freeze

The broad q10 technical evidence frozen in `docs/FINAL-EVIDENCE-FREEZE-2026-08-18.md` remains historical evidence for its named executable revision and for the A27 q10 repair. RF-04 is a later targeted repair family and does not rewrite those historical results.

`BUILD-INFO.json` now records both the historical q10 baseline and the later RF-04 targeted status.

## Claim boundary

Safe dissertation wording:

> The frozen q8 baseline contained six RF-04 failures across A14 and A15. Targeted post-fix retesting closed five of those six route-cells under the same observable criteria. R3-A14 remained a VoiceOver + Safari route-specific recovery-focus failure. The historical q8 matrix was retained unchanged.

The dissertation must not state that RF-04 was fully closed, that AQP is universally accessible or fully WCAG conformant, or that these technical/manual route checks establish improved accessibility, usability, comprehension, or benefit for disabled users.
