import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { wakeLockManager } from './core/WakeLockManager';
import { LockScreen } from './components/standby/LockScreen';
import { OledBlack } from './components/standby/OledBlack';
import { WebBrowser } from './components/browser/WebBrowser';
import { Calculator } from './components/browser/Calculator';
import { PeekCamera } from './components/browser/PeekCamera';
import { VideoVault } from './components/vault/VideoVault';
import { ProUnlockModal } from './components/vault/ProUnlockModal';
import { AppLauncherModal } from './components/browser/AppLauncherModal';
import { SettingsModal } from './components/settings/SettingsModal';

function App() {
  const { uiMode, wakeLockAlwaysOn, recordingStatus } = useAppStore();

  useEffect(() => {
    if (wakeLockAlwaysOn || recordingStatus === 'recording') {
      wakeLockManager.request();
    } else {
      wakeLockManager.release();
    }
  }, [wakeLockAlwaysOn, recordingStatus]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white">
      {/* 1. Standby / Lockscreen Mode */}
      {uiMode === 'lockscreen' && <LockScreen />}

      {/* 2. OLED Pure Black Mode */}
      {uiMode === 'oled' && <OledBlack />}

      {/* 3. Disguised Web Browser */}
      {uiMode === 'browser' && <WebBrowser />}

      {/* 4. Disguised Calculator */}
      {uiMode === 'calculator' && <Calculator />}

      {/* 5. Secret Encrypted Video Vault (Tier 2 Protected) */}
      {uiMode === 'vault' && <VideoVault />}

      {/* Floating Peek Camera View */}
      <PeekCamera />

      {/* Disguised Pro Upgrade / Media Vault Passcode Modal */}
      <ProUnlockModal />

      {/* App Launcher Modal (iCSee, XMEye, Camera, etc.) */}
      <AppLauncherModal />

      {/* System Settings Modal */}
      <SettingsModal />
    </div>
  );
}

export default App;
