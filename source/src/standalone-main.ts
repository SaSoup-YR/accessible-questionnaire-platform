import './styles.css';
import './rf05-reflow.css';
import './rf09-support-setting-feedback.css';
import './rf08-smiley-voice-access.css';
import './accessible-nasa-tlx';
import './rf06-speech-lifecycle';
import './rf09-support-setting-feedback';
import { installRf04SavedSessionRecovery } from './rf04-saved-session-recovery';
import { installRf04NativeRecoveryDialog } from './rf04-native-recovery-dialog';

// The standalone artifact intentionally remains a direct participant entry.
// The public repository root can therefore be a platform landing page without
// changing the self-contained Version 0.8 participant demonstration.
installRf04SavedSessionRecovery();
installRf04NativeRecoveryDialog();
