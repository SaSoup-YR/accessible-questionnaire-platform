# Dissertation research package — deposit manifest draft

Status: **working manifest; not a DOI-bearing published record**  
Date: 24 August 2026

This manifest prevents a final repository deposit from being assembled from memory. A row can be marked `Ready` only when the exact file, version, rights boundary, and checksum are known.

## Package identity

| Field | Current value |
| --- | --- |
| Package title | Accessible Questionnaire Platform: software, technical evidence, and dissertation literature-analysis materials |
| Primary preservation service | Zenodo |
| Software release | `v0.8.1` — pending merge, exact verification, and tag |
| Previous immutable release | `v0.8.0` at `fbbdad5e78c22c26c5c5b020d24b1b876b352b91`; tag must not move |
| Dissertation version | Pending final submission freeze |
| DOI | Not reserved or registered |
| Participant evidence | None; planned observed study not executed |

## Material checklist

| Material | Intended deposited form | Status | Required final check |
| --- | --- | --- | --- |
| AQP software | Archive of exact `v0.8.1` tag or Zenodo-linked software release | Pending | Record tag SHA, release URL, licence, generated-output identity, and checksum. |
| Core evidence index | `EVIDENCE-INDEX.md` plus selected current records | Pending final release | Confirm every link resolves at the tagged tree and archived candidates are not presented as final evidence. |
| Technical evaluation reports | Machine-readable reports and bounded manual audit records | Available, pending manifest | Include exact workflow/run identities and preserve residual failures. |
| Questionnaire definitions | JSON definitions and Schema distributed in the release | Available, pending rights review | Retain instrument attribution and do not imply that the repository MIT licence relicenses third-party item text. |
| Qualtrics integration | Reviewed integration files and instructions | Available | Confirm no credentials, participant responses, tenant identifiers, or private deployment URLs. |
| Search strategy | Final database/search-source methods and exported search log | Not frozen | Reconcile dates, databases, fields, deduplication, and reported counts with the dissertation. |
| Screening data | Final title/abstract and full-text decisions | Not frozen | Include stable record IDs, decisions, reasons, and human adjudication provenance. |
| Study-family table | Final reports-to-independent-studies mapping | Not frozen | Reconcile report count, family count, duplicate/publication relationships, and final included-study count. |
| Author/full-text verification | Exact candidate-paper verification table | Not available as a frozen deposit file | Identify the exact candidate set; record full-text source, page/section, supported claim, caveat, and verifier. |
| Claim matrix | Final Chapter 2 claim-to-source matrix | Not frozen | Every substantive claim must map to verified primary/full text or be labelled as abstract/metadata-level evidence. |
| Analysis code | Scripts/notebooks used for reported counts, tables, or figures | Not frozen | Remove absolute local paths and credentials; add requirements and a reproducible run order. |
| Dissertation tables/figures | Source data and generation instructions | Pending | Verify that deposited values match the final submitted document. |
| README and reuse guide | Plain-language package description | Pending | State what can and cannot be inferred from the materials. |
| Rights and licence manifest | Per-file licence/rights table | Pending | Separate original code/docs, instrument content, publisher PDFs, and non-redistributable materials. |
| Checksums | SHA-256 manifest for all deposited files | Pending | Generate only after package freeze. |

## Excluded from the public deposit

- participant data, consent forms, or participant recordings, because none exist;
- documents containing personal identifiers, private account details, device identifiers, or credentials;
- publisher PDFs that cannot lawfully be redistributed;
- private ethics administration and unexecuted protocol working files unless the final dissertation requires a redacted planning appendix;
- screenshots whose public release would expose account or machine information when a bounded textual observation and checksum are sufficient;
- superseded drafts that do not support a final claim and are already preserved in the project archive.

## DOI and release procedure

1. Complete the material checklist and create a checksum manifest.
2. Create a Zenodo draft and reserve a DOI.
3. Insert the reserved DOI into this manifest and the final Open Science text.
4. Preview the metadata, creators, rights, related identifiers, and file list.
5. Publish only when the deposited package is the one described in the final dissertation.
6. Record the registered DOI on the current repository branch and in the dissertation without moving `v0.8.0` or `v0.8.1`.

## Anonymous submission procedure

The DOI-bearing public record will normally contain creator metadata and is not automatically anonymous. For anonymous marking or blinded review, prepare a separate frozen mirror/view-only package with identifying metadata removed, verify it while signed out, and use only the link permitted by the module. Do not rewrite the public Git history to simulate anonymity.
