# AQP testing and evidence procedure

This file describes how to reproduce the deterministic and rendered-browser checks for AQP `0.8.0`, and how the manual assistive-technology evidence is bounded.

## Evidence rule

Different evidence answers different questions:

- **unit/component tests** check parsing, scoring, integrity, state transitions and component contracts;
- **rendered-browser tests** check committed UI states, keyboard/focus invariants, axe findings, reflow and browser mechanisms;
- **real assistive-technology observations** determine claims about NVDA, VoiceOver, Windows Voice Access and live browser speech recognition;
- **deployment/Qualtrics checks** determine whether the verified build and bridge are the versions actually served.

A green automated run does not overwrite a failed real assistive-technology observation. The historical q8 audit remains immutable; post-fix results are recorded separately.

## Requirements

- Node.js 22;
- npm with the committed `source/package-lock.json`;
- Git for the generated-release freshness check;
- Chromium, Firefox and Playwright WebKit for browser routes;
- the named real operating systems and assistive technologies for manual claims.

Use synthetic participant codes and synthetic answers. Do not place real participant data, unredacted source surveys or credentials in the repository or test artifacts.

## 1. Clean deterministic verification

From the repository root:

```bash
cd source
npm ci
npm test -- --run
```

The final integrated candidate recorded 26/26 test files and 230/230 tests. The suite includes:

- questionnaire-definition and scoring fidelity;
- QSF/LSS/LSG/LSQ bounded import handling;
- definition fingerprints, stored-result integrity and fail-closed refusal;
- participant-code binding and saved-session migration/recovery;
- transactional review editing and backups;
- Qualtrics staging/failure recovery;
- RF-01, RF-04, RF-06, RF-07 and RF-09 component regressions;
- structural axe checks;
- release-policy and standalone-artifact checks.

`npm ci` should report no known dependency vulnerability at the configured audit level. Record the actual output rather than assuming it remains unchanged.

## 2. Production and rendered-browser verification

Build the site, install the exact Playwright engines and run both browser suites:

```bash
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm run test:browser-support
```

The final integrated candidate recorded:

- 12/12 rendered-browser tests;
- 18/18 support tests across Chromium, Firefox and WebKit.

The browser suite covers the configured participant-code routes, SUS completion and review editing, Qualtrics states, NASA-TLX pairwise and optional support states, imported scales, RF-03 failure recovery and the RF-04 native recovery dialog. The support suite covers the A27 iframe lifecycle mechanism, RF-05 320 CSS-pixel reflow, RF-08 visible native smiley radio geometry and RF-09 setting feedback.

Playwright WebKit is not a substitute for Safari + VoiceOver. Chromium automation is not Windows Voice Access evidence. Browser speech APIs may be present in automation without demonstrating live microphone recognition quality.

## 3. Build and synchronize the release

```bash
npm run build:release
```

This command:

1. type-checks and builds the production site;
2. builds the verified standalone participant file;
3. synchronizes the root `index.html`, `study.html`, hashed `assets/` and distributable `questionnaires/` files.

Confirm that the committed release is fresh:

```bash
git diff --exit-code -- \
  demo/accessible-nasa-tlx-v0.7.html \
  demo/accessible-questionnaire-platform-v0.8.html \
  ../index.html ../study.html ../assets ../questionnaires
```

Any diff means the committed deployment files do not correspond to the source tree. Rebuild and review the generated changes; do not hand-edit minified bundles.

## 4. Quantified reports

After the relevant tests have produced their JSON evidence:

```bash
npm run report:technical
npm run report:browser-support
npm run report:browser
```

The canonical GitHub Actions workflow uploads:

- `quantified-technical-evaluation`;
- `rendered-accessibility-evidence`, including the browser reports and Playwright test results.

Artifacts are retained for a finite period. Persistent claims must also be represented in versioned repository evidence files with exact revisions and run identifiers.

## 5. Manual assistive-technology boundary

The frozen manual protocol is in `docs/manual-audit/`. Later targeted repair outcomes are in `docs/evidence/`; they do not rewrite the baseline matrix.

Named environments used by the audit include:

- R1: NVDA + Firefox;
- R2: NVDA + Chrome;
- R3: VoiceOver + Safari;
- R4: Windows Voice Access + Chrome.

For each manual route:

1. record OS, browser and assistive-technology versions;
2. use the exact immutable runtime named by the repair record;
3. follow the frozen action and expected observable result;
4. preserve the exact wording or behavior actually observed;
5. record Pass, Fail or Not applicable without inferring a result from source code;
6. keep screenshots/recordings in the approved evidence location and commit only redacted material or hashes where appropriate.

The final RF-04 route is documented in:

`docs/evidence/RF04-NATIVE-DIALOG-POSTFIX-MANUAL-AUDIT-2026-08-22.md`.

The residual RF-01, RF-06 and RF-07 boundaries are documented in their final evidence records and in:

`docs/evidence/PROTOTYPE-FREEZE-AND-RESIDUAL-LIMITATIONS-PLAN-2026-08-22.md`.

## 6. Qualtrics release acceptance

A centrally collected study is not accepted merely because the standalone participant runner passes.

Use a copied, approved synthetic Qualtrics survey and the exact bridge/package described in `docs/QUALTRICS-INTEGRATION.md`. Verify:

- the parent origin and definition fingerprint are accepted;
- Start remains unavailable until the bridge is verified;
- staged data is not described as durably recorded before native Qualtrics advance;
- injected storage, staging and advance failures expose the documented recovery paths;
- the participant backups remain available;
- a clean synthetic response reaches the host-owned recorded/end state;
- the resulting synthetic row contains the expected configuration, definition fingerprint, responses, score and acceptance marker.

Do not use a live participant survey for fault injection.

## 7. Final release gate

Before tagging or deploying a frozen release, require all of the following on one exact commit:

- deterministic suite passes;
- rendered-browser and cross-browser suites pass;
- production, standalone and synchronized release builds pass;
- generated-release freshness passes;
- manual post-fix adjudications are committed or linked by immutable hashes;
- the six residual failures and claim boundary are stated in `README.md`, `RELEASE-NOTES.md` and the final freeze record;
- `BUILD-INFO.json`, `CITATION.cff`, licence and third-party notices are current;
- GitHub Pages is verified as originating from the merged release commit;
- one clean deployed smoke test is recorded.

The release supports bounded technical claims only. It does not authorize participant recruitment or replace ethics, instrument permission, data-governance or user-research requirements.
