# Qualtrics integration files

- `question-html-template.html` is a reference template. Use the complete generated
  HTML from `study.html`, which replaces the participant-URL placeholder. It shows
  the live iframe during collection and a generic read-only summary in a recorded
  response or individual PDF.
- `qualtrics-question.js` belongs in that question's JavaScript editor. It validates
  a Version 4 record, stages `AQP_*` fields with `setJSEmbeddedData`, acknowledges a
  matching submission ID and starts native Qualtrics advancement.
  Bridge build `0.8.8-q8` keeps the participant iframe hidden until an exact-origin
  and exact-build handshake succeeds. It moves the live wrapper to a fixed
  full-browser viewport, disables the surrounding Qualtrics scroll and lets the
  participant document own the single visible scrollbar.
- `embedded-data-fields.txt` lists the 63 fields to declare near the start of Survey
  Flow. Keep `__js_` in Survey Flow; JavaScript calls intentionally omit it.
- `end-of-survey-message.txt` is optional ordinary text for a custom End of Survey
  message. It is not code and does not affect whether Qualtrics stores a response.
  It is the persistent completion page after the Qualtrics response has been
  submitted.

Use the complete setup and adverse-test procedure in
[`../../docs/QUALTRICS-INTEGRATION.md`](../../docs/QUALTRICS-INTEGRATION.md).
Participants receive the activated Qualtrics distribution link, not the raw GitHub
participant URL. Do not place an API token or password in these files.
