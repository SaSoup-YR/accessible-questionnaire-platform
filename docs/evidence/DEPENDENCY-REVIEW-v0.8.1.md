# Dependency review — v0.8.1

Date: 24 August 2026  
Reviewed candidate: `cb34910bd127d2c1a7201c64f81fefaeef7758b6`  
Canonical curation run: `32722484056` — success

## Decision

The committed `source/package-lock.json` is retained for Version 0.8.1. No package is upgraded only because a newer registry version exists.

This is a release-stabilisation decision, not a claim that the dependency graph is permanently current. The locked graph completed the installation, type check, production build, 235 unit/component tests, 14 rendered-browser tests, 18 Chromium/Firefox/WebKit support checks, standalone build, generated-release synchronisation, link audit and public-boundary checks in the canonical run. The recorded `npm audit` report contains zero known vulnerabilities.

The update gate for this release is therefore limited to:

1. a reported security issue affecting the locked graph; or
2. a demonstrated browser/tool compatibility problem that requires an update.

Neither gate was met during the v0.8.1 review.

## Registry comparison

`npm outdated --json` was run against the locked installation and retained as `DEPENDENCY-OUTDATED-v0.8.1.json`. The following available updates were not applied:

| Package | Locked/current | Registry comparison | Decision and reason |
| --- | ---: | ---: | --- |
| `@axe-core/playwright` | 4.12.1 | 4.13.0 | Deferred. No security finding or failed accessibility-test integration was observed. Update together with `axe-core` in a separate compatibility run so rule/result changes are reviewed rather than silently changing the release evidence. |
| `axe-core` | 4.12.1 | 4.13.0 | Deferred for the same paired-review reason. A newer rule engine can legitimately change detected findings; that is evaluation work, not repository tidying. |
| `@types/jsdom` | 28.0.3 | 30.0.0 | Deferred major-version migration. It should be reviewed with the corresponding `jsdom` and TypeScript versions. |
| `jsdom` | 26.1.0 | 30.0.1 | Deferred major-version migration. The current DOM-based component suite passes; a multi-major jump requires a separate behaviour regression. |
| `@types/node` | 24.13.3 | 26.2.0 | Deferred major-version migration. The release workflow is intentionally verified on Node 22; adopting Node 26 type declarations would change the declared development surface without a release need. |
| `typescript` | 5.9.3 | 7.0.2 | Deferred major-version migration. Compiler-major changes require a dedicated type/build review and are outside a documentation/public-entry release. |
| `vite` | 7.3.6 | 8.2.2 | Deferred major-version migration. Production and standalone builds pass on the locked version; a bundler-major change requires generated-output and browser regression review. |
| `vite-node` | 3.2.4 | 6.0.0 | Deferred major-version migration. It is part of the browser-fixture preparation path and should be reviewed with Vitest/Vite rather than independently. |
| `vitest` | 3.2.7 | 4.1.11 | Deferred major-version migration. The full 235-test suite passes; a test-runner major update belongs in a separate toolchain change so altered test semantics are visible. |

## Reproducibility boundary

- `npm ci` and the committed lockfile define the tested dependency graph.
- `npm outdated` records registry drift but does not modify the graph.
- `npm audit` is a time-specific registry advisory check; zero reported vulnerabilities does not prove that no undisclosed vulnerability exists.
- Future dependency updates must use a dedicated change, regenerate the lockfile, rerun the complete verification suite and retain the new evidence separately.
