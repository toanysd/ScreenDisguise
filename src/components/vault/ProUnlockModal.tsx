import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Crown, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const ProUnlockModal: React.FC = () => {
  const { showProUnlock, setShowProUnlock, vaultPinCode, setUIMode } = useAppStore();
  const [licenseKey, setLicenseKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!showProUnlock) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (licenseKey.trim() === vaultPinCode) {
      setErrorMsg('');
      setLicenseKey('');
      setShowProUnlock(false);
      setUIMode('vault'); // Open secret media vault
    } else {
      setErrorMsg('Mã kích hoạt không hợp lệ hoặc đã hết hạn sử dụng. (Mã lỗi: ERR_LIC_403)');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setShowProUnlock(false)}
    >
      <div 
        className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button 
          onClick={() => setShowProUnlock(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            <Crown size={26} />
          </div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
            <span>Nâng Cấp Bản Pro</span>
            <Sparkles size={16} className="text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Mở khóa đầy đủ quyền truy cập & lưu trữ bảo mật
          </p>
        </div>

        {/* Fake Pro Features */}
        <div className="space-y-2 py-2 bg-slate-800/40 rounded-2xl p-3.5 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
            <span>Lưu trữ đám mây & dữ liệu không giới hạn</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
            <span>Mã hóa bảo mật cấp cao theo tiêu chuẩn AES</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
            <span>Tự động tối ưu hóa hiệu năng & tốc độ xử lý</span>
          </div>
        </div>

        {/* License Key Form */}
        <form onSubmit={handleActivate} className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300 flex items-center">
              <ShieldCheck size={13} className="mr-1 text-amber-400" />
              Nhập mã kích hoạt (License Key)
            </label>
            <input
              type="password"
              placeholder="Nhập mã bản quyền VIP..."
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm outline-none transition text-center tracking-widest font-mono"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-400 text-center animate-bounce leading-tight">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-semibold text-xs transition shadow-lg active:scale-98 flex items-center justify-center space-x-1.5"
          >
            <span>Kích hoạt ngay</span>
          </button>
        </form>

        <p className="text-[10px] text-slate-500 text-center">
          Nếu chưa có mã kích hoạt, vui lòng liên hệ quản trị viên để được cấp mã.
        </p>
      </div>
    </div>
  );
};
