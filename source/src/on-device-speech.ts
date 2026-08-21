export type SpeechRecognitionAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available';

export type SpeechRecognitionQuality =
  | 'command'
  | 'dictation'
  | 'conversation';

export interface SpeechRecognitionAvailabilityOptions {
  langs: string[];
  processLocally: true;
  quality: SpeechRecognitionQuality;
}

export interface OnDeviceSpeechRecognitionProvider {
  available?: (
    options: SpeechRecognitionAvailabilityOptions,
  ) => Promise<SpeechRecognitionAvailability>;
  install?: (
    options: SpeechRecognitionAvailabilityOptions,
  ) => Promise<boolean>;
}

export interface OnDeviceSpeechRecognitionInstance {
  lang: string;
  processLocally?: boolean;
}

export type PreparedSpeechRecognitionRoute =
  | {
      action: 'start';
      mode: 'local';
      lang: string;
      quality: 'dictation';
      message: string;
    }
  | {
      action: 'start';
      mode: 'remote';
      lang: string;
      message: string;
    }
  | {
      action: 'wait';
      mode: 'installed' | 'downloading';
      lang: string;
      quality: 'dictation';
      message: string;
    };

const REQUIRED_LOCAL_QUALITY = 'dictation' as const;

function optionsFor(lang: string): SpeechRecognitionAvailabilityOptions {
  return {
    langs: [lang],
    processLocally: true,
    quality: REQUIRED_LOCAL_QUALITY,
  };
}

async function checkAvailability(
  provider: OnDeviceSpeechRecognitionProvider,
  lang: string,
): Promise<SpeechRecognitionAvailability | null> {
  if (!provider.available) return null;
  try {
    return await provider.available(optionsFor(lang));
  } catch {
    // The earlier command-quality candidate was manually observed to preserve
    // only a bare number reliably while truncating the frozen two-word command
    // (for example, "number four" -> "Number"). A quality-less retry would
    // silently select that same lower-capability route, so an implementation
    // that cannot verify the dictation floor must retain the remote fallback.
    return null;
  }
}

async function installLanguagePack(
  provider: OnDeviceSpeechRecognitionProvider,
  lang: string,
): Promise<boolean> {
  if (!provider.install) return false;
  try {
    return await provider.install(optionsFor(lang));
  } catch {
    return false;
  }
}

function prepareRemote(
  recognition: OnDeviceSpeechRecognitionInstance,
  lang: string,
): PreparedSpeechRecognitionRoute {
  recognition.lang = lang;
  if ('processLocally' in recognition) recognition.processLocally = false;
  return {
    action: 'start',
    mode: 'remote',
    lang,
    message: 'Listening for one answer using the browser speech service.',
  };
}

/**
 * Prefer a locally installed dictation-capable model without weakening or
 * removing the established remote Web Speech route.
 *
 * The first on-device successor used the default command-quality floor. Live
 * Windows-Chrome testing showed that model could recognise a bare digit while
 * commonly truncating the frozen two-word phrase after its first word. The
 * current Web Speech API explicitly distinguishes command and dictation model
 * capability, so this successor requires the higher dictation floor rather
 * than changing the parser or guessing the missing value.
 *
 * The function is intentionally side-effect-limited: it may set the selected
 * language/local-processing flag or request one browser-managed language-pack
 * installation. It never starts recognition and never changes an answer.
 */
export async function preparePreferredSpeechRecognitionRoute(
  provider: OnDeviceSpeechRecognitionProvider | undefined,
  recognition: OnDeviceSpeechRecognitionInstance,
  allowOnDevice = true,
  remoteLang = 'en-GB',
  localCandidates: readonly string[] = ['en-US', 'en-GB'],
): Promise<PreparedSpeechRecognitionRoute> {
  if (
    !allowOnDevice ||
    !provider?.available ||
    !('processLocally' in recognition)
  ) {
    return prepareRemote(recognition, remoteLang);
  }

  // Chrome's documented local-English examples and pack-management path use
  // en-US. Prefer that documented pack, then retain en-GB as a bounded local
  // fallback. The remote route remains en-GB.
  for (const lang of [...new Set(localCandidates)]) {
    const availability = await checkAvailability(provider, lang);
    if (availability === null) {
      return prepareRemote(recognition, remoteLang);
    }
    if (availability === 'unavailable') continue;

    if (availability === 'available') {
      recognition.lang = lang;
      recognition.processLocally = true;
      return {
        action: 'start',
        mode: 'local',
        lang,
        quality: REQUIRED_LOCAL_QUALITY,
        message:
          `Listening for one answer using on-device English recognition ` +
          `(${lang}, dictation-quality model).`,
      };
    }

    if (availability === 'downloading') {
      recognition.lang = lang;
      recognition.processLocally = true;
      return {
        action: 'wait',
        mode: 'downloading',
        lang,
        quality: REQUIRED_LOCAL_QUALITY,
        message:
          `The browser is still downloading its on-device English dictation model (${lang}). ` +
          'No answer was selected. Start voice input again when the download finishes, or use a visible answer button.',
      };
    }

    const installed = await installLanguagePack(provider, lang);
    if (installed) {
      recognition.lang = lang;
      recognition.processLocally = true;
      return {
        action: 'wait',
        mode: 'installed',
        lang,
        quality: REQUIRED_LOCAL_QUALITY,
        message:
          `The on-device English dictation model (${lang}) is ready. ` +
          'No answer was selected. Start voice input again, or use a visible answer button.',
      };
    }
    // A locale-specific installation failure does not disable the second local
    // candidate or the established remote route.
  }

  return prepareRemote(recognition, remoteLang);
}
