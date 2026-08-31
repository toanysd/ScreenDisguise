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
import { FloatingPipModal } from './components/pip/FloatingPipModal';
import { ScreenCurtainGuideModal } from './components/guide/ScreenCurtainGuideModal';
import { Monitor } from 'lucide-react';

function App() {
  const { 
    uiMode, 
    wakeLockAlwaysOn, 
    recordingStatus,
    showRemoteHostModal,
    setShowRemoteHostModal 
  } = useAppStore();

  const [viewerRoomId, setViewerRoomId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check URL parameters for PC Remote Viewer mode
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('connect');
    const isViewer = params.get('viewer') === '1' || params.get('mode') === 'pc' || viewParam !== null;

    if (isViewer) {
      setViewerRoomId(viewParam || '');
    }

    // Detect if running on desktop screen
    if (window.innerWidth >= 1024) {
      setIsDesktop(true);
    }
  }, []);

  useEffect(() => {
    if (wakeLockAlwaysOn || recordingStatus === 'recording') {
      wakeLockManager.request();
    } else {
      wakeLockManager.release();
    }
  }, [wakeLockAlwaysOn, recordingStatus]);

  // If URL has ?view= or user is in PC mode, render the PC Remote Monitor
  if (viewerRoomId !== null) {
    return <RemoteViewer initialRoomId={viewerRoomId} onBackToPhone={() => setViewerRoomId(null)} />;
  }

  // Otherwise, render normal Phone Mode
  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white">
      {uiMode === 'lockscreen' && <LockScreen />}
      {uiMode === 'oled' && <OledBlack />}
      {uiMode === 'browser' && <WebBrowser />}
      {uiMode === 'calculator' && <Calculator />}
      {uiMode === 'vault' && <VideoVault />}

      {/* Desktop Switcher Hint (Only appears on PC/Laptop screen) */}
      {isDesktop && uiMode !== 'oled' && (
        <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
          <button
            onClick={() => setViewerRoomId('')}
            className="bg-slate-900/90 hover:bg-slate-800 text-blue-400 border border-blue-500/40 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md transition active:scale-95"
          >
            <Monitor size={16} />
            <span>Mở Trạm Điều Khiển PC Remote Hub</span>
          </button>
        </div>
      )}

      <PeekCamera />
      <ProUnlockModal />
      <AppLauncherModal />
      <RemoteHostModal 
        isOpen={showRemoteHostModal} 
        onClose={() => setShowRemoteHostModal(false)} 
      />
      <SettingsModal />
      <FloatingPipModal />
      <ScreenCurtainGuideModal />
    </div>
  );
}

export default App;
