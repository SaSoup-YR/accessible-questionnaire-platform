# Claim and naming decision v1

Date: 2026-08-10
Status: recommended wording for dissertation, publication draft and the next
repository rename; the GitHub repository has not yet been renamed.

## Dissertation title

**A Bounded Questionnaire Administration Pipeline: Fidelity, Provenance,
Recovery and Technical Accessibility Evaluation**

This title is intentionally narrower than *Towards More Accessible
Questionnaires*. It names the implemented system boundary and the evidence that
the dissertation can supply. “Technical Accessibility Evaluation” means
automated real-browser checks and a manual assistive-technology audit on named
configurations. It does not imply benefit, usability or preference evidence from
disabled participants.

## Repository and product name

- Recommended repository slug: **`questionnaire-fidelity-pipeline`**
- Recommended display name: **Questionnaire Fidelity Pipeline (QFP)**

The name foregrounds the strongest checkable property and avoids presenting
“accessible” as an established product benefit. Rename only after the current
correction PR is verified and the affected Pages URL, badges, package metadata,
citations and deployment links are updated together. Preserve the old GitHub
redirect and record the rename in the release notes.

## Locked contribution

### 1. Bounded, checkable measurement identity and provenance

Compatible questionnaire content is admitted through a shared definition path,
while response structures and scorers remain reviewed executable boundaries.
The canonical definition fingerprint binds configuration, rendered definition
and result, and the self-contained export records the definition, scorer,
responses, routes and support state. The fingerprint proves internal
consistency, not authenticated authorship.

### 2. Quantified fail-closed fidelity and reconstructability

Independent source-of-truth comparisons quantify item/order/label/value/required
and scoring fidelity; a frozen adversarial battery quantifies refusal behaviour;
and export-only reconstruction makes provenance falsifiable. Unsupported
content is refused rather than silently approximated. Data-driven reuse is
measured, but loading JSON, importing survey files and splitting a workflow into
ten screens are not claimed as novel contributions.

### 3. Correctable and recoverable administration with bounded technical
accessibility evidence

The participant runner provides direct per-item correction, saved-progress
recovery, explicit failure states and confirmed voice proposals. These features
are evaluated across a frozen real-browser state inventory and a versioned
manual audit of named assistive-technology routes. This contribution remains
technically, not human-benefit, evidenced; until the manual audit is executed,
its manual component is Not evidenced.

## Prohibited claim shortcuts

Do not describe the system as questionnaire-independent: a new scoring rule or
response structure requires executable scoring and validation changes. Do not
claim general accessibility, improvement over Qualtrics, score equivalence,
psychometric invariance or benefit for disabled users. Do not treat zero axe
violations, one browser route or implementation of an ARIA mechanism as proof of
those claims.
