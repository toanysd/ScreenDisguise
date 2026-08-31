import React from 'react';
import { useAppStore, PipStyle } from '../../store/useAppStore';
import { floatingPipService } from '../../core/FloatingPipService';
import { X, Layers, Moon, Clock, ShieldAlert, Sparkles, ExternalLink, Check, Power } from 'lucide-react';

export const FloatingPipModal: React.FC = () => {
  const { showPipModal, setShowPipModal, pipActive, pipStyle, setPipStyle, setShowScreenCurtainGuide } = useAppStore();

  if (!showPipModal) return null;

  const handleStartPip = async (style: PipStyle) => {
    setPipStyle(style);
    const success = await floatingPipService.startPip(style);
    if (success) {
      setShowPipModal(false);
    }
  };

  const handleStopPip = async () => {
    await floatingPipService.stopPip();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setShowPipModal(false)}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Lớp Phủ PiP Nổi iPhone</span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full">iOS PiP</span>
              </h3>
              <p className="text-[10px] text-slate-400">Nổi đè lên trên app iCSee / Zoom đang chạy</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPipModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Status Pill */}
        {pipActive ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Cửa sổ PiP đang nổi hoạt động</p>
                <p className="text-[10px] text-slate-400">Bạn có thể chuyển sang app khác</p>
              </div>
            </div>
            <button
              onClick={handleStopPip}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Power size={12} />
              <span>Tắt PiP</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed">
            Chọn kiểu dáng lớp phủ nổi bên dưới. Cửa sổ này sẽ <strong>lơ lửng trên màn hình iPhone</strong> và che đi giao diện app bạn muốn che:
          </p>
        )}

        {/* PiP Style Selection Cards */}
        <div className="space-y-2.5">
          {/* Style 1: Pure OLED Black */}
          <button
            onClick={() => handleStartPip('oled')}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition group ${
              pipStyle === 'oled' && pipActive
                ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-black border border-slate-800 flex items-center justify-center text-slate-400">
                <Moon size={18} className="text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">Màn Đen Tuyệt Đối (OLED Black)</h4>
                <p className="text-[10px] text-slate-400">Khung đen kịt che khuất camera hoặc màn hình app</p>
              </div>
            </div>
            {pipStyle === 'oled' && pipActive ? <Check size={16} className="text-indigo-400" /> : <ExternalLink size={14} className="opacity-40" />}
          </button>

          {/* Style 2: Digital Clock */}
          <button
            onClick={() => handleStartPip('clock')}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition group ${
              pipStyle === 'clock' && pipActive
                ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Clock size={18} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Đồng Hồ Kỹ Thuật Số (Digital Clock)</h4>
                <p className="text-[10px] text-slate-400">Ngụy trang như một widget xem giờ nổi thông thường</p>
              </div>
            </div>
            {pipStyle === 'clock' && pipActive ? <Check size={16} className="text-blue-400" /> : <ExternalLink size={14} className="opacity-40" />}
          </button>
        </div>

        {/* iOS Usage Instructions */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-200 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            Cách sử dụng trên iPhone (Safari / Chrome iOS):
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-[10px] leading-normal text-slate-400">
            <li>Bấm chọn 1 trong 2 kiểu dáng ở trên để mở cửa sổ PiP.</li>
            <li>Vuốt về Màn hình chính (Home) hoặc mở sang app <strong>iCSee / Zoom</strong>.</li>
            <li>Dùng 2 ngón tay kéo to / nhỏ hoặc di chuyển khung PiP đến vị trí cần che phủ.</li>
          </ol>
        </div>

        {/* Alternative: Screen Curtain Guide Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              setShowPipModal(false);
              setShowScreenCurtainGuide(true);
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center justify-center space-x-1.5 transition"
          >
            <ShieldAlert size={14} />
            <span>Xem thêm: Phím tắt Màn Che Đen 100% (Screen Curtain)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
