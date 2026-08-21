export type SpeechRecognitionAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available';

export type SpeechRecognitionQuality = 'command';

export interface SpeechRecognitionAvailabilityOptions {
  langs: string[];
  processLocally: true;
  quality?: SpeechRecognitionQuality;
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
      message: string;
    };

const COMMAND_QUALITY: SpeechRecognitionQuality = 'command';

function optionsFor(lang: string, includeQuality: boolean): SpeechRecognitionAvailabilityOptions {
  return {
    langs: [lang],
    processLocally: true,
    ...(includeQuality ? { quality: COMMAND_QUALITY } : {}),
  };
}

async function checkAvailability(
  provider: OnDeviceSpeechRecognitionProvider,
  lang: string,
): Promise<SpeechRecognitionAvailability | null> {
  if (!provider.available) return null;
  try {
    return await provider.available(optionsFor(lang, true));
  } catch {
    // Chrome 139–149 implemented the local-recognition state machine before
    // the later quality-level option. Retry once without quality rather than
    // treating an older implementation as a broken speech route.
    try {
      return await provider.available(optionsFor(lang, false));
    } catch {
      // Permissions Policy, inactive-document and partial implementations must
      // leave the existing remote route available.
      return null;
    }
  }
}

async function installLanguagePack(
  provider: OnDeviceSpeechRecognitionProvider,
  lang: string,
): Promise<boolean> {
  if (!provider.install) return false;
  try {
    return await provider.install(optionsFor(lang, true));
  } catch {
    try {
      return await provider.install(optionsFor(lang, false));
    } catch {
      return false;
    }
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
 * Prefer a locally installed short-command model without weakening or removing
 * the established remote Web Speech route.
 *
 * The function is intentionally side-effect-limited: it may set the selected
 * language/local-processing flag or request one browser-managed language-pack
 * installation. It never starts recognition and never changes an answer.
 */
export async function preparePreferredSpeechRecognitionRoute(
  provider: OnDeviceSpeechRecognitionProvider | undefined,
  recognition: OnDeviceSpeechRecognitionInstance,
  allowOnDevice = true,
  preferredLang = 'en-GB',
  localFallbackLang = 'en-US',
): Promise<PreparedSpeechRecognitionRoute> {
  if (
    !allowOnDevice ||
    !provider?.available ||
    !('processLocally' in recognition)
  ) {
    return prepareRemote(recognition, preferredLang);
  }

  const localCandidates = [...new Set([preferredLang, localFallbackLang])];
  for (const lang of localCandidates) {
    const availability = await checkAvailability(provider, lang);
    if (availability === null) {
      return prepareRemote(recognition, preferredLang);
    }
    if (availability === 'unavailable') continue;

    if (availability === 'available') {
      recognition.lang = lang;
      recognition.processLocally = true;
      return {
        action: 'start',
        mode: 'local',
        lang,
        message: `Listening for one answer using on-device English recognition (${lang}).`,
      };
    }

    if (availability === 'downloading') {
      recognition.lang = lang;
      recognition.processLocally = true;
      return {
        action: 'wait',
        mode: 'downloading',
        lang,
        message:
          `The browser is still downloading its on-device English speech model (${lang}). ` +
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
        message:
          `The on-device English speech model (${lang}) is ready. ` +
          'No answer was selected. Start voice input again, or use a visible answer button.',
      };
    }
    // A locale-specific installation failure does not disable the documented
    // fallback locale or the existing remote route.
  }

  return prepareRemote(recognition, preferredLang);
}
