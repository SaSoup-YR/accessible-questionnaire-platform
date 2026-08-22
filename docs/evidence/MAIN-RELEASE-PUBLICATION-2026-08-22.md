# AQP v0.8.0 main publication provenance — 22 August 2026

Status: **release published; final documentation-only main snapshot submitted to the ordinary verification and GitHub Pages synchronization workflow.**

## Reviewed and released product identity

- final integration pull request: `#83`;
- exact reviewed PR head: `d4a99cd4426c95d6f60d24d4f7f9d2f2aef1b223`;
- exact-head read-only workflow: `32545032524` — success;
- squash-merge commit: `ef3f46614bc3b40d02de1665a2901d017a5e00ab`;
- released product tree: `2b2ba68df35514bfec007ba5e52646501e597af4`;
- immutable tag: `v0.8.0`;
- published release title: `Accessible Questionnaire Platform v0.8.0`;
- release publication time: `2026-08-22T02:11:51Z`;
- release receipt: `V0.8.0-RELEASE-PUBLICATION.json`.

The immutable tag resolves to `ef3f46614bc3b40d02de1665a2901d017a5e00ab`. This is deliberate: it is the signed squash-merge commit whose exact product tree was verified and deployed before release publication.

## Main and deployment verification

The merge-triggered ordinary workflow passed and synchronized GitHub Pages as:

- deployment commit: `b39466ce01ae1814e80702d8b07df8250bf369bf`;
- deployment message: `Deploy verified main ef3f46614bc3b40d02de1665a2901d017a5e00ab`;
- deployed tree: `2b2ba68df35514bfec007ba5e52646501e597af4`.

The deployed tree therefore matched the immutable released product tree byte-for-byte at the Git tree level.

Later `main` commits created and then removed the one-time publication workflows and added this provenance record plus the machine-readable release receipt. They are documentation/publication metadata only: they do not change executable source, generated HTML/assets, questionnaire definitions, scoring, storage, recovery, the Qualtrics bridge, manual adjudications or the six residual failures.

The commit containing this final text is the last intended main-branch publication update. The normal `push` workflow must pass and synchronize that documentation-only tree to `gh-pages`; the release tag itself remains fixed at the already verified and deployed product commit.

## Evidence boundary retained at publication

The historical q8 baseline remains immutable:

- 132 route/check cells;
- 94 Pass;
- 31 Fail;
- 7 Not applicable;
- 0 Not tested.

Targeted post-fix evidence closes 25 of the 31 historical failures. Six configuration-specific failures remain:

- RF-01: R3-A26;
- RF-06: R4-A10;
- RF-07: R3-A11, R3-A12, R4-A11 and R4-A12.

The published release does not claim universal accessibility, complete WCAG conformance, psychometric equivalence, usability improvement, reduced cognitive burden, disabled-user benefit or permission to recruit.