import './styles.css';
import './rf05-reflow.css';
import './rf09-support-setting-feedback.css';
import './rf08-smiley-voice-access.css';
import './accessible-nasa-tlx';
import './rf06-speech-lifecycle';
import './rf09-support-setting-feedback';
import { installRf04SavedSessionRecovery } from './rf04-saved-session-recovery';
import { installRf04NativeRecoveryDialog } from './rf04-native-recovery-dialog';

installRf04SavedSessionRecovery();
installRf04NativeRecoveryDialog();
