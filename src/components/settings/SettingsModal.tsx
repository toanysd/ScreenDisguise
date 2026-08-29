import React, { useState } from 'react';
import { useAppStore, CameraFacing, VideoQuality, DisguiseType, StandbyStyle } from '../../store/useAppStore';
import { X, Camera, Mic, Key, Monitor, Video, ShieldCheck, Sun, Signal, Clock } from 'lucide-react';

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
    standbyStyle,
    setStandbyStyle,
    carrierName,
    setCarrierName,
    pinCode,
    setPinCode,
    vaultPinCode,
    setVaultPinCode,
    wakeLockAlwaysOn,
    setWakeLockAlwaysOn,
  } = useAppStore();

  const [newPin, setNewPin] = useState(pinCode);
  const [newVaultPin, setNewVaultPin] = useState(vaultPinCode);
  const [customCarrier, setCustomCarrier] = useState(carrierName);
  const [pinSaved, setPinSaved] = useState(false);

  if (!showSettings) return null;

  const handleSaveSecurity = () => {
    if (!/^\d{4}$/.test(newPin)) {
      alert('Mã PIN mở khóa màn hình phải gồm đúng 4 chữ số!');
      return;
    }
    if (!/^\d{4}$/.test(newVaultPin)) {
      alert('Mã kích hoạt Pro / Kho Media phải gồm đúng 4 chữ số!');
      return;
    }
    setPinCode(newPin);
    setVaultPinCode(newVaultPin);
    setCarrierName(customCarrier);
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2000);
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

        {/* Japanese Carrier Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Signal size={14} className="mr-1.5 text-blue-400" />
            Nhà mạng hiển thị (Mạng Nhật Bản)
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['docomo', 'SoftBank', 'au', 'Rakuten', 'LINE Mobile', 'None'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  const val = c === 'None' ? '' : c;
                  setCustomCarrier(val);
                  setCarrierName(val);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  customCarrier === (c === 'None' ? '' : c)
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {c === 'None' ? 'Ẩn mạng' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Default Standby Style */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center">
            <Clock size={14} className="mr-1.5 text-blue-400" />
            Chế độ màn hình khóa / Chờ
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Khóa chuẩn', value: 'lockscreen' },
              { label: 'AOD mờ', value: 'aod' },
              { label: 'Đen OLED', value: 'oled' },
            ].map((st) => (
              <button
                key={st.value}
                onClick={() => setStandbyStyle(st.value as StandbyStyle)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  standbyStyle === st.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
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
            Độ phân giải video
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

        {/* 2-Tier Security Passcode Section */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h4 className="text-xs font-bold text-amber-400 flex items-center">
            <Key size={14} className="mr-1.5" />
            Bảo Mật 2 Cấp Mật Khẩu
          </h4>

          {/* Tier 1 PIN */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300 flex justify-between">
              <span>Mã PIN Cấp 1 (Mở khóa màn hình)</span>
              <span className="text-gray-500">Mặc định: 1234</span>
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-center text-white font-mono tracking-widest text-sm w-full outline-none focus:border-blue-500"
            />
          </div>

          {/* Tier 2 PIN */}
          <div className="space-y-1">
            <label className="text-[11px] text-amber-300 flex justify-between">
              <span>Mã Kích Hoạt Cấp 2 (Kho Video / Pro Upgrade)</span>
              <span className="text-gray-500">Mặc định: 8888</span>
            </label>
            <input
              type="password"
              maxLength={4}
              value={newVaultPin}
              onChange={(e) => setNewVaultPin(e.target.value)}
              className="bg-slate-800 border border-amber-500/40 rounded-lg px-3 py-1.5 text-center text-amber-300 font-mono tracking-widest text-sm w-full outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleSaveSecurity}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-lg py-2 transition"
          >
            {pinSaved ? 'Đã lưu cấu hình bảo mật!' : 'Cập nhật Mật khẩu & Nhà mạng'}
          </button>
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
