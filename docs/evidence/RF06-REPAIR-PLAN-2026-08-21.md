# RF-06 speech-listening lifecycle repair boundary — 21 August 2026

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

RF-06 targets only the application-level speech-listening lifecycle failures recorded at **R2-A10, R3-A10, R4-A10 and R3-A13**. The repair objective is to keep a pre-existing status region for prompt Listening feedback, expose an explicit Stop action while recognition is active, add an AQP-owned watchdog so a browser cannot remain indefinitely Listening, give a specific no-speech recovery message, retain visible answer controls, and never commit an answer merely because recognition starts, stops or times out.

This family does not attempt to prove or repair upstream speech-recognition accuracy. Fixed-phrase recognition reliability remains a separate RF-07 evidence family.

Post-fix manual adjudication must remain separate from the frozen q8 matrix. Firefox remains capability-unavailable for the built-in Web Speech recognition route; affected Chrome/Safari/Voice Access observations must be rerun on the retained candidate after canonical CI is green.

Implementation note: the source patch is applied through a temporary branch-only workflow solely to avoid hand-editing the large generated component file. The workflow must restore the repository's canonical read-only verification workflow before committing the retained implementation; it is not part of the RF-06 product change.
