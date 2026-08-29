import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Square, Video, Monitor, PowerOff, Smartphone, Info, Loader2 } from 'lucide-react';
import { remoteStreamService } from '../../core/RemoteStreamService';

interface RemoteViewerProps {
  initialRoomId: string;
}

export function RemoteViewer({ initialRoomId }: RemoteViewerProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [status, setStatus] = useState<string>('Chưa kết nối');
  const [isConnected, setIsConnected] = useState(false);
  const [phoneState, setPhoneState] = useState<{ isRecording: boolean; uiMode: string }>({ isRecording: false, uiMode: 'oled' });
  const [logs, setLogs] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => {
      const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
      if (newLogs.length > 5) return newLogs.slice(newLogs.length - 5);
      return newLogs;
    });
  };

  useEffect(() => {
    if (initialRoomId) {
      connectToHost(initialRoomId);
    }
    
    return () => {
      remoteStreamService.disconnect();
    };
  }, []);

  const connectToHost = (id: string) => {
    setStatus('Đang khởi tạo PeerJS...');
    addLog(`Đang cố kết nối tới ID: ${id}...`);
    
    remoteStreamService.connectAsViewer(id, (stream) => {
      addLog('Đã nhận luồng video từ Điện thoại!');
      setIsConnected(true);
      setStatus('Đã kết nối');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => addLog(`Lỗi phát video: ${e.message}`));
      }
    });

    remoteStreamService.onStatusChange = (newStatus) => {
      setStatus(newStatus);
      addLog(`Trạng thái: ${newStatus}`);
      if (newStatus.toLowerCase().includes('lỗi') || newStatus.includes('Ngắt kết nối')) {
        setIsConnected(false);
      }
    };

    remoteStreamService.onPhoneStateChange = (state) => {
      setPhoneState(state);
    };
  };

  const handleCommand = (cmd: 'start_record' | 'stop_record' | 'switch_camera' | 'black_screen') => {
    addLog(`Gửi lệnh: ${cmd}`);
    remoteStreamService.sendCommand(cmd);
  };

  const getPhoneScreenPreview = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
          {status.includes('Đang') || status.includes('Khởi tạo') ? (
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          ) : (
            <PowerOff className="w-12 h-12 text-slate-700" />
          )}
          <p className="text-sm font-medium text-center px-4">{status}</p>
        </div>
      );
    }
    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-3xl"
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <Monitor size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">PC Remote Hub</h1>
            <p className="text-xs text-slate-400">Trạm điều khiển & Nhân đôi màn hình</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-800 rounded-full px-4 py-1.5 border border-slate-700">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-sm font-medium text-slate-300">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 lg:p-8 gap-8 items-start lg:items-stretch overflow-y-auto">
        
        {/* Left Column: Device Mockup */}
        <div className="w-full lg:w-auto flex flex-col items-center justify-center flex-1">
          <div className="mb-4 flex items-center justify-between w-full max-w-[320px]">
            <span className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <Smartphone size={16} /> iPhone Target
            </span>
            {phoneState.isRecording && (
              <span className="flex items-center text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md animate-pulse">
                <Video size={12} className="mr-1" /> REC
              </span>
            )}
          </div>
          
          {/* Phone Frame Mockup */}
          <div className="relative w-full max-w-[320px] aspect-[9/19] bg-black border-[12px] border-slate-800 rounded-[2.5rem] shadow-2xl ring-1 ring-white/10 flex flex-col justify-between overflow-hidden">
            {/* Dynamic Island / Notch Mockup */}
            <div className="absolute top-0 inset-x-0 flex justify-center z-20">
              <div className="w-32 h-7 bg-black rounded-b-3xl"></div>
            </div>
            
            {/* Screen Content */}
            <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden flex flex-col">
              {getPhoneScreenPreview()}
              
              {/* Fake UI Overlay simulating Phone App Screen */}
              {isConnected && phoneState.uiMode !== 'oled' && (
                <div className="absolute inset-0 border-[4px] border-emerald-500/30 pointer-events-none rounded-3xl shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]"></div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Control Panel */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          {/* Connection Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Kết Nối</h2>
            {!isConnected ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Mã kết nối (Vd: PC-12345)"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
                <button
                  onClick={() => connectToHost(roomId)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-lg font-medium transition-colors text-sm"
                >
                  Kết Nối
                </button>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Smartphone className="text-emerald-400 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-medium text-sm">Đang kết nối với điện thoại</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{roomId}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-slate-400 hover:text-white p-2"
                  title="Ngắt kết nối"
                >
                  <PowerOff size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Remote Actions Card */}
          <div className={`bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg transition-opacity ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Thao tác điều khiển</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCommand(phoneState.isRecording ? 'stop_record' : 'start_record')}
                className={`p-4 rounded-xl flex flex-col items-center justify-center gap-3 border transition-all ${
                  phoneState.isRecording 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-500'
                }`}
              >
                {phoneState.isRecording ? <Square size={24} className="fill-current" /> : <Video size={24} />}
                <span className="text-sm font-medium">{phoneState.isRecording ? 'Dừng Ghi' : 'Bắt Đầu Ghi'}</span>
              </button>

              <button
                onClick={() => handleCommand('switch_camera')}
                className="p-4 rounded-xl flex flex-col items-center justify-center gap-3 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-500 transition-all"
              >
                <RefreshCw size={24} />
                <span className="text-sm font-medium">Đổi Camera</span>
              </button>

              <button
                onClick={() => handleCommand('black_screen')}
                className="col-span-2 p-4 rounded-xl flex flex-col items-center justify-center gap-3 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
              >
                <PowerOff size={20} />
                <span className="text-sm font-medium">Tắt đen màn hình Điện Thoại (OLED Mode)</span>
              </button>
            </div>
          </div>

          {/* Terminal / Logs Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg flex-1 min-h-[150px] flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Info size={16} /> Nhật ký hệ thống
            </h2>
            <div className="flex-1 bg-black rounded-lg p-3 overflow-y-auto font-mono text-xs text-green-400 border border-slate-800 flex flex-col justify-end">
              {logs.length === 0 ? (
                <span className="text-slate-600">Đang chờ sự kiện...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
