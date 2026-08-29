import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cameraRecorder } from '../../core/CameraRecorder';
import { Lock, Unlock, Wifi, Battery, BatteryCharging, Moon, Eye, Clock } from 'lucide-react';

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
    vaultPinCode,
    carrierName,
    standbyStyle,
    setStandbyStyle,
    recordingStatus,
    recordingDuration,
    setPeekPreviewActive,
    peekPreviewActive,
  } = useAppStore();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

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

    return () => clearInterval(timer);
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

  // Secret Triple Tap - Clock to cycle Standby mode (LockScreen -> AOD -> OLED Black)
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

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);

      if (newPin.length === 4) {
        if (newPin === pinCode) {
          // Tier 1 PIN -> Open disguise workspace (Browser or Calculator)
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
        onClick={() => setStandbyStyle('lockscreen')}
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
    <div className="fixed inset-0 bg-black text-white flex flex-col justify-between select-none z-40 overflow-hidden">
      {/* Hidden touch area for record toggle (Top Right) */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 z-50 bg-transparent"
        onClick={handleRecTap}
      />

      {/* Hidden touch area for OLED mode (Top Left) */}
      <div 
        className="absolute top-0 left-0 w-20 h-20 z-50 bg-transparent"
        onClick={() => setUIMode('oled')}
      />

      {/* Status Bar */}
      <div className="w-full flex justify-between items-center px-7 pt-4 text-xs font-medium opacity-80 z-20">
        <span>{carrierName || 'docomo'}</span>
        <div className="flex items-center space-x-2">
          {recordingStatus === 'recording' && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block mr-1" />
          )}
          <Wifi size={14} />
          <div className="flex items-center space-x-1">
            <span>{batteryLevel}%</span>
            {isCharging ? <BatteryCharging size={16} className="text-green-400" /> : <Battery size={16} />}
          </div>
        </div>
      </div>

      {/* Main Lock Screen Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16">
        <div 
          onClick={() => setShowPinModal(true)}
          className="cursor-pointer flex flex-col items-center group transition active:scale-95"
        >
          <Lock size={22} className="opacity-70 mb-3" />
        </div>

        <div onClick={handleClockTap} className="flex flex-col items-center cursor-pointer">
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
            onClick={() => setPeekPreviewActive(!peekPreviewActive)}
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
          onClick={() => setStandbyStyle('aod')}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 active:bg-white/30 transition"
          title="Màn hình AOD tiết kiệm pin"
        >
          <Clock size={19} />
        </button>

        <button 
          onClick={() => setShowPinModal(true)}
          className="text-xs text-gray-400 font-light tracking-wide py-2 px-4 rounded-full bg-white/5 backdrop-blur-sm active:bg-white/20 transition"
        >
          Nhấn để mở khóa
        </button>

        <button
          onClick={() => setUIMode('oled')}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 active:bg-white/30 transition"
          title="Màn hình đen OLED tuyệt đối"
        >
          <Moon size={19} />
        </button>
      </div>

      {/* Swipe Bar */}
      <div className="w-full flex justify-center pb-2">
        <div className="w-36 h-1 bg-white/30 rounded-full" />
      </div>

      {/* PIN Keypad Modal (Tier 1: Workspace Unlock) */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex flex-col justify-between py-12 px-8 z-50 animate-fade-in">
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
