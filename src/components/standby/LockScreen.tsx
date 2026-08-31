import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cameraRecorder } from '../../core/CameraRecorder';
import { fullscreenManager } from '../../core/FullscreenManager';
import { Lock, Unlock, Wifi, Battery, BatteryCharging, Moon, Eye, Clock, Maximize, Minimize, Cast, Layers, Sparkles, Activity } from 'lucide-react';

export const LockScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState<number>(92);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const {
    uiMode,
    setUIMode,
    disguiseType,
    pinCode,
    carrierName,
    standbyStyle,
    setStandbyStyle,
    recordingStatus,
    recordingDuration,
    setPeekPreviewActive,
    peekPreviewActive,
    setShowRemoteHostModal,
    setShowPipModal,
    pipActive,
    motionDetected,
    motionDetectionEnabled,
    isFullscreen,
    setIsFullscreen,
  } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const onFullscreenChange = () => {
      setIsFullscreen(fullscreenManager.isFullscreen());
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    // Battery Status API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGlobalTouch = () => {
    if (!fullscreenManager.isFullscreen()) {
      fullscreenManager.request();
    }
  };

  // Secret Triple Tap - Clock to cycle Standby mode
  let clockTapCount = 0;
  let clockTapTimeout: any = null;
  const handleClockTap = () => {
    clockTapCount++;
    if (clockTapCount >= 3) {
      if (standbyStyle === 'lockscreen') setStandbyStyle('aod');
      else if (standbyStyle === 'aod') setUIMode('oled');
      else setStandbyStyle('lockscreen');
    }
    clearTimeout(clockTapTimeout);
    clockTapTimeout = setTimeout(() => { clockTapCount = 0; }, 1000);
  };

  // Secret Triple Tap - Top Right for Record Toggle
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

  const handleOpenPinModal = () => {
    handleGlobalTouch();
    setShowPinModal(true);
  };

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);

      if (newPin.length === 4) {
        if (newPin === pinCode) {
          setShowPinModal(false);
          setEnteredPin('');
          setUIMode(disguiseType);
        } else {
          setPinError(true);
          setTimeout(() => {
            setEnteredPin('');
            setPinError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  // If in AOD (Always-On Display) Standby Mode
  if (standbyStyle === 'aod') {
    return (
      <div 
        onClick={() => {
          handleGlobalTouch();
          setStandbyStyle('lockscreen');
        }}
        className="fixed inset-0 bg-black flex flex-col items-center justify-center select-none cursor-pointer z-40"
      >
        <div className="flex flex-col items-center opacity-25 hover:opacity-40 transition-opacity duration-300">
          <h1 className="text-6xl font-extralight tracking-wider text-white font-mono">
            {formatTime(currentTime)}
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            {formatDate(currentTime)} • {batteryLevel}%
          </p>
          {recordingStatus === 'recording' && (
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-3 animate-pulse" />
          )}
        </div>
        <div className="absolute bottom-6 text-[11px] text-gray-700">
          Chạm để mở khóa
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleGlobalTouch}
      className="fixed inset-0 bg-black text-white flex flex-col justify-between select-none z-40 overflow-hidden"
    >
      {/* Hidden touch area for record toggle (Top Right) */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 z-50 bg-transparent"
        onClick={(e) => { e.stopPropagation(); handleRecTap(); }}
      />

      {/* Hidden touch area for OLED mode (Top Left) */}
      <div 
        className="absolute top-0 left-0 w-20 h-20 z-50 bg-transparent"
        onClick={(e) => { e.stopPropagation(); setUIMode('oled'); }}
      />

      {/* Top Banner if not fullscreen */}
      {!isFullscreen && (
        <div 
          onClick={(e) => { e.stopPropagation(); fullscreenManager.request(); }}
          className="w-full bg-blue-600/30 hover:bg-blue-600/50 border-b border-blue-500/30 py-1.5 px-4 text-center text-xs text-blue-200 cursor-pointer flex items-center justify-center space-x-1.5 transition z-30"
        >
          <Maximize size={12} />
          <span>Chạm vào đây để Bật Toàn Màn Hình</span>
        </div>
      )}

      {/* Status Bar */}
      <div className="w-full flex justify-between items-center px-7 pt-3 text-xs font-medium opacity-80 z-20">
        <div className="flex items-center space-x-2">
          <span>{carrierName || 'docomo'}</span>
          {motionDetectionEnabled && (
            <span className={`flex items-center text-[10px] px-1.5 py-0.2 rounded-md ${motionDetected ? 'bg-indigo-500/30 text-indigo-300 animate-pulse' : 'text-slate-600'}`}>
              <Activity size={10} className="mr-0.5" />
              {motionDetected ? 'Chuyển động' : 'Cảm biến'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {recordingStatus === 'recording' && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block mr-1" />
          )}
          {/* Quick PiP Floating button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowPipModal(true); }}
            className={`p-1 transition active:scale-95 ${pipActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
            title="Lớp Phủ PiP Nổi iPhone"
          >
            <Layers size={15} />
          </button>
          {/* Quick Cast Button on Lockscreen */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowRemoteHostModal(true); }}
            className="p-1 text-purple-400 hover:text-purple-300 active:scale-95 transition"
            title="Kết nối Máy Tính (Cast to PC)"
          >
            <Cast size={15} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); fullscreenManager.toggle(); }} 
            className="opacity-60 hover:opacity-100 p-0.5" 
            title="Bật/Tắt Toàn màn hình"
          >
            {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
          </button>
          <Wifi size={14} />
          <div className="flex items-center space-x-1">
            <span>{batteryLevel}%</span>
            {isCharging ? <BatteryCharging size={16} className="text-green-400" /> : <Battery size={16} />}
          </div>
        </div>
      </div>

      {/* Main Lock Screen Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-14">
        <div 
          onClick={(e) => { e.stopPropagation(); handleOpenPinModal(); }}
          className="cursor-pointer flex flex-col items-center group transition active:scale-95"
        >
          <Lock size={22} className="opacity-70 mb-3" />
        </div>

        <div onClick={(e) => { e.stopPropagation(); handleClockTap(); }} className="flex flex-col items-center cursor-pointer">
          <h1 className="text-7xl font-extralight tracking-tight font-sans">
            {formatTime(currentTime)}
          </h1>
          <p className="text-base text-gray-300 capitalize mt-2 font-normal">
            {formatDate(currentTime)}
          </p>
        </div>

        {/* Recording status pill (if recording) */}
        {recordingStatus === 'recording' && (
          <div 
            onClick={(e) => { e.stopPropagation(); setPeekPreviewActive(!peekPreviewActive); }}
            className="mt-6 px-4 py-1.5 bg-red-950/40 border border-red-500/30 rounded-full flex items-center space-x-2 text-xs text-red-300 animate-pulse cursor-pointer"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>REC {formatDuration(recordingDuration)}</span>
            <Eye size={12} className="ml-1 opacity-70" />
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="w-full flex justify-between items-center px-8 pb-10">
        <button
          onClick={(e) => { e.stopPropagation(); setShowPipModal(true); }}
          className={`w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition active:scale-95 ${
            pipActive 
              ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/20' 
              : 'bg-white/10 border-white/10 text-white/80'
          }`}
          title="Lớp Phủ PiP Nổi iPhone"
        >
          <Layers size={19} />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenPinModal(); }}
          className="text-xs text-gray-400 font-light tracking-wide py-2 px-4 rounded-full bg-white/5 backdrop-blur-sm active:bg-white/20 transition"
        >
          Nhấn để mở khóa
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowRemoteHostModal(true); }}
          className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-500/40 backdrop-blur-md flex items-center justify-center text-purple-300 active:bg-purple-900 transition"
          title="Kết nối Máy Tính"
        >
          <Cast size={19} />
        </button>
      </div>

      {/* Swipe Bar */}
      <div className="w-full flex justify-center pb-2">
        <div className="w-36 h-1 bg-white/30 rounded-full" />
      </div>

      {/* PIN Keypad Modal (Tier 1: Workspace Unlock) */}
      {showPinModal && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex flex-col justify-between py-12 px-8 z-50 animate-fade-in"
        >
          <div className="flex flex-col items-center pt-8">
            <Unlock size={28} className="text-white/80 mb-4" />
            <h2 className="text-lg font-medium text-white mb-2">Nhập mã PIN</h2>
            <p className="text-xs text-gray-400 mb-6">Nhập mật mã để vào màn hình làm việc</p>

            {/* PIN Dots */}
            <div className={`flex space-x-5 mb-8 ${pinError ? 'animate-bounce text-red-500' : ''}`}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border border-white/40 transition-all duration-200 ${
                    enteredPin.length > idx ? 'bg-white scale-110' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
            {pinError && <p className="text-xs text-red-400">Mã PIN không chính xác</p>}
          </div>

          {/* Keypad Grid */}
          <div className="max-w-xs mx-auto w-full grid grid-cols-3 gap-y-5 gap-x-6 justify-items-center">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-2xl font-light text-white flex items-center justify-center transition"
                style={{ width: '70px', height: '70px' }}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setShowPinModal(false)}
              className="text-sm text-gray-400 font-light flex items-center justify-center"
              style={{ width: '70px', height: '70px' }}
            >
              Hủy
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-2xl font-light text-white flex items-center justify-center transition"
              style={{ width: '70px', height: '70px' }}
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-gray-400 font-light flex items-center justify-center active:text-white"
              style={{ width: '70px', height: '70px' }}
            >
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
