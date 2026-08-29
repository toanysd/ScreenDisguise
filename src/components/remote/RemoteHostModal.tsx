import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { remoteStreamService } from '../../core/RemoteStreamService';
import { X, Cast, Copy, Check, Monitor, Moon, Shield, Radio, Video } from 'lucide-react';

export const RemoteHostModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isViewerConnected, setIsViewerConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { setUIMode } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      remoteStreamService
        .initHost(
          () => setIsViewerConnected(true),
          () => setIsViewerConnected(false)
        )
        .then((id) => {
          setRoomId(id);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentOrigin = window.location.origin + window.location.pathname;
  const directViewerUrl = `${currentOrigin}?view=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(directViewerUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cast size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Xem Màn Hình Từ Máy Tính</h3>
              <p className="text-[10px] text-slate-400">Truyền luồng trực tiếp sang PC qua WebRTC</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          isViewerConnected
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
            : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
        }`}>
          <div className="flex items-center space-x-2">
            <Radio size={16} className={isViewerConnected ? 'animate-pulse text-emerald-400' : 'text-purple-400'} />
            <span className="text-xs font-semibold">
              {isViewerConnected ? 'Máy tính ĐÃ KẾT NỐI & Đang xem!' : 'Đang phát tín hiệu chờ máy tính...'}
            </span>
          </div>
        </div>

        {/* Room Code Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Mã Kết Nối Phòng (Room Code)</span>
          <div className="text-3xl font-mono font-bold text-white tracking-widest py-1">
            {loading ? '...' : roomId}
          </div>
          <p className="text-[10px] text-slate-500">Mở link này trên trình duyệt máy tính của bạn:</p>

          <div className="flex items-center space-x-2 bg-slate-900 rounded-xl p-2 border border-slate-800">
            <input
              type="text"
              readOnly
              value={directViewerUrl}
              className="bg-transparent text-[10px] text-slate-300 flex-1 outline-none truncate font-mono"
            />
            <button
              onClick={handleCopy}
              className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs flex items-center space-x-1 shrink-0 transition"
              title="Sao chép link"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span className="text-[10px]">{copied ? 'Đã chép' : 'Chép'}</span>
            </button>
          </div>
        </div>

        {/* Quick stealth action */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-slate-400">Sau khi máy tính kết nối, bạn có thể chuyển điện thoại sang màn hình đen:</p>
          <button
            onClick={() => {
              onClose();
              setUIMode('oled');
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            <Moon size={15} className="text-purple-400" />
            <span>Tắt Màn Hình Điện Thoại (Đen OLED) & Tiếp tục phát</span>
          </button>
        </div>
      </div>
    </div>
  );
};
