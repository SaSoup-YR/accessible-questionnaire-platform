# Standalone Participant File

`accessible-questionnaire-platform-v0.8.html` is the active self-contained participant build. In the `v0.8.1` curation release, opening it without a study configuration presents the same platform landing page and three browser-local demonstrations as the hosted root entry.

The historical `accessible-nasa-tlx-v0.7.html` artifact has been moved to the private project archive. Git history and the private checksum manifest preserve its exact identity without presenting it as a current public entry point.

The complete hosted workflow has two current entry points built from one source tree:

| Role | Readable source | Hosted output |
| --- | --- | --- |
| Researcher setup | `../study.html` and `../src/study-conductor.ts` | repository-root `study.html` |
| Landing and participant runner | `../index.html`, `../src/landing.ts`, the validated files in `../instruments/`, and `../src/accessible-nasa-tlx.ts` | repository-root `index.html` |

The researcher setup is not packaged into the standalone participant file. A page opened through `file://` cannot create a reliable public participant URL, use the Qualtrics parent bridge, or share same-origin result storage with the hosted researcher page. Use the hosted `study.html` route for study configuration and collection.
