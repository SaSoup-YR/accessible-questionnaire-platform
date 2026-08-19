# RF-04 post-fix manual adjudication — 2026-08-20

Status: **targeted RF-04 manual closure recorded; historical q8 matrix remains immutable**

## Evidence boundary

This document records a targeted post-fix retest of the RF-04 saved-session recovery family only. It does **not** replace or recalculate the frozen q8 132-cell manual audit. The q8 baseline remains 94 P / 31 F / 7 NA / 0 NT.

The six historical RF-04 failures were A14 and A15 on R1, R3 and R4. R2 was already passing in q8 and is retained only as a regression route.

A targeted post-fix pass means that the same frozen observable requirement was satisfied on the named route after the repair. It is not a global accessibility score and does not establish usability or benefit for disabled users.

## Frozen recovery case

- Questionnaire: System Usability Scale (SUS), 10 items.
- Recovery enabled.
- Save exactly three responses: Item 1 = 5, Item 2 = 1, Item 3 = 4.
- Do not activate Next after Item 3.
- Reload the same participant link.

A14 requires the saved count `3 of 10`, Resume and Erase choices, and direct usable recovery focus on Resume in the tested route.

A15 requires Resume to preserve the three answers, continue at the logical next item (Item 4), focus the Item 4 heading, leave Item 4 unanswered, and make no automatic answer change.

## Manual observations

| Route | Cell | Post-fix result | Observation |
| --- | --- | --- | --- |
| R1 NVDA + Firefox | A14 | **P** | Reload exposed `3 of 10`; Resume and Erase were available; focus was observed on `Resume saved questionnaire`. NVDA exposed the saved-session region, count and Resume/Erase actions. |
| R1 NVDA + Firefox | A15 | **P** | Activating Resume continued to Rating 4 of 10 / Item 4; Item 4 heading received focus; Item 4 was unanswered; Items 1–3 remained 5/1/4. |
| R2 NVDA + Chrome | A14 regression | **P** | Reload exposed `3 of 10`; Resume and Erase were available; focus was observed on Resume. R2 was not a historical RF-04 failure. |
| R2 NVDA + Chrome | A15 regression | **Observed consistent with prior pass** | Resume continued to Rating 4 of 10 / Item 4 with Item 4 heading focus and no Item 4 answer. The uploaded manual note did not separately transcribe a second 5/1/4 retention check for R2, so no new closure claim depends on this route. |
| R3 VoiceOver + Safari | A14 | **F** | With VoiceOver enabled, reload did not place VoiceOver focus directly on `Resume saved questionnaire`; manual VoiceOver navigation was required. A visible focus indication/DOM focus alone was not treated as sufficient AT-route evidence. |
| R3 VoiceOver + Safari | A15 | **P** | After Resume was activated, the runner continued directly to Rating 4 of 10 / Item 4; Item 4 heading received focus; Item 4 remained unanswered; Items 1–3 remained 5/1/4. |
| R4 Windows Voice Access + Chrome | A14 | **P** | Reload exposed `3 of 10`; Resume and Erase were visible; the Resume control was the recovery target. |
| R4 Windows Voice Access + Chrome | A15 | **P** | `Click Resume saved questionnaire` directly activated Resume; the runner continued to Rating 4 of 10 / Item 4; Item 4 heading received focus; Item 4 remained unanswered; Items 1–3 remained 5/1/4. |

## Targeted closure result

Historical RF-04 failures:

- R1-A14: F → **P**
- R1-A15: F → **P**
- R3-A14: F → **F** (unresolved)
- R3-A15: F → **P**
- R4-A14: F → **P**
- R4-A15: F → **P**

Therefore **5 of the 6 historical RF-04 failure cells have targeted post-fix closure evidence; 1 of 6 remains unresolved (R3-A14).**

Do not convert this result into a new global 132-cell total. A full post-fix re-audit of all 132 cells was not performed.

## Safari-only follow-up and rollback decision

After the first RF-04 repair, a narrow Safari-only delayed blur/refocus workaround was trialled because R3-A14 remained F. The follow-up exact head passed automated checks, but repeated manual VoiceOver + Safari testing still did not provide direct VoiceOver focus on Resume. Because the workaround added browser-specific timing complexity without closing its only manual target, it was removed.

The final RF-04 runtime returns to the first repair implementation. The final runtime source file `source/src/rf04-saved-session-recovery.ts` has the same Git blob (`b757ecd928c6ec6573bd43b08949394e14d4a636`) as the first manually tested repair head `652b612eb38b62a327586bb94dad58ed437ba07e`. The generated root `index.html` also returns to the same blob (`5768b821f05fc2aae4b64dc2e7f4798cd1de7461`) and the same participant asset name `participant-Ms9X-S-W.js`.

Runtime synchronization commit after rollback: `53ca17d0fcc3d502e6561997d3c3a48719475a2a`.

## Interpretation allowed in the dissertation

Safe wording:

> The frozen q8 baseline contained six RF-04 failures across A14 and A15. Targeted post-fix retesting closed five of those six route-cells under the same observable criteria. R3-A14 remained a VoiceOver + Safari route-specific recovery-focus failure. The historical q8 matrix was retained unchanged.

Do not write that RF-04 was fully closed, that the platform is accessible, or that the repair demonstrates benefit for disabled users.
