import React, { useState, useEffect } from 'react';
import { X, Copy, Monitor, ShieldAlert, Smartphone } from 'lucide-react';
import { remoteStreamService } from '../../core/RemoteStreamService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function RemoteHostModal({ isOpen, onClose }: Props) {
  const [roomId, setRoomId] = useState<string>('');
  const [status, setStatus] = useState<string>('Đang khởi tạo Server...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startHost();
    }
  }, [isOpen]);

  const startHost = () => {
    setStatus('Đang khởi tạo P2P Server...');
    remoteStreamService.initializeAsHost((id) => {
      setRoomId(id);
      setStatus('Đang chờ PC kết nối tới...');
    });

    remoteStreamService.onStatusChange = (newStatus) => {
      setStatus(newStatus);
    };
  };

  if (!isOpen) return null;

  const remoteUrl = `${window.location.origin}${window.location.pathname}?view=${roomId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Monitor size={20} className="text-blue-400" /> PC Remote Hub
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4 ring-4 ring-blue-500/5">
              <Smartphone className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm text-slate-300 font-medium">{status}</p>
          </div>
          
          {roomId && (
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Mã Kết Nối Của Bạn</p>
                <p className="text-2xl font-mono text-white font-bold tracking-widest">{roomId}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-slate-400 text-center">Hoặc gửi link này qua Zalo/Máy tính để mở nhanh:</p>
                <div className="flex bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                  <div className="flex-1 px-3 py-2 text-xs text-slate-400 font-mono truncate select-all flex items-center">
                    {remoteUrl}
                  </div>
                  <button 
                    onClick={copyLink}
                    className={`px-4 flex items-center justify-center border-l border-slate-800 transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-rose-500/10 rounded-lg p-3 flex items-start gap-3 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300/80 leading-relaxed">
              Hãy giữ màn hình điện thoại ở ứng dụng này. PC có thể xem luồng camera và ấn nút tắt đen màn hình điện thoại từ xa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
