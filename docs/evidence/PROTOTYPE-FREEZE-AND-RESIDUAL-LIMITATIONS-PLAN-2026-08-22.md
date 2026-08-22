# AQP prototype freeze and residual-limitations plan — 22 August 2026

Status: **RF-04 final adjudication complete; retained-repair integration and release freeze now in progress. Destructive repository cleanup remains prohibited until one integrated exact release passes all gates.**

## Evidence ledgers

Historical q8 remains the immutable pre-repair baseline:

- 132 route/check cells;
- 94 P;
- 31 F;
- 7 NA;
- 0 NT.

After targeted RF-04 closure, the post-fix unresolved ledger contains **6 historical F cells**:

| Family | Cells | Engineering state |
| --- | --- | --- |
| RF-01 | R3-A26 | Frozen Safari + VoiceOver Qualtrics connecting-status residual |
| RF-06 | R4-A10 | Frozen Voice Access / in-page Web Speech microphone-command conflict |
| RF-07 | R3-A11, R3-A12, R4-A11, R4-A12 | Frozen browser/device recognition residual after remote, local-command and dictation-capability attempts |

RF-04 R3-A14 is no longer residual. The native-dialog successor moved the real VoiceOver cursor into the named saved-session modal, exposed the fixed `3 of 10` recovery context and supported direct continuation to Item 4 with all answers preserved. Persistent record: `docs/evidence/RF04-NATIVE-DIALOG-POSTFIX-MANUAL-AUDIT-2026-08-22.md`.

No additional application-level repair attempts are planned for the six residual cells. The next engineering activity is integration, release verification, evidence indexing and cleanup—not another attempt to reduce the failure count.

## Why residual failures are a valid research result

Residual failures must not be hidden or reframed as passes. They are evidence about the boundary between application code and browser/assistive-technology behavior.

Relevant prior evidence:

1. Power, Petrie, Freire and Swallow (2012) observed 1,383 user-problem instances with 32 blind users across 16 websites. Only 50.4% were covered by WCAG 2.0 success criteria; in 16.7% of covered cases, recommended WCAG techniques had been implemented but did not solve the observed user problem. DOI: `10.1145/2207676.2207736`.
2. Vigo, Brown and Conway (2013) found that automated tools covered at most 50% of WCAG success criteria, with completeness of 14–38% and correctness of 66–71%. DOI: `10.1145/2461121.2461124`.
3. Reuschel, McDonnall and Burton (2023) used three different screen-reader/browser combinations for 90 online-job-application trials. Only 55.6% of attempts succeeded, and 76.7% of sites contained a critical problem for at least one combination. DOI: `10.1177/0145482X231216757`.
4. W3C states that no evaluation tool alone can determine accessibility, that knowledgeable human evaluation is required, and that evaluation reports must define scope, record successes and failures, and avoid generalising beyond the tested configurations.

These sources support three dissertation arguments:

- a standards-aligned implementation can still exhibit real user-agent/assistive-technology interoperability failures;
- automated green results cannot overwrite an observed manual failure;
- retaining named residual failures is methodologically stronger than weakening answer-integrity safeguards or claiming universal accessibility.

## Safe dissertation framing

Recommended Results wording:

> The frozen pre-repair audit contained 31 failures across 132 pre-specified route/check cells. Targeted engineering and exact-route retesting closed 25 historical failures while preserving the original matrix as the baseline. Six residual failures remained. They clustered in browser/assistive-technology boundary mechanisms: VoiceOver exposure of an embedded connection status, concurrent operating-system and in-page speech control, and recognition-service variability. These cells were retained as failures when materially different application-level interventions did not satisfy the same observable criterion.

Recommended Discussion wording:

> Residual failures were not treated as evidence that the evaluation was unsuccessful. Rather, they exposed the limits of application-level remediation in a heterogeneous accessibility stack. Prior research similarly shows that guideline implementation and automated conformance checks do not eliminate all problems encountered by assistive-technology users (Power et al., 2012; Vigo et al., 2013), and that outcomes can differ substantially by screen-reader/browser combination (Reuschel et al., 2023). Accordingly, AQP used a fail-safe boundary: incomplete speech transcripts were not guessed, a status was not credited unless the named assistive technology exposed it, and unsuccessful workarounds were rolled back rather than retained solely to reduce the failure count.

Recommended Limitations wording:

> The audit was configuration-bounded and did not establish universal accessibility or disabled-user benefit. Six targeted historical failures remained unresolved after final remediation: four concerned built-in speech recognition, one concerned simultaneous Voice Access and Web Speech operation, and one concerned VoiceOver exposure of an embedded Qualtrics connection status. These findings apply to the named test routes and versions; they should not be generalised to every browser, device or assistive-technology user.

## Prototype freeze entry criteria

A release may be frozen only after:

1. final RF-04 adjudication is recorded — **complete**;
2. every retained successful repair is integrated into one clean release branch — **in progress**;
3. failed experimental successors remain closed/unmerged — **partially complete; verify before freeze**;
4. the complete canonical workflow passes on the exact release commit — **pending**;
5. main and GitHub Pages provenance is verified — **pending**;
6. an immutable version tag/release and build manifest are created — **pending**;
7. a final residual ledger, manual-audit evidence index and dissertation claim boundary are committed — **pending**.

## Repository cleanup policy

### Preserve

- executable source, tests and locked dependencies;
- final generated release files and exact-SHA provenance;
- `BUILD-INFO.json`, `CITATION.cff`, licences and third-party notices;
- manual audit protocol and every final evidence-freeze document;
- evidence of unsuccessful repair attempts that explains residual limitations;
- Qualtrics integration instructions and verified bridge files;
- dissertation deliverables, figures, matrices and reproducibility instructions;
- screenshot hashes and exact runtime identifiers used in the thesis.

### Remove from the final public surface after integration

- temporary one-time synchronization workflows and trigger files;
- superseded generated asset bundles that are no longer referenced by any retained HTML/release;
- duplicate scratch exports, editor backups, empty placeholder files and accidental local artifacts;
- obsolete preview launchers that are not cited by the evidence index;
- stale branch-only instructions that contradict the final release procedure;
- abandoned experimental implementation files not present in the retained release, while preserving their concise evidence record.

### Do not erase or falsify

- commit authorship/history;
- prior failed results;
- audit baselines;
- third-party attribution;
- records needed to reproduce a thesis claim.

“Removing AI traces” means removing low-quality generated prose, temporary scaffolding, duplicated comments and irrelevant scratch artifacts from the final presentation. It does **not** mean rewriting history, concealing tool assistance, deleting contradictory evidence or misrepresenting authorship. Any institutional disclosure requirement takes priority.

## Freeze deliverables

The final repository should expose a small, human-readable top level:

- `README.md` — contribution, scope, run/test links and explicit claim boundary;
- `RELEASE-NOTES.md` — retained features, verified environments and known limitations;
- `EVIDENCE-INDEX.md` — mapping from thesis claims to exact files/SHAs;
- `TESTING.md` — reproducible automated and manual procedures;
- `docs/` — curated implementation and evidence records;
- `source/` — maintainable source and tests;
- verified deployment files only.

Cleanup will be performed through a reviewable pull request with an inventory of every deletion and its preservation decision. No bulk deletion will occur before the final integrated release candidate is reproducible.