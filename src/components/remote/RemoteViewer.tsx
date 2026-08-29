import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, RefreshCw, Square, Video, Monitor, PowerOff, Smartphone, 
  Info, Loader2, Maximize2, Minimize2, RotateCw, Cast, Tv, 
  HelpCircle, ExternalLink, ShieldCheck, Sparkles, Sliders
} from 'lucide-react';
import { remoteStreamService } from '../../core/RemoteStreamService';

interface RemoteViewerProps {
  initialRoomId: string;
}

export function RemoteViewer({ initialRoomId }: RemoteViewerProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [status, setStatus] = useState<string>('Chưa kết nối');
  const [isConnected, setIsConnected] = useState(false);
  const [phoneState, setPhoneState] = useState<{ 
    isRecording: boolean; 
    uiMode: string;
    streamSource?: 'camera' | 'screen';
    cameraFacing?: string;
  }>({ isRecording: false, uiMode: 'oled', streamSource: 'camera' });
  
  const [activeTab, setActiveTab] = useState<'mirror' | 'stealth' | 'guide'>('mirror');
  const [viewLayout, setViewLayout] = useState<'clone' | 'expand'>('clone');
  const [isRotated, setIsRotated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => {
      const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
      if (newLogs.length > 6) return newLogs.slice(newLogs.length - 6);
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
    addLog(`Đang kết nối tới ID: ${id}...`);
    
    remoteStreamService.connectAsViewer(id, (stream) => {
      addLog('Đã nhận luồng trực tiếp từ Điện thoại!');
      setIsConnected(true);
      setStatus('Đã kết nối trực tiếp');
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

  const handleCommand = (cmd: 'start_record' | 'stop_record' | 'switch_camera' | 'black_screen' | 'switch_to_screen' | 'switch_to_camera') => {
    addLog(`Gửi lệnh: ${cmd}`);
    remoteStreamService.sendCommand(cmd);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none" ref={containerRef}>
      {/* Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-5 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
            <Tv size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Desktop Mirror & Workspace Hub</h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">Pro</span>
            </div>
            <p className="text-xs text-slate-400">Nhân đôi & Mở rộng màn hình iPhone / Android trên PC</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="hidden md:flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('mirror')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'mirror' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cast size={14} /> Màn Hình Nhân Đôi
          </button>
          <button
            onClick={() => setActiveTab('stealth')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'stealth' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera size={14} /> Module Quay Chụp Ngầm
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'guide' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle size={14} /> Hướng Dẫn Thao Tác Chuột
          </button>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 bg-slate-800/80 rounded-full px-3.5 py-1.5 border border-slate-700">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-medium text-slate-300">
            {isConnected ? (phoneState.streamSource === 'screen' ? 'Screen Cast HD' : 'Camera Live') : 'Offline'}
          </span>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-slate-900 border-b border-slate-800 p-2 gap-1 justify-around">
        <button
          onClick={() => setActiveTab('mirror')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 ${
            activeTab === 'mirror' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          <Cast size={13} /> Màn hình
        </button>
        <button
          onClick={() => setActiveTab('stealth')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 ${
            activeTab === 'stealth' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Camera size={13} /> Quay ngầm
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 ${
            activeTab === 'guide' ? 'bg-emerald-600 text-white' : 'text-slate-400'
          }`}
        >
          <HelpCircle size={13} /> HD Thao tác
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 lg:p-6 gap-6 items-start lg:items-stretch overflow-y-auto">
        
        {/* Left Side: Display Canvas / Screen Area */}
        <div className="flex-1 w-full flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-3xl p-4 relative min-h-[480px]">
          
          {/* Top Quick Bar for Screen Mode */}
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone size={14} className="text-blue-400" />
                {phoneState.streamSource === 'screen' ? 'Màn Hình Điện Thoại (Screen)' : 'Camera Mắt Kính (Lens)'}
              </span>
              {phoneState.isRecording && (
                <span className="flex items-center text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md animate-pulse">
                  <Video size={10} className="mr-1" /> REC
                </span>
              )}
            </div>

            {/* Layout Toggles */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewLayout('clone')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewLayout === 'clone' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Khung chuẩn tỉ lệ iPhone (Clone 1:1)"
              >
                Khung 1:1 (Clone)
              </button>
              <button
                onClick={() => setViewLayout('expand')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewLayout === 'expand' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mở rộng toàn màn hình PC (Expand Mode - Phù hợp học Zoom)"
              >
                Mở Rộng (Expand)
              </button>
              <button
                onClick={() => setIsRotated(!isRotated)}
                className={`p-1 rounded-lg text-slate-400 hover:text-white transition ${isRotated ? 'text-blue-400 bg-blue-500/20' : ''}`}
                title="Xoay ngang / dọc màn hình"
              >
                <RotateCw size={15} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                title="Toàn màn hình PC"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div className={`w-full flex items-center justify-center transition-all ${
            viewLayout === 'expand' ? 'h-full max-h-[75vh]' : 'max-w-[340px] aspect-[9/19]'
          }`}>
            
            {/* Phone Bezel or Cinema Screen Frame */}
            <div className={`relative w-full h-full bg-black shadow-2xl overflow-hidden flex items-center justify-center transition-all ${
              viewLayout === 'clone' 
                ? 'border-[10px] border-slate-800 rounded-[2.5rem] ring-1 ring-white/10' 
                : 'border-2 border-slate-700/80 rounded-2xl'
            } ${isRotated ? 'rotate-90' : ''}`}>
              
              {/* Dynamic Island on Clone Frame */}
              {viewLayout === 'clone' && !isRotated && (
                <div className="absolute top-0 inset-x-0 flex justify-center z-20 pointer-events-none">
                  <div className="w-28 h-6 bg-black rounded-b-2xl border-b border-x border-slate-800/80"></div>
                </div>
              )}

              {/* Video Stream Element */}
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center p-6 text-slate-500 text-center space-y-3">
                  {status.includes('Đang') || status.includes('Khởi tạo') ? (
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  ) : (
                    <PowerOff className="w-10 h-10 text-slate-700" />
                  )}
                  <p className="text-sm font-medium text-slate-400">{status}</p>
                  <p className="text-xs text-slate-600 max-w-xs">
                    Nhập mã kết nối hoặc chia sẻ màn hình từ điện thoại để bắt đầu truyền.
                  </p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full ${viewLayout === 'expand' ? 'object-contain' : 'object-cover'}`}
                />
              )}

              {/* Live Overlay Hint */}
              {isConnected && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-slate-300 font-mono flex items-center gap-1.5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {phoneState.streamSource === 'screen' ? 'DisplayMedia 1080p' : 'WebRTC P2P Lens'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Source Switcher Button underneath video */}
          {isConnected && (
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => handleCommand(phoneState.streamSource === 'screen' ? 'switch_to_camera' : 'switch_to_screen')}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
              >
                <Cast size={14} className="text-blue-400" />
                {phoneState.streamSource === 'screen' ? 'Chuyển sang xem Camera' : 'Chuyển sang Chia sẻ Màn hình Điện thoại'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Tab Panels */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4">
          
          {/* TAB 1: MIRROR & WORKSPACE HUB */}
          {activeTab === 'mirror' && (
            <div className="space-y-4">
              {/* Connection Box */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kết Nối Với Điện Thoại</h3>
                {!isConnected ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Nhập mã (Vd: SD-1234)"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 font-mono uppercase"
                    />
                    <button
                      onClick={() => connectToHost(roomId)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl font-semibold text-xs transition"
                    >
                      Kết Nối
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-400">Đã liên kết thiết bị</p>
                        <p className="text-[10px] text-slate-400 font-mono">{roomId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
                      title="Ngắt kết nối"
                    >
                      <PowerOff size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Screen Control Card */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chế Độ Hiển Thị Cho Học Tập / Zoom</h3>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setViewLayout('expand')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      viewLayout === 'expand' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Maximize2 size={18} className="text-blue-400" />
                    <span className="font-semibold">Phóng To Toàn Màn</span>
                    <span className="text-[10px] text-slate-400 text-center">Dành cho xem bài giảng / Zoom</span>
                  </button>

                  <button
                    onClick={() => setViewLayout('clone')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      viewLayout === 'clone' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <Smartphone size={18} className="text-emerald-400" />
                    <span className="font-semibold">Màn Hình Gốc 1:1</span>
                    <span className="text-[10px] text-slate-400 text-center">Giao diện chuẩn điện thoại</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEALTH CAMERA & REMOTE CAPTURE MODULE */}
          {activeTab === 'stealth' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Module Điều Khiển Ngầm
                  </h3>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">Bí mật</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCommand(phoneState.isRecording ? 'stop_record' : 'start_record')}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 border transition ${
                      phoneState.isRecording
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    {phoneState.isRecording ? <Square size={20} className="fill-current" /> : <Video size={20} />}
                    <span className="text-xs font-bold">{phoneState.isRecording ? 'Dừng Quay' : 'Bắt Đầu Quay'}</span>
                  </button>

                  <button
                    onClick={() => handleCommand('switch_camera')}
                    className="p-3 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 transition"
                  >
                    <RefreshCw size={20} />
                    <span className="text-xs font-bold">Đổi Camera Trước/Sau</span>
                  </button>

                  <button
                    onClick={() => handleCommand('black_screen')}
                    className="col-span-2 p-3 rounded-xl flex items-center justify-center gap-2 bg-black border border-slate-800 text-slate-300 hover:border-slate-600 transition text-xs font-medium"
                  >
                    <PowerOff size={16} />
                    <span>Làm Đen Màn Hình Điện Thoại (OLED Stealth)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GUIDE FOR 2-WAY TOUCH / MOUSE CONTROL */}
          {activeTab === 'guide' && (
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <Sparkles size={16} />
                <span>Giải pháp điều khiển Chuột/Phím từ PC tốt nhất</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Để có thể <strong>bấm, vuốt, gõ bàn phím và mở các ứng dụng như Zoom/iCSee trực tiếp từ PC</strong> (vượt ra ngoài giới hạn sandbox của trình duyệt Web), bạn nên sử dụng các công cụ chuẩn sau:
              </p>

              {/* iPhone Section */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  🍎 Dành cho iPhone (iOS):
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>
                    <strong className="text-slate-200">Wormhole / ApowerMirror:</strong> Cho phép dùng chuột PC để vuốt, chạm và gõ chữ trực tiếp lên iPhone cực mượt qua Bluetooth/Cáp.
                  </li>
                  <li>
                    <strong className="text-slate-200">AirPlay Receiver (LonelyScreen / AirServer):</strong> Chiếu màn hình iPhone lên PC không dây chất lượng cao để xem Zoom, học tập.
                  </li>
                </ul>
              </div>

              {/* Android Section */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  🤖 Dành cho Android:
                </p>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-emerald-400">Scrcpy (Miễn phí 100%, mã nguồn mở):</strong> Công cụ số 1 thế giới giúp hiển thị toàn bộ màn hình điện thoại trên PC, điều khiển full chuột, bàn phím, độ trễ 0ms!
                </p>
              </div>
            </div>
          )}

          {/* System Logs Console */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md flex-1 min-h-[140px] flex flex-col">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info size={13} /> Log Kết Nối Thời Gian Thực
            </h4>
            <div className="flex-1 bg-black/80 rounded-xl p-2.5 overflow-y-auto font-mono text-[11px] text-emerald-400 border border-slate-800 flex flex-col justify-end space-y-1">
              {logs.length === 0 ? (
                <span className="text-slate-600">Đang chờ sự kiện...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="leading-tight">{log}</div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
