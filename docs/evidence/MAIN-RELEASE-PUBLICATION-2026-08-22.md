# AQP v0.8.0 main publication provenance — 22 August 2026

Status: **release published, deployed and smoke-checked; superseded repair branches closed and removed; this documentation-only commit is the final intended main-branch update.**

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

The later documentation-only publication snapshot `613268795c87b52e9816e60172d90abacc97f1cb` also passed the ordinary workflow and was synchronized to GitHub Pages as deployment commit `d2afa9f674ee2a99b902cec4f4721274e37bbe54`.

## Public deployment smoke

A post-deployment HTTP smoke was executed at `2026-08-22T02:21:13.679408Z` and recorded in `PUBLIC-PAGES-SMOKE-2026-08-22.json`.

Observed results:

- participant entry: HTTP 200; title `Participant questionnaire · Accessible Questionnaire Platform Version 0.8`;
- researcher entry: HTTP 200; title `Study conductor · Accessible Questionnaire Platform Version 0.8`;
- every JavaScript and CSS asset referenced by those two pages returned HTTP 200 and a non-empty body;
- body and asset SHA-256 digests were recorded for later integrity comparison.

This is an HTTP/deployment smoke only. It does not replace the recorded rendered-browser or real assistive-technology evidence.

## Repair-branch and pull-request closure

After release publication and the passing public smoke:

- PRs #74, #75, #76, #77, #78, #79 and #82 were closed as superseded by #83 rather than merged again;
- earlier documentation PR #65 was also closed as superseded;
- each PR received a comment explaining which implementation/evidence was retained and which residual failure, if any, remained;
- eleven superseded release/repair branches were deleted, as listed in `FINAL-REPAIR-BRANCH-CLEANUP-2026-08-22.md`;
- the corresponding pull requests, commits, evidence records and immutable release tag remain available;
- no historical audit baseline or failed observation was deleted.

Later `main` commits created and removed one-time publication/smoke workflows and added provenance receipts only. They do not change executable source, generated HTML/assets, questionnaire definitions, scoring, storage, recovery, the Qualtrics bridge, manual adjudications or the six residual failures.

The commit containing this final text is the last intended main-branch publication update. The normal `push` workflow must pass and synchronize this documentation-only tree to `gh-pages`; after that, no further release closeout commit is required. The immutable release tag remains fixed at the already verified and deployed product commit.

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