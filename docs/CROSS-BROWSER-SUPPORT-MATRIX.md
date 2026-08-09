# AQP cross-browser support matrix

Version: 1.0-draft
Protocol date: 2026-08-09
Release under test: the exact commit recorded in each generated report

## Evidence boundary

This document separates three different forms of evidence:

1. **Automated engine capability evidence** records whether a native browser API exists and whether the production runner reaches the introduction and rating states.
2. **Manual assistive-technology audit evidence** records actual announcements and operability with NVDA, VoiceOver and operating-system voice control.
3. **Disabled-user benefit evidence** is not collected in the dissertation evaluation and must not be claimed.

Playwright WebKit on Linux is not Safari and does not provide VoiceOver evidence. A browser API being present also does not prove that speech recognition is accurate, private, usable or available under every permission and network condition.

## Automated matrix

The `cross-browser-support.spec.ts` CI test records the following fields from an unmodified production page in Chromium, Firefox and Playwright WebKit:

- browser engine and version;
- native `SpeechRecognition` and `webkitSpeechRecognition` availability;
- speech-synthesis availability;
- local and session storage availability;
- participant introduction and rating-screen smoke checks;
- whether the visible unavailable-message and disabled voice control agree with feature detection.

The generated JSON and HTML reports are attached to the `rendered-accessibility-evidence` GitHub Actions artefact and tied to the commit SHA.

| Route | Chromium CI | Firefox CI | Playwright WebKit CI | Manual evidence still required |
| --- | --- | --- | --- | --- |
| Standard buttons and keyboard | Production smoke test | Production smoke test | Production smoke test | NVDA/Chrome, NVDA/Firefox, VoiceOver/Safari |
| Built-in speech recognition | Detect and report native API | Expected unavailable; CI fails if it is silently presented as available | Detect and report only | Chrome permission/network behaviour and Safari behaviour |
| Speech synthesis | Detect and report | Detect and report | Detect and report | Spoken output quality and interruption behaviour |
| Operating-system voice control | Not assessable in browser automation | Not assessable in browser automation | Not assessable in browser automation | One real OS voice-control route |
| Saved progress | Covered in rendered Chromium state test | Storage capability only | Storage capability only | Announcement and recovery in the manual AT audit |

## Known limitation to report

The built-in confirmed voice-input route depends on the Web Speech `SpeechRecognition` interface. MDN's compatibility data records support in Chromium-family browsers and no Firefox support. Therefore NVDA users who use Firefox do not receive AQP's built-in speech-recognition route; they may still operate visible controls through their operating system's voice-control software. The interface must show the unavailable state rather than silently hiding this limitation.

The Web Speech recognition service may process audio locally or remotely depending on browser implementation and configuration. AQP does not itself record or store the audio, but the participant information must not promise that no browser or external service processes it.

Sources:

- MDN, Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MDN, SpeechRecognition: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

## Publication rule

Only generated values from a passing CI run may be copied into the dissertation results. Manual Safari/VoiceOver and NVDA results belong in the separate versioned manual audit. Missing or failed cells are reported as **Not evidenced**, not inferred from another engine.
