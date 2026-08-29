import React, { useState, useEffect, useRef } from 'react';
import { remoteStreamService, RemoteCommand } from '../../core/RemoteStreamService';
import { 
  Video, VideoOff, RefreshCw, Moon, Lock, Camera, 
  Maximize, Minimize, ShieldCheck, HardDrive, Circle, AlertCircle 
} from 'lucide-react';

export const RemoteViewer: React.FC<{ initialRoomId?: string }> = ({ initialRoomId = '' }) => {
  const [roomIdInput, setRoomIdInput] = useState<string>(initialRoomId);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [remoteStatus, setRemoteStatus] = useState<any>({
    recordingStatus: 'idle',
    recordingDuration: 0,
    cameraFacing: 'environment',
    uiMode: 'lockscreen',
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (initialRoomId) {
      handleConnect(initialRoomId);
    }
  }, [initialRoomId]);

  const handleConnect = async (targetId: string = roomIdInput) => {
    const cleanId = targetId.trim();
    if (!cleanId) return;

    setIsConnecting(true);
    setErrorMsg('');

    try {
      const connected = await remoteStreamService.initViewer(
        cleanId,
        (stream) => {
          setIsConnected(true);
          setIsConnecting(false);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        },
        (status) => {
          setRemoteStatus(status);
        }
      );

      if (!connected) {
        setErrorMsg('Không thể kết nối tới phòng này. Vui lòng kiểm tra mã phòng trên điện thoại!');
        setIsConnecting(false);
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối WebRTC.');
      setIsConnecting(false);
    }
  };

  const sendCmd = (cmd: RemoteCommand) => {
    remoteStreamService.sendViewerCommand(cmd);
  };

  const handleSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imgUrl = canvas.toDataURL('image/jpeg');
        const a = document.createElement('a');
        a.href = imgUrl;
        a.download = `RemoteSnapshot_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-base font-bold tracking-wide flex items-center">
            <span>Màn Hình Điều Khiển Từ Xa (PC Remote Hub)</span>
            <span className="ml-2.5 text-xs font-mono font-normal px-2 py-0.5 bg-purple-900/50 text-purple-300 border border-purple-700/50 rounded-full">
              P2P WebRTC HD
            </span>
          </h1>
        </div>

        {isConnected ? (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-emerald-400 flex items-center bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
              <Circle size={8} className="fill-emerald-400 mr-1.5" />
              Đang trực tiếp từ điện thoại
            </span>
            {remoteStatus.recordingStatus === 'recording' && (
              <span className="text-xs text-red-400 font-mono bg-red-950/60 px-3 py-1 rounded-full border border-red-500/40 animate-pulse">
                REC {formatDuration(remoteStatus.recordingDuration)}
              </span>
            )}
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleConnect(); }} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nhập mã phòng (VD: SD-1234)"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono uppercase tracking-wider outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isConnecting}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition shadow-md disabled:opacity-50"
            >
              {isConnecting ? 'Đang kết nối...' : 'Kết nối'}
            </button>
          </form>
        )}
      </div>

      {/* Main Video Screen Container */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {isConnected ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
              <Video size={32} />
            </div>
            <h2 className="text-lg font-bold text-white">Chưa kết nối tới điện thoại</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mở <strong>ScreenDisguise</strong> trên điện thoại ➔ Bấm vào biểu tượng <strong>Truyền Màn Hình (Cast)</strong> trong menu để lấy mã phòng và nhập vào đây.
            </p>
            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Remote Control Toolbar */}
      {isConnected && (
        <div className="bg-slate-900 border-t border-slate-800 px-8 py-3.5 flex justify-between items-center z-20">
          {/* Status info */}
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span>Trạng thái máy: <strong className="text-white uppercase">{remoteStatus.uiMode}</strong></span>
            <span>•</span>
            <span>Camera: <strong className="text-white">{remoteStatus.cameraFacing === 'environment' ? 'Sau' : 'Trước'}</strong></span>
          </div>

          {/* Remote Actions */}
          <div className="flex items-center space-x-3">
            {/* Record toggle */}
            <button
              onClick={() => {
                if (remoteStatus.recordingStatus === 'recording') {
                  sendCmd({ type: 'STOP_RECORD' });
                } else {
                  sendCmd({ type: 'START_RECORD' });
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                remoteStatus.recordingStatus === 'recording'
                  ? 'bg-red-600 text-white shadow-lg animate-pulse'
                  : 'bg-red-950/60 border border-red-600/50 text-red-300 hover:bg-red-900/60'
              }`}
            >
              {remoteStatus.recordingStatus === 'recording' ? <VideoOff size={16} /> : <Video size={16} />}
              <span>{remoteStatus.recordingStatus === 'recording' ? 'Dừng Ghi Hình' : 'Quay Từ Xa'}</span>
            </button>

            {/* Switch Camera */}
            <button
              onClick={() => sendCmd({ type: 'SWITCH_CAMERA' })}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
              title="Đổi camera trước/sau"
            >
              <RefreshCw size={15} />
              <span>Đổi Camera</span>
            </button>

            {/* Black screen phone */}
            <button
              onClick={() => sendCmd({ type: 'SET_MODE_OLED' })}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
              title="Làm đen màn hình điện thoại"
            >
              <Moon size={15} className="text-purple-400" />
              <span>Làm Đen Điện Thoại</span>
            </button>

            {/* Lock phone */}
            <button
              onClick={() => sendCmd({ type: 'SET_MODE_LOCK' })}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
              title="Chuyển sang màn hình khóa"
            >
              <Lock size={15} className="text-yellow-400" />
              <span>Khóa Màn Điện Thoại</span>
            </button>

            {/* Snapshot */}
            <button
              onClick={handleSnapshot}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-md"
              title="Chụp ảnh và tải về máy tính"
            >
              <Camera size={15} />
              <span>Chụp Ảnh Về PC</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
