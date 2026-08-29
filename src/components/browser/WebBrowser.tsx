import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cameraRecorder } from '../../core/CameraRecorder';
import { fullscreenManager } from '../../core/FullscreenManager';
import { 
  ChevronLeft, ChevronRight, RotateCw, Lock, Home, 
  Menu, Shield, Eye, Moon, Video, VideoOff, Settings, Crown, Maximize, Minimize 
} from 'lucide-react';

export const WebBrowser: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('https://vi.wikipedia.org/wiki/Trang_Chính');
  const [inputUrl, setInputUrl] = useState('vi.wikipedia.org');
  const [showActionSheet, setShowActionSheet] = useState(false);

  const { 
    setUIMode, 
    recordingStatus, 
    recordingDuration,
    setPeekPreviewActive, 
    peekPreviewActive,
    setShowSettings,
    setShowProUnlock,
    isFullscreen,
  } = useAppStore();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let query = inputUrl.trim();
    if (!query) return;

    let targetUrl = '';
    if (query.includes('.') && !query.includes(' ')) {
      targetUrl = query.startsWith('http') ? query : `https://${query}`;
    } else {
      targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    }

    setCurrentUrl(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
  };

  // Secret Triple Tap - Top Left to Lock Screen
  let lockTapCount = 0;
  let lockTapTimeout: any = null;
  const handleLockTap = () => {
    lockTapCount++;
    if (lockTapCount >= 3) {
      setUIMode('lockscreen');
    }
    clearTimeout(lockTapTimeout);
    lockTapTimeout = setTimeout(() => { lockTapCount = 0; }, 1000);
  };

  // Secret Triple Tap - Top Right to Record Toggle
  let recTapCount = 0;
  let recTapTimeout: any = null;
  const handleRecTap = async () => {
    recTapCount++;
    if (recTapCount >= 3) {
      if (recordingStatus === 'idle') {
        await cameraRecorder.startRecording();
      } else {
        cameraRecorder.stopRecording();
      }
    }
    clearTimeout(recTapTimeout);
    recTapTimeout = setTimeout(() => { recTapCount = 0; }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Hidden secret touch zones */}
      <div 
        className="absolute top-0 left-0 w-16 h-14 z-50 bg-transparent"
        onClick={handleLockTap}
      />
      <div 
        className="absolute top-0 right-0 w-16 h-14 z-50 bg-transparent"
        onClick={handleRecTap}
      />

      {/* Browser Top Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 pt-3 pb-2 flex items-center space-x-2 z-20">
        <button className="text-slate-400 p-1 rounded-md hover:text-slate-200 active:bg-slate-800">
          <ChevronLeft size={20} />
        </button>
        <button className="text-slate-600 p-1 rounded-md">
          <ChevronRight size={20} />
        </button>

        {/* Address Bar */}
        <form onSubmit={handleNavigate} className="flex-1 min-w-0">
          <div className="bg-slate-800 rounded-full px-3 py-1.5 flex items-center text-xs space-x-2 border border-slate-700/50">
            <Lock size={12} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-200 text-center font-normal"
              placeholder="Nhập địa chỉ hoặc tìm kiếm..."
            />
            {recordingStatus === 'recording' ? (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" title="Đang ghi hình" />
            ) : (
              <RotateCw size={12} className="text-slate-500 shrink-0 cursor-pointer" onClick={() => setCurrentUrl(currentUrl)} />
            )}
          </div>
        </form>

        <button 
          onClick={() => fullscreenManager.toggle()}
          className="text-slate-400 p-1.5 rounded-md hover:text-slate-200 active:bg-slate-800"
          title="Toàn màn hình"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <button 
          onClick={() => setShowActionSheet(true)}
          className="text-slate-400 p-1.5 rounded-md hover:text-slate-200 active:bg-slate-800 relative"
        >
          <Menu size={20} />
          {recordingStatus === 'recording' && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Quick Bookmarks / Chips */}
      <div className="bg-slate-950 px-3 py-1.5 flex space-x-2 overflow-x-auto text-[11px] border-b border-slate-800/80 shrink-0">
        {[
          { name: 'Wikipedia', url: 'https://vi.wikipedia.org/wiki/Trang_Chính', display: 'vi.wikipedia.org' },
          { name: 'Yahoo Japan', url: 'https://m.yahoo.co.jp', display: 'yahoo.co.jp' },
          { name: 'Dân Trí', url: 'https://dantri.com.vn', display: 'dantri.com.vn' },
          { name: 'VnExpress', url: 'https://vnexpress.net', display: 'vnexpress.net' },
          { name: 'Bing Tìm kiếm', url: 'https://www.bing.com', display: 'bing.com' },
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setInputUrl(item.display);
              setCurrentUrl(`https://corsproxy.io/?url=${encodeURIComponent(item.url)}`);
            }}
            className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 whitespace-nowrap active:scale-95 transition"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Main Web Content Iframe */}
      <div className="flex-1 w-full bg-black relative overflow-hidden">
        <iframe
          src={currentUrl}
          className="w-full h-full border-0 outline-none"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Disguised Web Content"
        />
      </div>

      {/* Bottom Browser Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center text-slate-400 z-20">
        <button onClick={() => setUIMode('lockscreen')} className="hover:text-slate-200" title="Khóa màn hình">
          <Shield size={20} />
        </button>
        <button onClick={() => setPeekPreviewActive(!peekPreviewActive)} className={`hover:text-slate-200 ${peekPreviewActive ? 'text-blue-400' : ''}`} title="Xem trước góc máy">
          <Eye size={20} />
        </button>
        <button onClick={() => setUIMode('calculator')} className="hover:text-slate-200 text-xs font-mono px-2 py-1 bg-slate-800 rounded" title="Chuyển sang Máy tính">
          CALC
        </button>
        <button 
          onClick={() => setShowProUnlock(true)} 
          className="hover:text-amber-400 text-amber-500/80 flex items-center space-x-1" 
          title="Nâng cấp Pro"
        >
          <Crown size={19} />
        </button>
        <button onClick={() => setShowActionSheet(true)} className="hover:text-slate-200" title="Tùy chọn">
          <Menu size={20} />
        </button>
      </div>

      {/* Secret Action Bottom Sheet */}
      {showActionSheet && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end animate-fade-in"
          onClick={() => setShowActionSheet(false)}
        >
          <div 
            className="bg-slate-900 rounded-t-2xl p-5 border-t border-slate-700 flex flex-col space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
            
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-white">Bảng điều khiển hệ thống</h3>
              {recordingStatus === 'recording' && (
                <span className="text-xs text-red-400 font-mono flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                  REC {formatDuration(recordingDuration)}
                </span>
              )}
            </div>

            {/* Quick action grid */}
            <div className="grid grid-cols-4 gap-3 py-2">
              <button
                onClick={async () => {
                  setShowActionSheet(false);
                  if (recordingStatus === 'idle') {
                    await cameraRecorder.startRecording();
                  } else {
                    cameraRecorder.stopRecording();
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                  recordingStatus === 'recording'
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                {recordingStatus === 'recording' ? <VideoOff size={22} className="mb-1 text-red-400" /> : <Video size={22} className="mb-1 text-green-400" />}
                <span className="text-[11px]">{recordingStatus === 'recording' ? 'Dừng quay' : 'Quay ngầm'}</span>
              </button>

              <button
                onClick={() => {
                  setShowActionSheet(false);
                  setUIMode('lockscreen');
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
              >
                <Lock size={22} className="mb-1 text-yellow-400" />
                <span className="text-[11px]">Khóa màn</span>
              </button>

              <button
                onClick={() => {
                  setShowActionSheet(false);
                  setUIMode('oled');
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
              >
                <Moon size={22} className="mb-1 text-purple-400" />
                <span className="text-[11px]">Đen OLED</span>
              </button>

              <button
                onClick={() => {
                  setShowActionSheet(false);
                  setShowProUnlock(true);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 border border-amber-500/30 text-amber-300 hover:bg-amber-950/20"
              >
                <Crown size={22} className="mb-1 text-amber-400" />
                <span className="text-[11px]">Nâng cấp Pro</span>
              </button>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  fullscreenManager.toggle();
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
              </button>
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  setShowSettings(true);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <Settings size={15} />
                <span>Cài đặt</span>
              </button>
              <button
                onClick={() => setShowActionSheet(false)}
                className="py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
