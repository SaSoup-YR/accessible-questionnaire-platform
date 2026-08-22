# AQP v0.8.0 main publication provenance — 22 August 2026

Status: **publication marker for the final main-branch verification and immutable release.**

## Merge identity

- final integration pull request: `#83`;
- exact reviewed PR head: `d4a99cd4426c95d6f60d24d4f7f9d2f2aef1b223`;
- exact-head read-only workflow: `32545032524` — success;
- squash-merge commit: `ef3f46614bc3b40d02de1665a2901d017a5e00ab`;
- merge commit tree: `2b2ba68df35514bfec007ba5e52646501e597af4`.

The merge commit contains the complete retained source, generated release, evidence index, release notes, citation metadata, repository curation and six-cell residual-failure boundary approved in PR #83.

## Why this marker is a separate commit

The connector-mediated squash merge did not immediately expose a push-triggered Actions run through the available commit-run query. This documentation-only marker creates an unambiguous main-branch push after the merge so that the ordinary read-only workflow and its GitHub Pages synchronization can be observed on a named final repository snapshot.

This file changes no executable source, generated asset, questionnaire definition, scoring, storage, recovery, Qualtrics bridge or manual adjudication. The immutable `v0.8.0` tag must point to this marker commit or a later documentation-only publication commit only after:

1. the ordinary `Verify source and generated release` workflow passes;
2. `gh-pages` is synchronized from that verified main snapshot;
3. the deployed participant and researcher entry points load successfully;
4. the tag is confirmed not to move after publication.

The historical q8 baseline remains `94 P / 31 F / 7 NA / 0 NT`; targeted post-fix evidence closes 25 of 31 historical failures and retains six route-specific failures.