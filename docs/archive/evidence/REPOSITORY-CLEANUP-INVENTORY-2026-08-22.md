# Final repository cleanup inventory — 22 August 2026

Status: **curation complete on the release-candidate branch; destructive history rewriting prohibited.**

## Purpose

The cleanup prepares a small, credible public surface for the dissertation prototype without deleting evidence that explains the research result. “Removing AI traces” is interpreted as removing machine-specific scaffolding, stale/generated prose and accidental implementation residue from the current tree. It is not interpreted as concealing tool use, changing authorship, rewriting commit history or deleting failed results.

## Completed current-tree actions

| Path/surface | Action | Reason/evidence preservation |
| --- | --- | --- |
| `README.md` | Replaced the stale development narrative with the final contribution, run instructions, verification snapshot, six residual cells and explicit claim boundary. | Old commits preserve the previous text; the new README matches the final release state. |
| `TESTING.md` | Replaced q9-era instructions and pending manual routes with the final deterministic, rendered-browser, manual-AT, Qualtrics and release procedures. | Versioned evidence files retain historical procedures and outcomes. |
| `BUILD-INFO.json` | Replaced the stale RF-04 5/6 narrative and old counts with a concise machine-readable final candidate record. | Historical build records remain in Git history and evidence documents. |
| `RELEASE-NOTES.md` | Added. | Presents retained capabilities, exact verification and known limitations without overclaiming. |
| `EVIDENCE-INDEX.md` | Added. | Maps final claims to exact source, evidence files, revisions, runs, artifacts and hashes. |
| `docs/evidence/FINAL-PROTOTYPE-FREEZE-2026-08-22.md` | Added. | Freezes the engineering stop rule, residual ledger and dissertation claim boundary. |
| `tools/build_evaluation_documents.py` | Removed the absolute `/root/...` helper import. | The document builder no longer depends on a machine- or assistant-container-specific path. |
| `tools/docx_table_geometry.py` | Added repository-local table geometry helpers. | Preserves document-generation capability in an ordinary Python environment. Existing DOCX files were not silently regenerated or claimed as newly inspected. |
| `.github/workflows/final-integration-once.yml` | Automatically removed after successful construction. | Workflow run `32543873697` and the integration preflight record preserve what it did. |
| `.github/workflows/final-curation-once.yml` | Automatically removed after its single successful run. | The resulting commit and this inventory preserve the action. |
| Generated `index.html`, `study.html`, `assets/`, questionnaire release files and standalone HTML | Rebuilt from integrated source through `npm run build:release`. | Generated conflicts were not hand-edited; freshness is checked by the canonical workflow. |

## Preserved deliberately

The following are necessary research or release records and are not “junk”:

- `source/`, tests, locked dependencies and build configuration;
- root generated release files served by GitHub Pages;
- `questionnaires/` definitions and schema;
- `integrations/qualtrics/` bridge/package material;
- `docs/manual-audit/` and `docs/evidence/`, including failures and unsuccessful-repair stop rationales;
- `deliverables/` dissertation/project documents;
- `BUILD-INFO.json`, `CITATION.cff`, `LICENSE` and `THIRD_PARTY_NOTICES.md`;
- exact run IDs, revisions, artifact IDs and screenshot hashes;
- closed/open PR discussions needed to reconstruct how a residual failure was adjudicated.

The two submitted RF-04 screenshots are not committed to the public repository because they include ordinary browser/account context. Their exact observations and SHA-256 hashes are committed instead.

## Generated assets

The release synchronizer owns the hashed files under `assets/`. Superseded unreferenced bundles are removed by that build process; retained assets are those referenced by the committed root entry points. No separate manual asset deletion is performed after a passing generated-freshness check.

## Search and presentation review

The current final surface was reviewed for explicit `ChatGPT` and `Claude` strings; none were required by the software or evidence. The one current-tree machine-specific document-helper path was replaced by the repository-local module described above.

Commit history may still contain truthful co-author/tool metadata from earlier development. That history is not altered. Any university requirement to disclose computational assistance takes precedence over presentation preferences.

## Deferred until after verified merge/tag

- Close superseded repair PRs with a link to the integrated release and their retained evidence outcome.
- Delete obsolete working branches only after the final tag exists and PR records remain reachable.
- Verify the merged main commit, GitHub Pages source and public smoke route.
- Create the immutable `v0.8.0` tag/release.

These operations must not remove evidence cited by the dissertation or change the six-cell residual ledger.

## Final deletion rule

A file may be removed only when all three conditions hold:

1. it is not executable source, a generated file referenced by the release, a licence/attribution record, dissertation material or evidence supporting a thesis claim;
2. an inventory entry identifies why it is obsolete and where any needed information is preserved;
3. the exact post-deletion tree passes the canonical workflow and generated-release freshness gate.

No bulk deletion or history rewrite is authorized by this cleanup.
