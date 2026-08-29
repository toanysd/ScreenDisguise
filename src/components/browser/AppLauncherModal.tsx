import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PRESET_APPS, appLauncherService } from '../../core/AppLauncher';
import { X, ExternalLink, Smartphone, Play, Plus, Info, Video } from 'lucide-react';

export const AppLauncherModal: React.FC = () => {
  const { showAppLauncher, setShowAppLauncher, favoriteAppPackage, setFavoriteAppPackage } = useAppStore();
  const [customPackage, setCustomPackage] = useState('');
  const [launchedNotice, setLaunchedNotice] = useState('');

  if (!showAppLauncher) return null;

  const handleLaunch = (pkg: string, scheme: string = '', name: string = '') => {
    appLauncherService.launch(pkg, scheme);
    setLaunchedNotice(`Đang chuyển hướng mở ứng dụng ${name || pkg}...`);
    setTimeout(() => {
      setLaunchedNotice('');
      setShowAppLauncher(false);
    }, 2000);
  };

  const handleCustomLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPkg = customPackage.trim();
    if (!cleanPkg) return;
    handleLaunch(cleanPkg, `${cleanPkg}://`, cleanPkg);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setShowAppLauncher(false)}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Khởi Chạy Ứng Dụng</h3>
              <p className="text-[10px] text-slate-400">Mở app Camera IP / Camera máy trực tiếp</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAppLauncher(false)}
            className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice if launched */}
        {launchedNotice && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-xs text-center animate-pulse flex items-center justify-center space-x-1.5">
            <Play size={13} />
            <span>{launchedNotice}</span>
          </div>
        )}

        {/* Primary Recommended: iCSee Card */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-850 p-3.5 rounded-2xl border border-emerald-500/40 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <Video size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center">
                  <span>iCSee Camera</span>
                  <span className="ml-1.5 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">Đề xuất</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Xiongmai P2P IP Camera</p>
              </div>
            </div>
            <button
              onClick={() => handleLaunch('com.xm.csee', 'icsee://', 'iCSee')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-md active:scale-95 transition"
            >
              <span>Mở iCSee</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Other Preset Apps Grid */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400">Các ứng dụng Camera khác:</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_APPS.filter(a => a.id !== 'icsee').map((app) => (
              <button
                key={app.id}
                onClick={() => handleLaunch(app.packageName, app.iosScheme, app.name)}
                className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 text-left active:scale-95 transition min-w-0"
              >
                <div className={`w-7 h-7 rounded-lg ${app.iconColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {app.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-[11px] font-semibold text-slate-200 truncate">{app.name}</h5>
                  <p className="text-[9px] text-slate-500 truncate">{app.packageName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Package Input */}
        <form onSubmit={handleCustomLaunch} className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-medium text-slate-400 flex items-center">
            <Plus size={12} className="mr-1 text-blue-400" />
            Mở App tùy chỉnh (Nhập Package Name / Scheme):
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="VD: com.example.camera"
              value={customPackage}
              onChange={(e) => setCustomPackage(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium shrink-0 transition"
            >
              Mở
            </button>
          </div>
        </form>

        {/* Tips on Android Multi-Window */}
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center text-amber-400 font-semibold space-x-1">
            <Info size={12} />
            <span>Mẹo giữ iCSee ghi hình ngầm:</span>
          </div>
          <p>
            Trên Android, bạn hãy mở <strong>iCSee</strong> ở chế độ <em>Cửa sổ nổi (Pop-up View)</em> hoặc <em>Chia đôi màn hình (Split Screen)</em>, sau đó mở <strong>ScreenDisguise</strong>. ScreenDisguise sẽ kích hoạt <strong>WakeLock</strong> giúp màn hình không bao giờ tắt và iCSee luôn ghi hình liên tục.
          </p>
        </div>
      </div>
    </div>
  );
};
