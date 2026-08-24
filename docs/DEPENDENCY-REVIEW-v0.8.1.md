# Dependency Review for AQP v0.8.1

## Scope

The Version 0.8.1 release keeps `source/package-lock.json` as the reproducible dependency source. The release gate ran a locked install, captured the registry comparison produced by `npm outdated`, ran `npm audit`, and then ran the complete unit/component, rendered-browser, and Chromium/Firefox/WebKit support suites.

The machine-readable records are:

- `docs/evidence/DEPENDENCY-OUTDATED-v0.8.1.json`;
- `docs/evidence/DEPENDENCY-AUDIT-v0.8.1.json`.

The authoritative release-gate run also executed `npm outdated` during CI retries while the Version 0.8.1 candidate was being repaired. The committed JSON is the final comparison used for the release decision; it should not be read as a claim that the command was executed only once during development.

## Registry comparison

The final registry comparison reported newer releases for nine development/testing dependencies. Two axe packages have a newer compatible minor release; the remaining entries involve newer major versions or type packages associated with newer major environments.

| Package | Locked/current | Registry latest | Release decision |
| --- | ---: | ---: | --- |
| `@axe-core/playwright` | 4.12.1 | 4.13.0 | Retain 4.12.1 for this evaluated release. No security finding or demonstrated browser incompatibility requires the change. |
| `axe-core` | 4.12.1 | 4.13.0 | Retain 4.12.1 for the same reason and keep the axe packages aligned. |
| `@types/jsdom` | 28.0.3 | 30.0.0 | Do not make a type-major change without a corresponding tested environment migration. |
| `@types/node` | 24.13.3 | 26.2.0 | Do not move type-major versions solely to match the newest registry release. CI remains explicitly configured and tested on Node 22. |
| `jsdom` | 26.1.0 | 30.0.1 | Major upgrade deferred; the current component-test environment passes the release suite. |
| `typescript` | 5.9.3 | 7.0.2 | Major compiler migration deferred; it is outside a repository-curation patch release and is not required by a security or compatibility defect. |
| `vite` | 7.3.6 | 8.2.2 | Major build-tool migration deferred; the locked build produces and verifies the intended release output. |
| `vite-node` | 3.2.4 | 6.0.0 | Major test/tooling migration deferred; no release-blocking compatibility defect was observed. |
| `vitest` | 3.2.7 | 4.1.11 | Major test-runner migration deferred; the locked suite passes and changing the runner would change the evaluated environment. |

## Security and compatibility gate

The final `npm audit` record reports **0 vulnerabilities** across the installed dependency graph. The same release candidate passed:

- 235/235 unit and component tests;
- 14/14 rendered-browser tests;
- 18/18 cross-browser support tests across Chromium, Firefox, and Playwright WebKit;
- production, standalone, and release-synchronization builds.

Accordingly, Version 0.8.1 does not upgrade dependencies merely because the registry contains newer releases. A dependency change is reserved for a demonstrated security issue, a demonstrated supported-browser incompatibility, or a separately scoped and re-evaluated toolchain migration.

This is a release-control decision, not a claim that older packages are preferable in general. Future development should re-run the same review and test any selected upgrades before a new release.
