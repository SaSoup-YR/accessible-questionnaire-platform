import './styles.css';
import './accessible-nasa-tlx';
import { installRf04SavedSessionRecovery } from './rf04-saved-session-recovery';
import { installRf04NativeRecoveryDialog } from './rf04-native-recovery-dialog';

installRf04SavedSessionRecovery();
installRf04NativeRecoveryDialog();
