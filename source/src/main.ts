import './styles.css';
import './landing.css';
import './rf05-reflow.css';
import './rf09-support-setting-feedback.css';
import './rf08-smiley-voice-access.css';
import './accessible-nasa-tlx';
import './rf06-speech-lifecycle';
import './rf09-support-setting-feedback';
import { installRf04SavedSessionRecovery } from './rf04-saved-session-recovery';
import { installRf04NativeRecoveryDialog } from './rf04-native-recovery-dialog';
import {
  buildDemoHash,
  demoInstrumentFromSearch,
  hasStudyParameter,
} from './landing';

installRf04SavedSessionRecovery();
installRf04NativeRecoveryDialog();

const root = document.querySelector<HTMLElement>('#aqp-root');
if (!root) throw new Error('The AQP root element is missing.');

const demoInstrument = demoInstrumentFromSearch(window.location.search);
if (demoInstrument && !hasStudyParameter(window.location.hash)) {
  const demonstrationUrl = new URL(window.location.href);
  demonstrationUrl.search = '';
  demonstrationUrl.hash = buildDemoHash(demoInstrument);
  window.history.replaceState(null, '', demonstrationUrl);
}

if (hasStudyParameter(window.location.hash)) {
  document.body.classList.remove('aqp-landing-page');
  document.title =
    'Participant questionnaire · Accessible Questionnaire Platform Version 0.8';
  root.replaceChildren(document.createElement('accessible-questionnaire'));
}
