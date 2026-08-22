# Third-party notices

The software implementation and the questionnaire instruments are separate works.
The repository's MIT licence covers original AQP software and project documentation;
it does not grant permission to copy, modify or redistribute an instrument or other
third-party material except under that material's own terms.

## Software implementation

### GitHub ARIA Notification polyfill

AQP vendors a bounded TypeScript adaptation of GitHub's ARIA Notification API
polyfill in:

- `source/src/vendor/github-arianotify-polyfill.ts`

Source identity:

- Repository: `github/arianotify-polyfill`
- Source commit: `15d720f075fbe12583e2cc0dab72956384e5c5ef`
- Source file: `arianotify-polyfill.js`
- Upstream licence: MIT
- Adaptation: preserve the upstream queue, scoped polite/assertive custom live
  regions, 250 ms registration delay and repeated-message workaround; add only a
  defensive `CSS.supports` availability guard for non-browser test environments,
  TypeScript module wrapping and project comments.

Copyright and licence notice retained from the source:

> MIT License
>
> Copyright (c) 2024 GitHub
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## Questionnaire content

### NASA Task Load Index

The built-in weighted NASA-TLX and Raw TLX definitions cite NASA source material.
The release owner must retain the source attribution and confirm any applicable terms
for the exact wording and graphics used in a public release.

- Source recorded by the definition:
  https://ntrs.nasa.gov/api/citations/20200002718/downloads/20200002718.pdf

### System Usability Scale

The built-in System Usability Scale definition cites Brooke's instrument and scoring
rule. Retain the citation and verify the intended academic/public-repository use before
applying a repository-wide licence to the item text.

- Brooke, J. (1996). *SUS: A “quick and dirty” usability scale*. In *Usability
  Evaluation in Industry*.

### User Experience Questionnaire - Short (UEQ-S)

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
licence in `LICENSE`. Third-party questionnaire wording and vendored software remain
governed by their own notices and the applicable law. Adding a file to this repository
does not relicense that content.
