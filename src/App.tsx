import React, { useEffect, useState } from 'react';
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
import { RemoteHostModal } from './components/remote/RemoteHostModal';
import { RemoteViewer } from './components/remote/RemoteViewer';
import { SettingsModal } from './components/settings/SettingsModal';

function App() {
  const { 
    uiMode, 
    wakeLockAlwaysOn, 
    recordingStatus,
    showRemoteHostModal,
    setShowRemoteHostModal 
  } = useAppStore();

  const [viewerRoomId, setViewerRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for PC Remote Viewer mode
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('connect');
    const isViewer = params.get('viewer') === '1' || viewParam !== null;

    if (isViewer) {
      setViewerRoomId(viewParam || '');
    }
  }, []);

  useEffect(() => {
    if (wakeLockAlwaysOn || recordingStatus === 'recording') {
      wakeLockManager.request();
    } else {
      wakeLockManager.release();
    }
  }, [wakeLockAlwaysOn, recordingStatus]);

  // If in PC Remote Viewer Mode -> Render Remote Dashboard
  if (viewerRoomId !== null) {
    return <RemoteViewer initialRoomId={viewerRoomId} />;
  }

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

      {/* Remote Cast to PC Host Modal */}
      <RemoteHostModal 
        isOpen={showRemoteHostModal} 
        onClose={() => setShowRemoteHostModal(false)} 
      />

      {/* System Settings Modal */}
      <SettingsModal />
    </div>
  );
}

export default App;
