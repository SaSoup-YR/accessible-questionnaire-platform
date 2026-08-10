# UEQ-S redistribution decision

Status: **closed for this release by removing the item text and built-in entry**
Decision date: 10 August 2026

## Presentation correction

Before removal, the candidate corrected its semantic-differential renderer so that
seven response positions were visually unnumbered and accessible names retained the
endpoint context. That generic renderer remains in AQP and is now regression-tested
with original synthetic endpoint wording.

- shows seven visually unnumbered positions between the two adjectives;
- gives each position an accessible name that includes its ordinal position and both
  endpoints;
- stores raw positions 1 through 7 for provenance; and
- preserves declared stored values in the result details.

The specialised centred scorer remains executable code and is tested only against
original synthetic content. It is not presented as a bundled UEQ-S instrument, and
this test is not psychometric-equivalence evidence.

## Redistribution decision

The UEQ site says its materials are free of charge, but its legal notice says that
duplication, processing or distribution beyond copyright law requires prior written
consent. No explicit repository redistribution licence was found.

**Implemented release rule:** the built-in UEQ-S definition, exact item wording,
source-of-truth row and participant-catalogue option are absent from this candidate.
Release synchronisation fails if the removed public-definition filename is
reintroduced, preventing an accidental Pages build from silently restoring it. The
semantic-differential UI is covered by an original synthetic fixture.

Restoration requires all of the following: written permission covering the public
repository and deployed application; an archived permission record; a reviewed
definition; regenerated fidelity/browser evidence; and a new immutable release.

Contact listed by the UEQ Team: `info@ueq-online.org`.

## Sources

- Official UEQ materials page, https://www.ueq-online.org/
- UEQ legal notice, https://www.ueq-online.org/Legal.html
- Official UEQ-S item sheet,
  https://www.ueq-online.org/Material/UEQS_Items.pdf
