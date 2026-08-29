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

  // If URL has ?view=, render the PC Remote Monitor
  if (viewerRoomId !== null) {
    return <RemoteViewer initialRoomId={viewerRoomId} />;
  }

  // Otherwise, render normal Phone Mode
  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white">
      {uiMode === 'lockscreen' && <LockScreen />}
      {uiMode === 'oled' && <OledBlack />}
      {uiMode === 'browser' && <WebBrowser />}
      {uiMode === 'calculator' && <Calculator />}
      {uiMode === 'vault' && <VideoVault />}

      <PeekCamera />
      <ProUnlockModal />
      <AppLauncherModal />
      <RemoteHostModal 
        isOpen={showRemoteHostModal} 
        onClose={() => setShowRemoteHostModal(false)} 
      />
      <SettingsModal />
    </div>
  );
}

export default App;
