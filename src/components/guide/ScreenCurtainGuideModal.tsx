import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Smartphone, ShieldCheck, Sparkles, Moon, Sun, ArrowRight, CheckCircle2, Copy, Check } from 'lucide-react';

export const ScreenCurtainGuideModal: React.FC = () => {
  const { showScreenCurtainGuide, setShowScreenCurtainGuide, setUIMode } = useAppStore();
  const [activeTab, setActiveTab] = useState<'backtap' | 'tripleclick' | 'zoom'>('backtap');
  const [copied, setCopied] = useState(false);

  if (!showScreenCurtainGuide) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setShowScreenCurtainGuide(false)}
    >
      <div 
        className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Moon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1">
                <span>Màn Che Đen Phần Cứng iOS</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full">0ms</span>
              </h3>
              <p className="text-[10px] text-slate-400">Tắt đen 100% màn hình khi app đang chạy</p>
            </div>
          </div>
          <button 
            onClick={() => setShowScreenCurtainGuide(false)}
            className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Intro */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-[11px] text-amber-200/90 leading-relaxed">
          <strong>Đặc quyền trên iPhone:</strong> Khi bật tính năng này, màn hình sẽ <strong>tối đen kịt như tắt máy</strong> nhưng app bên dưới (iCSee, Zoom, YouTube...) <strong>vẫn chạy 100% liên tục</strong> không bị ngắt kết nối!
        </div>

        {/* Setup Method Switcher Tabs */}
        <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveTab('backtap')}
            className={`py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'backtap' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gõ Mặt Lưng
          </button>
          <button
            onClick={() => setActiveTab('tripleclick')}
            className={`py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'tripleclick' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            3 Lần Nút Nguồn
          </button>
          <button
            onClick={() => setActiveTab('zoom')}
            className={`py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'zoom' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Giảm Điểm Trắng
          </button>
        </div>

        {/* Tab 1: Back Tap (Chạm mặt lưng) */}
        {activeTab === 'backtap' && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Smartphone size={14} className="text-amber-400" />
              Cách cài đặt Gõ 2-3 lần mặt lưng (Back Tap):
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-400">
              <li>Mở <strong className="text-slate-200">Cài đặt (Settings)</strong> trên iPhone.</li>
              <li>Vào <strong className="text-slate-200">Trợ năng (Accessibility)</strong> ➔ Chọn <strong className="text-slate-200">Cảm ứng (Touch)</strong>.</li>
              <li>Kéo xuống dưới cùng chọn <strong className="text-slate-200">Chạm vào mặt sau (Back Tap)</strong>.</li>
              <li>Chọn <strong className="text-slate-200">Chạm hai lần (Double Tap)</strong> hoặc <strong className="text-slate-200">Chạm ba lần</strong> ➔ Gán tính năng <strong className="text-amber-300">"Giảm điểm trắng"</strong> hoặc <strong className="text-amber-300">"Màn che màn hình (Screen Curtain)"</strong>.</li>
            </ol>
            <div className="bg-slate-900 p-2 rounded-xl text-[10px] text-slate-400 border border-slate-800">
              💡 <em>Sau khi cài xong, khi đang mở iCSee hoặc Zoom, bạn chỉ cần gõ ngón tay 2 lần vào lưng iPhone là màn hình biến thành màu đen ngay tức thì!</em>
            </div>
          </div>
        )}

        {/* Tab 2: Triple Click Side Button */}
        {activeTab === 'tripleclick' && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-400" />
              Cách cài đặt Bấm 3 lần nút Nguồn:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-400">
              <li>Mở <strong className="text-slate-200">Cài đặt (Settings)</strong> trên iPhone.</li>
              <li>Vào <strong className="text-slate-200">Trợ năng (Accessibility)</strong>.</li>
              <li>Kéo xuống mục cuối cùng chọn <strong className="text-slate-200">Phím tắt trợ năng (Accessibility Shortcut)</strong>.</li>
              <li>Tích chọn <strong className="text-amber-300">Giảm điểm trắng (Reduce White Point)</strong> hoặc <strong className="text-amber-300">Thu phóng (Zoom - Bộ lọc Ánh sáng yếu)</strong>.</li>
            </ol>
            <div className="bg-slate-900 p-2 rounded-xl text-[10px] text-slate-400 border border-slate-800">
              💡 <em>Sử dụng: Bấm 3 lần liên tiếp vào nút Nguồn bên cạnh máy để bật/tắt lớp màn đen.</em>
            </div>
          </div>
        )}

        {/* Tab 3: Reduce White Point 100% */}
        {activeTab === 'zoom' && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Sun size={14} className="text-amber-400" />
              Cấu hình độ đen tối đa (100% Blackout):
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-400">
              <li>Vào <strong className="text-slate-200">Cài đặt</strong> ➔ <strong className="text-slate-200">Trợ năng</strong> ➔ <strong className="text-slate-200">Màn hình & Cỡ chữ</strong>.</li>
              <li>Bật <strong className="text-slate-200">Giảm điểm trắng (Reduce White Point)</strong> và kéo thanh trượt lên <strong className="text-amber-300">100%</strong>.</li>
              <li>Khi kết hợp giảm độ sáng màn hình về mức thấp nhất, iPhone sẽ đạt độ đen 0 Lux nhìn như máy đã tắt hoàn toàn.</li>
            </ol>
          </div>
        )}

        {/* Quick OLED Simulator Button */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => {
              setShowScreenCurtainGuide(false);
              setUIMode('oled');
            }}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs rounded-xl shadow transition active:scale-98 flex items-center justify-center space-x-1.5"
          >
            <Moon size={14} />
            <span>Thử Nghiệm Màn Đen OLED Ngay (Chạm 2 lần để thoát)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
