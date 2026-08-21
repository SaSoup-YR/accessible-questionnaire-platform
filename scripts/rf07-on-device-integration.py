from pathlib import Path
import re


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
  buildPairSpeechHints,
  buildRatingSpeechHints,
  hasUnsafeSpeechMeaning,
  parsePairAlternatives,
  parseRatingAlternatives,
} from './voice-input';
import {
  DwellTracker,
""",
    """import {
  buildPairSpeechHints,
  buildRatingSpeechHints,
  hasUnsafeSpeechMeaning,
  parsePairAlternatives,
  parseRatingAlternatives,
} from './voice-input';
import {
  preparePreferredSpeechRecognitionRoute,
  type OnDeviceSpeechRecognitionProvider,
} from './on-device-speech';
import {
  DwellTracker,
""",
    "on-device import",
)

text = replace_once(
    text,
    """interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
""",
    """interface SpeechRecognitionLike {
  lang: string;
  processLocally?: boolean;
  continuous: boolean;
""",
    "recognition instance property",
)

text = replace_once(
    text,
    """type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
""",
    """type SpeechRecognitionConstructor = (new () => SpeechRecognitionLike) &
  OnDeviceSpeechRecognitionProvider;
""",
    "recognition static API type",
)

start_pattern = re.compile(
    r"  private startVoiceInput\(.*?\n  private configureVoiceHints\(",
    re.DOTALL,
)

start_replacement = """  private async startVoiceInput(
    context: 'rating' | 'pair',
    first: TlxDimension,
    second?: TlxDimension,
    allowContextualHints = true,
    allowOnDevice = true,
  ) {
    this.stopReading();
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;
    this.releaseRecognition();
    this.pendingVoiceAnswer = null;
    this.voiceMessage = 'Preparing voice input.';
    this.voiceState = 'listening';
    const recognition = new Constructor();
    this.recognition = recognition;

    // The new local-language methods are specified on the unprefixed
    // constructor. A prefixed-only implementation keeps the established remote
    // route rather than being treated as local-capable.
    const onDeviceProvider = Constructor === window.SpeechRecognition
      ? Constructor
      : undefined;
    const route = await preparePreferredSpeechRecognitionRoute(
      onDeviceProvider,
      recognition,
      allowOnDevice,
    );
    if (this.recognition !== recognition) return;
    if (route.action === 'wait') {
      this.releaseRecognition(recognition);
      this.showVoiceNotice(route.message);
      return;
    }
    this.voiceMessage = route.message;
    const localRoute = route.mode === 'local';

    recognition.continuous = false;
    recognition.interimResults = false;
    const contextualHintsApplied = allowContextualHints
      ? this.configureVoiceHints(recognition, context, first, second)
      : false;
    // Ask for ranked alternatives so a valid answer can be recovered when the
    // service's first transcript is unusable. Unsafe negation in any returned
    // alternative vetoes the complete result. Otherwise the first ranked safe
    // visible answer is proposed and still requires explicit confirmation.
    recognition.maxAlternatives = 5;
    recognition.onresult = (event) => {
      if (this.recognition !== recognition) return;
      const result = event.results[0];
      const transcripts: string[] = [];
      for (let index = 0; result && index < result.length; index += 1) {
        const transcript = result[index]?.transcript?.trim();
        if (transcript) transcripts.push(transcript);
      }
      if (context === 'rating') {
        const proposal = parseRatingAlternatives(
          transcripts,
          first,
          this.ratingValues,
          this.smileyLandmarks,
        );
        const allowedProposal = isEnglishLanguage(this.definition.language)
          ? proposal
          : proposal && /\\p{Number}|\\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\\b/iu.test(proposal.transcript)
            ? proposal
            : null;
        if (allowedProposal) {
          this.releaseRecognition(recognition);
          const label = this.ratingVoiceAnswerLabel(first, allowedProposal.value);
          this.pendingVoiceAnswer = {
            context,
            transcript: allowedProposal.transcript,
            value: allowedProposal.value,
            label,
          };
          this.voiceState = 'pending';
          this.voiceMessage =
            `Proposed answer: ${label}. Confirm only if the heard words and proposed answer match ` +
            'what you intended; otherwise try again.';
          this.announceAutomatic(this.voiceMessage);
          void this.updateComplete.then(() =>
            this.querySelector<HTMLButtonElement>('[data-voice-confirm]')?.focus(),
          );
          return;
        }
      } else {
        const proposal = parsePairAlternatives(transcripts, [first, second!]);
        if (proposal) {
          this.releaseRecognition(recognition);
          const label = this.dimensionById.get(proposal.value)!.name;
          this.pendingVoiceAnswer = {
            context,
            transcript: proposal.transcript,
            value: proposal.value,
            label,
          };
          this.voiceState = 'pending';
          this.voiceMessage =
            `Proposed answer: ${label}. Confirm only if the heard words and proposed answer match ` +
            'what you intended; otherwise try again.';
          this.announceAutomatic(this.voiceMessage);
          void this.updateComplete.then(() =>
            this.querySelector<HTMLButtonElement>('[data-voice-confirm]')?.focus(),
          );
          return;
        }
      }
      this.releaseRecognition(recognition);
      const informativeTranscript =
        transcripts.find((transcript) => hasUnsafeSpeechMeaning(transcript)) ?? transcripts[0];
      const heard = informativeTranscript
        ? ` I heard “${informativeTranscript}”.`
        : '';
      this.showVoiceNotice(
        context === 'rating'
          ? `No answer was selected.${heard} Try a short command such as “number four”, or use a visible answer button.`
          : `No answer was selected.${heard} Say ${first.name} or ${second!.name}, or use a visible answer button.`,
      );
    };
    recognition.onerror = (event) => {
      if (this.recognition !== recognition) return;
      this.releaseRecognition(recognition);
      // Some browsers expose SpeechRecognitionPhrase and the `phrases`
      // property but reject contextual biasing only when recognition starts.
      // Retry once without the experimental hints so their failure cannot
      // remove the established speech route.
      if (event.error === 'phrases-not-supported' && contextualHintsApplied) {
        void this.startVoiceInput(
          context,
          first,
          second,
          false,
          allowOnDevice,
        );
        return;
      }
      // A browser may report a pack as available and still reject local start.
      // Retry exactly once through the established remote en-GB route rather
      // than looping or weakening the parser.
      if (event.error === 'language-not-supported' && localRoute && allowOnDevice) {
        void this.startVoiceInput(
          context,
          first,
          second,
          allowContextualHints,
          false,
        );
        return;
      }
      this.showVoiceNotice(this.voiceRecognitionErrorMessage(event.error));
    };
    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      this.recognition = null;
      if (this.voiceState === 'listening') {
        this.showVoiceNotice('No answer was selected. Try again, or use a visible answer button.');
      }
    };
    try {
      recognition.start();
    } catch {
      this.releaseRecognition(recognition);
      this.showVoiceNotice('Voice input is unavailable in this browser context. Use a visible answer button.');
    }
  }

  private configureVoiceHints("""

text, count = start_pattern.subn(lambda _: start_replacement, text, count=1)
if count != 1:
    raise SystemExit(f"startVoiceInput block: expected exactly one match, found {count}")

SOURCE.write_text(text, encoding="utf-8")
