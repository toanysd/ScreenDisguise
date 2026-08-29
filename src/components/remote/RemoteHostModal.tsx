import React, { useState, useEffect } from 'react';
import { X, Copy, Monitor, ShieldAlert, Smartphone, Cast, Camera, Check } from 'lucide-react';
import { remoteStreamService } from '../../core/RemoteStreamService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function RemoteHostModal({ isOpen, onClose }: Props) {
  const [roomId, setRoomId] = useState<string>('');
  const [status, setStatus] = useState<string>('Đang khởi tạo...');
  const [copied, setCopied] = useState(false);
  const [streamSource, setStreamSource] = useState<'camera' | 'screen'>('screen');

  useEffect(() => {
    if (isOpen) {
      startHost();
    }
  }, [isOpen]);

  const startHost = () => {
    setStatus('Đang tạo kênh P2P...');
    remoteStreamService.initializeAsHost((id) => {
      setRoomId(id);
      setStatus('Sẵn sàng kết nối');
    });

    remoteStreamService.onStatusChange = (newStatus) => {
      setStatus(newStatus);
    };
  };

  const handleSourceChange = async (source: 'camera' | 'screen') => {
    setStreamSource(source);
    await remoteStreamService.setStreamSource(source);
  };

  if (!isOpen) return null;

  const remoteUrl = `${window.location.origin}${window.location.pathname}?view=${roomId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Monitor size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Kết Nối Màn Hình & PC</h2>
              <p className="text-[10px] text-slate-400">Nhân đôi & Mở rộng không gian làm việc</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          
          {/* Stream Source Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Chọn nội dung truyền sang PC:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSourceChange('screen')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  streamSource === 'screen' 
                    ? 'bg-blue-600/20 border-blue-500 text-white' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Cast size={18} className={streamSource === 'screen' ? 'text-blue-400' : 'text-slate-500'} />
                  {streamSource === 'screen' && <Check size={14} className="text-blue-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Màn Hình Điện Thoại</h4>
                  <p className="text-[9px] text-slate-400">Học Zoom, xem tài liệu, chia sẻ app</p>
                </div>
              </button>

              <button
                onClick={() => handleSourceChange('camera')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  streamSource === 'camera' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Camera size={18} className={streamSource === 'camera' ? 'text-indigo-400' : 'text-slate-500'} />
                  {streamSource === 'camera' && <Check size={14} className="text-indigo-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Camera Giám Sát</h4>
                  <p className="text-[9px] text-slate-400">Quay chụp bí mật từ xa</p>
                </div>
              </button>
            </div>
          </div>

          {/* Connection Code Display */}
          {roomId && (
            <div className="space-y-3 pt-1">
              <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-3.5 text-center shadow-inner">
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-0.5">Mã Kết Nối Thiết Bị</p>
                <p className="text-2xl font-mono text-white font-black tracking-widest">{roomId}</p>
                <p className="text-[10px] text-slate-400 mt-1">{status}</p>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-400 text-center">Hoặc gửi link này mở trực tiếp trên trình duyệt PC:</p>
                <div className="flex bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="flex-1 px-3 py-2 text-[11px] text-slate-400 font-mono truncate select-all flex items-center">
                    {remoteUrl}
                  </div>
                  <button 
                    onClick={copyLink}
                    className={`px-3.5 flex items-center justify-center border-l border-slate-800 transition ${
                      copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-500/10 rounded-xl p-3 flex items-start gap-2.5 border border-blue-500/20">
            <Smartphone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-300/90 leading-relaxed">
              Khi chọn <strong>Màn hình</strong>, điện thoại sẽ yêu cầu cấp quyền "Ghi màn hình/Phát trực tiếp". Bạn chọn <strong>Bắt đầu truyền phát</strong> để màn hình hiện lên PC.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
