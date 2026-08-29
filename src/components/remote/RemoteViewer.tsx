import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, RefreshCw, Square, Video, Monitor, PowerOff, Smartphone, 
  Info, Loader2, Maximize2, Minimize2, RotateCw, Cast, Tv, 
  HelpCircle, ExternalLink, ShieldCheck, Sparkles, Wifi, Search,
  Radio, ArrowRight, ArrowLeft, KeyRound, Laptop, Sun, Moon
} from 'lucide-react';
import { remoteStreamService } from '../../core/RemoteStreamService';
import { useAppStore } from '../../store/useAppStore';

interface RemoteViewerProps {
  initialRoomId: string;
  onBackToPhone?: () => void;
}

export function RemoteViewer({ initialRoomId, onBackToPhone }: RemoteViewerProps) {
  const { theme, setTheme } = useAppStore();
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
  const [viewLayout, setViewLayout] = useState<'clone' | 'expand'>('expand');
  const [isRotated, setIsRotated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  // Connection Modal States
  const [showConnectModal, setShowConnectModal] = useState(!initialRoomId);
  const [connectTab, setConnectTab] = useState<'code' | 'wifi' | 'ip'>('code');
  const [isScanningWifi, setIsScanningWifi] = useState(false);
  const [foundDevices, setFoundDevices] = useState<Array<{ id: string; name: string; ip: string; latency: string }>>([]);
  const [localIp, setLocalIp] = useState('192.168.1.');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook to ensure video element is always linked with mediaStream
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(e => {
        console.warn('Auto-play error:', e);
        addLog(`Đang thử phát video: ${e.message}`);
      });
    }
  }, [mediaStream, isConnected, viewLayout]);

  const addLog = (msg: string) => {
    setLogs(prev => {
      const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
      if (newLogs.length > 6) return newLogs.slice(newLogs.length - 6);
      return newLogs;
    });
  };

  const handleScanWifi = () => {
    setIsScanningWifi(true);
    setFoundDevices([]);
    addLog('Bắt đầu quét mạng Wi-Fi nội bộ tìm thiết bị...');
    
    setTimeout(() => {
      setIsScanningWifi(false);
      const mockDevices = [
        { id: 'SD-8492', name: 'iPhone (ScreenDisguise)', ip: '192.168.1.15', latency: '4ms' },
        { id: 'SD-1044', name: 'Android Device (Camera Ngầm)', ip: '192.168.1.28', latency: '6ms' }
      ];
      setFoundDevices(mockDevices);
      addLog(`Đã tìm thấy ${mockDevices.length} thiết bị ScreenDisguise trong cùng mạng Wi-Fi.`);
    }, 2000);
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
    if (!id || !id.trim()) return;
    setShowConnectModal(false);
    setStatus('Đang kết nối PeerJS...');
    addLog(`Đang kết nối tới ID: ${id}...`);
    
    remoteStreamService.connectAsViewer(id, (stream) => {
      addLog('Đã nhận luồng trực tiếp từ Điện thoại!');
      setMediaStream(stream);
      setIsConnected(true);
      setStatus('Đã kết nối trực tiếp');
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

  const isLight = theme === 'light';

  return (
    <div 
      className={`min-h-screen ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans select-none transition-colors duration-200`} 
      ref={containerRef}
    >
      {/* Header Bar */}
      <header className={`${isLight ? 'bg-white/95 border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-md'} backdrop-blur-md border-b px-5 py-3 flex items-center justify-between sticky top-0 z-30`}>
        <div className="flex items-center space-x-3">
          {onBackToPhone && (
            <button 
              onClick={onBackToPhone}
              className={`p-1.5 rounded-xl border transition ${isLight ? 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
              title="Quay lại giao diện Điện Thoại"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
            <Tv size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Trạm Điều Khiển PC Remote Hub
              </h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-500 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">Pro</span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Nhân đôi & Mở rộng không gian làm việc màn hình lớn</p>
          </div>
        </div>

        {/* Action Controls, Theme Toggle & Connect Button */}
        <div className="flex items-center gap-2.5">
          
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className={`p-2 rounded-xl border transition shadow-sm flex items-center gap-1.5 text-xs font-semibold ${
              isLight 
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750'
            }`}
            title={isLight ? 'Chuyển sang Giao diện Tối (Dark)' : 'Chuyển sang Giao diện Sáng (Light)'}
          >
            {isLight ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-amber-400" />}
            <span className="hidden sm:inline">{isLight ? 'Giao Diện Sáng' : 'Giao Diện Tối'}</span>
          </button>

          {/* Main Connect Button */}
          <button
            onClick={() => setShowConnectModal(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow active:scale-95 ${
              isConnected 
                ? (isLight ? 'bg-slate-200 border border-slate-300 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750')
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white animate-pulse'
            }`}
          >
            <Wifi size={14} />
            <span>{isConnected ? `Đổi Thiết Bị (${roomId})` : '🔗 Kết Nối Điện Thoại'}</span>
          </button>

          {/* Status Indicator */}
          <div className={`flex items-center space-x-2 rounded-full px-3 py-1.5 border ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-medium">
              {isConnected ? (phoneState.streamSource === 'screen' ? 'Screen Cast HD' : 'Camera Live') : 'Chưa kết nối'}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className={`flex md:hidden border-b p-2 gap-1 justify-around ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('mirror')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 ${
            activeTab === 'mirror' ? 'bg-blue-600 text-white' : (isLight ? 'text-slate-600' : 'text-slate-400')
          }`}
        >
          <Cast size={13} /> Màn hình
        </button>
        <button
          onClick={() => setActiveTab('stealth')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 ${
            activeTab === 'stealth' ? 'bg-indigo-600 text-white' : (isLight ? 'text-slate-600' : 'text-slate-400')
          }`}
        >
          <Camera size={13} /> Quay ngầm
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex justify-center items-center gap-1 ${
            activeTab === 'guide' ? 'bg-emerald-600 text-white' : (isLight ? 'text-slate-600' : 'text-slate-400')
          }`}
        >
          <HelpCircle size={13} /> HD Thao tác
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 lg:p-6 gap-6 items-start lg:items-stretch overflow-y-auto">
        
        {/* Left Side: Display Canvas / Screen Area */}
        <div className={`flex-1 w-full flex flex-col items-center justify-center border rounded-3xl p-4 relative min-h-[480px] transition ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/40 border-slate-800'
        }`}>
          
          {/* Top Quick Bar for Screen Mode */}
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <Smartphone size={14} className="text-blue-500" />
                {phoneState.streamSource === 'screen' ? 'Màn Hình Điện Thoại (Screen)' : 'Camera Mắt Kính (Lens)'}
              </span>
              {phoneState.isRecording && (
                <span className="flex items-center text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md animate-pulse">
                  <Video size={10} className="mr-1" /> REC
                </span>
              )}
            </div>

            {/* Layout Toggles */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700'}`}>
              <button
                onClick={() => setViewLayout('clone')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewLayout === 'clone' ? 'bg-blue-600 text-white shadow' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
                title="Khung chuẩn tỉ lệ điện thoại (Clone 1:1)"
              >
                Khung 1:1 (Clone)
              </button>
              <button
                onClick={() => setViewLayout('expand')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  viewLayout === 'expand' ? 'bg-blue-600 text-white shadow' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
                title="Mở rộng toàn màn hình PC (Expand Mode - Phù hợp học Zoom)"
              >
                Mở Rộng (Expand)
              </button>
              <button
                onClick={() => setIsRotated(!isRotated)}
                className={`p-1 rounded-lg transition ${isRotated ? 'text-blue-500 bg-blue-500/20' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')}`}
                title="Xoay ngang / dọc màn hình"
              >
                <RotateCw size={15} />
              </button>
              <button
                onClick={toggleFullscreen}
                className={`p-1 rounded-lg transition ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                title="Toàn màn hình PC"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div className={`w-full flex items-center justify-center transition-all ${
            viewLayout === 'expand' ? 'w-full h-[620px] max-h-[82vh]' : 'max-w-[340px] aspect-[9/19]'
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
                  <p className="text-xs text-slate-500 max-w-xs">
                    Bấm nút <strong>[🔗 Kết Nối Điện Thoại]</strong> hoặc quét mã trên điện thoại để bắt đầu truyền.
                  </p>
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
                  >
                    Mở Bảng Ghép Nối Thiết Bị
                  </button>
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
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95 ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200'
                }`}
              >
                <Cast size={14} className="text-blue-500" />
                {phoneState.streamSource === 'screen' ? 'Chuyển sang xem Camera' : 'Chuyển sang Chia sẻ Màn hình Điện thoại'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Control Panels & Modules */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          
          {/* Module Selector Tabs (Desktop view) */}
          <div className={`grid grid-cols-3 p-1 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-md'}`}>
            <button
              onClick={() => setActiveTab('mirror')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'mirror' ? 'bg-blue-600 text-white shadow' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <Cast size={14} /> Màn Hình
            </button>
            <button
              onClick={() => setActiveTab('stealth')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'stealth' ? 'bg-indigo-600 text-white shadow' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <Camera size={14} /> Quay Ngầm
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'guide' ? 'bg-emerald-600 text-white shadow' : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <Sparkles size={14} /> Giải Pháp
            </button>
          </div>

          {/* TAB 1: SCREEN MIRROR & EXPAND CONTROLS */}
          {activeTab === 'mirror' && (
            <div className={`rounded-2xl p-4 border space-y-4 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-blue-500" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    Không Gian Mở Rộng PC
                  </h3>
                </div>
                <span className="text-[11px] text-blue-500 font-semibold">Tự động thích ứng</span>
              </div>

              <div className="space-y-2">
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Chế độ tối ưu hóa cho phép học tập Zoom, đọc tài liệu từ điện thoại trên màn hình PC lớn:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setViewLayout('expand')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      viewLayout === 'expand' 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-600 font-bold shadow-sm' 
                        : (isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750')
                    }`}
                  >
                    <Maximize2 size={18} className="text-blue-500" />
                    <span className="text-xs font-semibold">Phóng To Toàn Màn</span>
                    <span className="text-[10px] text-slate-400 text-center">Dành cho Zoom, tài liệu</span>
                  </button>

                  <button
                    onClick={() => setViewLayout('clone')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      viewLayout === 'clone' 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-600 font-bold shadow-sm' 
                        : (isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750')
                    }`}
                  >
                    <Smartphone size={18} className="text-emerald-500" />
                    <span className="text-xs font-semibold">Màn Hình Gốc 1:1</span>
                    <span className="text-[10px] text-slate-400 text-center">Giao diện chuẩn phone</span>
                  </button>
                </div>
              </div>

              <div className={`p-3 rounded-xl border space-y-1.5 ${isLight ? 'bg-blue-50/60 border-blue-200' : 'bg-blue-950/20 border-blue-900/40'}`}>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <ShieldCheck size={14} />
                  <span>Mẹo Chia Sẻ Màn Hình Android:</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Khi bạn bấm <strong>Chia sẻ màn hình</strong> trên Android, hãy chuyển qua ứng dụng Zoom, YouTube hoặc bài học trên điện thoại. Mọi thao tác sẽ lập tức phóng to sắc nét trên PC!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: STEALTH CAMERA & REMOTE RECORDING */}
          {activeTab === 'stealth' && (
            <div className={`rounded-2xl p-4 border space-y-4 shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-indigo-500" />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    Camera Giám Sát Bí Mật
                  </h3>
                </div>
                <span className="text-[11px] text-indigo-500 font-semibold">P2P Mã Hóa</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCommand(phoneState.isRecording ? 'stop_record' : 'start_record')}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition ${
                      phoneState.isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {phoneState.isRecording ? <Square size={20} className="fill-current" /> : <Video size={20} />}
                    <span className="text-xs font-bold">{phoneState.isRecording ? 'Dừng Quay' : 'Bắt Đầu Quay'}</span>
                  </button>

                  <button
                    onClick={() => handleCommand('switch_camera')}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 border transition ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                    }`}
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
            <div className={`rounded-2xl p-4 border space-y-3 text-xs leading-relaxed shadow-sm ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 text-emerald-500 font-bold border-b pb-2 border-slate-200 dark:border-slate-800">
                <Sparkles size={16} />
                <span>Giải pháp điều khiển Chuột/Phím từ PC tốt nhất</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Để có thể <strong>bấm, vuốt, gõ bàn phím và mở các ứng dụng như Zoom/PalFish trực tiếp từ PC</strong>:
              </p>

              <div className={`p-3 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <p className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  🤖 Dành cho Android:
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>Scrcpy (Miễn phí 100%):</strong> Chiếu toàn bộ màn hình, điều khiển chuột, gõ phím, mở app với độ trễ 0ms.
                </p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <p className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  💻 Dành cho Máy Tính (Học PalFish):
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>LDPlayer 9:</strong> Chạy trực tiếp PalFish trên PC với Webcam & Mic, thao tác chuột cực mượt.
                </p>
              </div>
            </div>
          )}

          {/* System Logs Console */}
          <div className={`rounded-2xl p-4 border shadow-sm flex-1 min-h-[140px] flex flex-col ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info size={13} /> Log Kết Nối Thời Gian Thực
            </h4>
            <div className="flex-1 bg-slate-950 rounded-xl p-2.5 overflow-y-auto font-mono text-[11px] text-emerald-400 border border-slate-800 flex flex-col justify-end space-y-1">
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

      {/* PROMINENT CONNECTION MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-4 p-6 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Wifi size={20} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Kết Nối Với Điện Thoại</h3>
                  <p className="text-[11px] text-slate-500">Chọn phương thức ghép nối nhanh</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConnectModal(false)}
                className={`text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}
              >
                ✕
              </button>
            </div>

            {/* Connection Method Tabs */}
            <div className={`grid grid-cols-3 p-1 rounded-xl border text-xs ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <button
                onClick={() => setConnectTab('code')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition ${
                  connectTab === 'code' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <KeyRound size={13} /> Nhập Mã
              </button>
              <button
                onClick={() => { setConnectTab('wifi'); handleScanWifi(); }}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition ${
                  connectTab === 'wifi' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Search size={13} /> Quét Wi-Fi
              </button>
              <button
                onClick={() => setConnectTab('ip')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition ${
                  connectTab === 'ip' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Laptop size={13} /> IP Cục Bộ
              </button>
            </div>

            {/* Tab 1: Code Input */}
            {connectTab === 'code' && (
              <div className="space-y-4 py-2">
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Nhập mã kết nối hiển thị trên điện thoại:
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="VD: SD-3685"
                    className={`w-full border rounded-2xl px-4 py-3 text-base font-mono uppercase tracking-widest text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <button
                  onClick={() => connectToHost(roomId)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:opacity-95 transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Bắt Đầu Ghép Nối Ngay</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Tab 2: Wi-Fi Auto-Discovery */}
            {connectTab === 'wifi' && (
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Thiết bị cùng mạng Wi-Fi:</span>
                  <button 
                    onClick={handleScanWifi} 
                    className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw size={11} className={isScanningWifi ? 'animate-spin' : ''} />
                    <span>Quét lại</span>
                  </button>
                </div>

                {isScanningWifi ? (
                  <div className={`py-8 flex flex-col items-center justify-center space-y-2 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <span className="text-xs font-medium">Đang tự nhận diện điện thoại trong Wi-Fi...</span>
                  </div>
                ) : foundDevices.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {foundDevices.map((dev) => (
                      <div 
                        key={dev.id}
                        onClick={() => { setRoomId(dev.id); connectToHost(dev.id); }}
                        className={`border p-3 rounded-2xl flex items-center justify-between cursor-pointer transition group ${
                          isLight 
                            ? 'bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-400' 
                            : 'bg-slate-950 hover:bg-blue-950/40 border-slate-800 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
                            <Smartphone size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold group-hover:text-blue-500">{dev.name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">Mã: {dev.id} • IP: {dev.ip}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow">
                          Kết Nối
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`py-6 text-center text-xs rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    Không tìm thấy thiết bị nào đang mở ScreenDisguise. Hãy đảm bảo cả 2 thiết bị cùng kết nối 1 mạng Wi-Fi.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Local IP / Scrcpy WebSocket */}
            {connectTab === 'ip' && (
              <div className="space-y-4 py-2">
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Nhập địa chỉ IP nội bộ của điện thoại (Port 8080):
                  </label>
                  <input
                    type="text"
                    value={localIp}
                    onChange={(e) => setLocalIp(e.target.value)}
                    placeholder="VD: 192.168.1.50:8080"
                    className={`w-full border rounded-2xl px-4 py-3 text-sm font-mono outline-none focus:border-blue-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <button
                  onClick={() => connectToHost(localIp)}
                  className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-blue-500 transition flex items-center justify-center gap-2"
                >
                  <span>Kết Nối Trực Tiếp Qua IP</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
