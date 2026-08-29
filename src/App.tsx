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
import { RemoteHostModal } from './components/remote/RemoteHostModal';
import { RemoteViewer } from './components/remote/RemoteViewer';
import { SettingsModal } from './components/settings/SettingsModal';
import { Smartphone, Monitor } from 'lucide-react';

function App() {
  const { 
    uiMode, 
    wakeLockAlwaysOn, 
    recordingStatus,
    showRemoteHostModal,
    setShowRemoteHostModal 
  } = useAppStore();

  const [activeDeviceMode, setActiveDeviceMode] = useState<'phone' | 'pc'>('phone');
  const [viewerRoomId, setViewerRoomId] = useState<string>('');

  useEffect(() => {
    // Check URL parameters for PC Remote Viewer mode
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || params.get('connect');
    const isViewer = params.get('viewer') === '1' || viewParam !== null;

    if (isViewer) {
      setActiveDeviceMode('pc');
      if (viewParam) {
        setViewerRoomId(viewParam);
      }
    }
  }, []);

  useEffect(() => {
    if (wakeLockAlwaysOn || recordingStatus === 'recording') {
      wakeLockManager.request();
    } else {
      wakeLockManager.release();
    }
  }, [wakeLockAlwaysOn, recordingStatus]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black text-white flex flex-col">
      {/* Top Device Mode Bar (Quick 1-click switch between Phone Host and PC Viewer) */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-slate-700/60 backdrop-blur-md rounded-full p-1 flex items-center space-x-1 shadow-2xl opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setActiveDeviceMode('phone')}
          className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center space-x-1 transition ${
            activeDeviceMode === 'phone'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone size={12} />
          <span>Điện Thoại</span>
        </button>
        <button
          onClick={() => setActiveDeviceMode('pc')}
          className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center space-x-1 transition ${
            activeDeviceMode === 'pc'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor size={12} />
          <span>Máy Tính (Xem Từ Xa)</span>
        </button>
      </div>

      {/* VIEW: PC Remote Monitor */}
      {activeDeviceMode === 'pc' ? (
        <RemoteViewer initialRoomId={viewerRoomId} />
      ) : (
        /* VIEW: Mobile Host Disguise */
        <div className="w-full h-full relative flex-1 overflow-hidden">
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

          {/* Remote Cast to PC Host Modal */}
          <RemoteHostModal 
            isOpen={showRemoteHostModal} 
            onClose={() => setShowRemoteHostModal(false)} 
          />

          {/* System Settings Modal */}
          <SettingsModal />
        </div>
      )}
    </div>
  );
}

export default App;
