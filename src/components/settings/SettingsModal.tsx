import React, { useState } from 'react';
import { useAppStore, CameraFacing, VideoQuality, DisguiseType } from '../../store/useAppStore';
import { X, Camera, Mic, Key, Monitor, Video, ShieldCheck, Sun } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    showSettings,
    setShowSettings,
    cameraFacing,
    setCameraFacing,
    audioEnabled,
    setAudioEnabled,
    videoQuality,
    setVideoQuality,
    disguiseType,
    setDisguiseType,
    pinCode,
    setPinCode,
    wakeLockAlwaysOn,
    setWakeLockAlwaysOn,
  } = useAppStore();

  const [newPin, setNewPin] = useState(pinCode);
  const [pinSaved, setPinSaved] = useState(false);

  if (!showSettings) return null;

  const handleSavePin = () => {
    if (/^\d{4}$/.test(newPin)) {
      setPinCode(newPin);
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    } else {
      alert('Mã PIN phải gồm đúng 4 chữ số!');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setShowSettings(false)}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-base font-semibold text-white flex items-center">
            <ShieldCheck size={18} className="mr-2 text-blue-400" />
            Cài đặt Hệ thống
          </h3>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Camera size={14} className="mr-1.5 text-blue-400" />
            Ống kính máy ảnh
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Sau (Môi trường)', value: 'environment' },
              { label: 'Trước (Selfie)', value: 'user' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCameraFacing(opt.value as CameraFacing)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                  cameraFacing === opt.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Recording */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Mic size={14} className="mr-1.5 text-blue-400" />
            Thu âm Microphone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Bật thu âm', value: true },
              { label: 'Tắt (Chỉ hình)', value: false },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setAudioEnabled(opt.value)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                  audioEnabled === opt.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Quality */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Video size={14} className="mr-1.5 text-blue-400" />
            Độ phân giải
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['1080p', '720p', '480p'] as VideoQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => setVideoQuality(q)}
                className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                  videoQuality === q
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Default Disguise Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Monitor size={14} className="mr-1.5 text-blue-400" />
            Giao diện ngụy trang mặc định
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Trình duyệt Web', value: 'browser' },
              { label: 'Máy tính bỏ túi', value: 'calculator' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDisguiseType(opt.value as DisguiseType)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                  disguiseType === opt.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screen Wake Lock */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Sun size={14} className="mr-1.5 text-yellow-400" />
            Chống tắt màn hình (Wake Lock)
          </label>
          <button
            onClick={() => setWakeLockAlwaysOn(!wakeLockAlwaysOn)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-medium border transition ${
              wakeLockAlwaysOn
                ? 'bg-amber-600/30 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {wakeLockAlwaysOn ? 'Đang bật (Màn hình luôn sáng)' : 'Tắt'}
          </button>
        </div>

        {/* PIN Code Setting */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Key size={14} className="mr-1.5 text-blue-400" />
            Đổi mã PIN bảo mật (4 số)
          </label>
          <div className="flex space-x-2">
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-center text-white font-mono tracking-widest text-sm w-24 outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSavePin}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg py-1.5 transition"
            >
              {pinSaved ? 'Đã lưu!' : 'Cập nhật PIN'}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(false)}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 rounded-xl transition mt-2"
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
};
