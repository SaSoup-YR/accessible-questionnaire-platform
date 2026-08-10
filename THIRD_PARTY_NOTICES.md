# Third-party questionnaire content

The software implementation and the questionnaire instruments are separate works.
The repository's MIT licence covers original AQP software and project documentation;
it does not grant permission to copy,
modify or redistribute an instrument.

## NASA Task Load Index

The built-in weighted NASA-TLX and Raw TLX definitions cite NASA source material.
The release owner must retain the source attribution and confirm any applicable terms
for the exact wording and graphics used in a public release.

- Source recorded by the definition:
  https://ntrs.nasa.gov/api/citations/20200002718/downloads/20200002718.pdf

## System Usability Scale

The built-in System Usability Scale definition cites Brooke's instrument and scoring
rule. Retain the citation and verify the intended academic/public-repository use before
applying a repository-wide licence to the item text.

- Brooke, J. (1996). *SUS: A “quick and dirty” usability scale*. In *Usability
  Evaluation in Industry*.

## User Experience Questionnaire - Short (UEQ-S)

The official site makes materials available free of charge, but its legal notice says
that duplication, processing or distribution beyond copyright law requires prior
written consent. No explicit public source-repository licence has been identified.

No written permission covering a public source repository and deployed application
has been recorded. The current release candidate therefore removes the built-in
UEQ-S item text and public catalogue entry. AQP's generic semantic-differential
renderer is tested using original synthetic wording. The existing specialised
scoring extension is exercised only with synthetic test items and is not advertised
as a distributable built-in instrument.

UEQ-S content may be restored only after written permission is archived and the
release is rebuilt, re-evaluated and re-reviewed.

- Materials: https://www.ueq-online.org/
- Legal notice: https://www.ueq-online.org/Legal.html
- Project release decision: [`docs/UEQS-RELEASE-GATE.md`](docs/UEQS-RELEASE-GATE.md)

## Repository licence scope

Original AQP code and original project documentation are offered under the MIT
licence in `LICENSE`. Third-party questionnaire wording remains governed by its own
terms and the applicable law. Adding a file to this repository does not relicense
that content.
