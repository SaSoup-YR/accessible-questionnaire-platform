from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source/src/accessible-nasa-tlx.ts"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


text = SOURCE.read_text(encoding="utf-8")
text = replace_once(
    text,
    """import {
  preparePreferredSpeechRecognitionRoute,
  type OnDeviceSpeechRecognitionProvider,
} from './on-device-speech';
""",
    """import {
  preparePreferredSpeechRecognitionRoute,
  type OnDeviceSpeechRecognitionProvider,
  type PreparedSpeechRecognitionRoute,
} from './on-device-speech';
""",
    "prepared-route type import",
)

text = replace_once(
    text,
    """    const route = await preparePreferredSpeechRecognitionRoute(
      onDeviceProvider,
      recognition,
      allowOnDevice,
    );
""",
    """    let route: PreparedSpeechRecognitionRoute;
    if (
      allowOnDevice &&
      onDeviceProvider?.available &&
      'processLocally' in recognition
    ) {
      route = await preparePreferredSpeechRecognitionRoute(
        onDeviceProvider,
        recognition,
        true,
      );
    } else {
      // Preserve the established synchronous path for prefixed browsers and
      // existing recognizers without the new static local-language API. This
      // avoids changing focus, status and event timing on unaffected routes.
      recognition.lang = 'en-GB';
      if ('processLocally' in recognition) recognition.processLocally = false;
      route = {
        action: 'start',
        mode: 'remote',
        lang: 'en-GB',
        message: 'Listening for one answer using the browser speech service.',
      };
    }
""",
    "synchronous remote branch",
)

SOURCE.write_text(text, encoding="utf-8")
