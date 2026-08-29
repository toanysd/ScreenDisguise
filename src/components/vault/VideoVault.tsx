import React, { useState, useEffect } from 'react';
import { indexedDBVault, VideoRecord } from '../../core/IndexedDBVault';
import { useAppStore } from '../../store/useAppStore';
import { 
  ArrowLeft, Trash2, Download, Play, Video, 
  HardDrive, AlertTriangle, X 
} from 'lucide-react';

export const VideoVault: React.FC = () => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setUIMode, disguiseType, setVaultCount } = useAppStore();

  const loadVideos = async () => {
    setLoading(true);
    try {
      const records = await indexedDBVault.getAllVideos();
      setVideos(records);
      setVaultCount(records.length);
    } catch (err) {
      console.error('Error loading vault videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handlePlay = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setActiveVideoUrl(url);
  };

  const handleClosePlayer = () => {
    if (activeVideoUrl) {
      URL.revokeObjectURL(activeVideoUrl);
      setActiveVideoUrl(null);
    }
  };

  const handleDownload = (video: VideoRecord) => {
    const url = URL.createObjectURL(video.blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    const extension = video.mimeType.includes('mp4') ? 'mp4' : 'webm';
    a.download = `DisguiseRec_${video.id}.${extension}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xác nhận xóa video này?')) {
      await indexedDBVault.deleteVideo(id);
      await loadVideos();
    }
  };

  const handleClearAll = async () => {
    if (confirm('Xác nhận xóa TOÀN BỘ video trong kho bí mật? Hành động này không thể hoàn tác!')) {
      await indexedDBVault.clearAll();
      await loadVideos();
    }
  };

  const totalSize = videos.reduce((acc, v) => acc + v.size, 0);

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Vault Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 pt-4 pb-3 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setUIMode(disguiseType)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center">
              <span>Kho Video Bí Mật</span>
              <span className="ml-2 text-xs font-mono font-normal px-2 py-0.5 bg-blue-900/50 text-blue-300 border border-blue-700/50 rounded-full">
                {videos.length} video
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
              <HardDrive size={11} className="mr-1" />
              Tổng dung lượng: {formatSize(totalSize)}
            </p>
          </div>
        </div>

        {videos.length > 0 && (
          <button
            onClick={handleClearAll}
            className="p-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/50 text-xs flex items-center"
            title="Xóa tất cả"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Video List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-slate-500 text-xs">
            Đang tải dữ liệu...
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-3">
            <Video size={42} className="opacity-30" />
            <p className="text-sm">Chưa có bản ghi nào trong kho</p>
            <p className="text-xs text-slate-600 text-center max-w-xs">
              Sử dụng cử chỉ chạm 3 lần hoặc nút quay trong bảng điều khiển để ghi hình ngầm.
            </p>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm hover:border-slate-700 transition"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div 
                  onClick={() => handlePlay(video.blob)}
                  className="w-12 h-12 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 cursor-pointer hover:scale-105 active:scale-95 transition shrink-0"
                >
                  <Play size={20} className="ml-0.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {formatDate(video.timestamp)}
                  </h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      {formatDuration(video.duration)}
                    </span>
                    <span>•</span>
                    <span>{formatSize(video.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => handleDownload(video)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition"
                  title="Tải về máy"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-400 active:scale-95 transition"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4 animate-fade-in">
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-slate-400">Xem lại bản ghi</span>
            <button
              onClick={handleClosePlayer}
              className="p-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <video
              src={activeVideoUrl}
              controls
              autoPlay
              playsInline
              className="max-h-full max-w-full rounded-lg shadow-2xl"
            />
          </div>

          <div className="py-2 text-center text-xs text-slate-500">
            Video được lưu an toàn trong bộ nhớ máy chủ cục bộ (IndexedDB)
          </div>
        </div>
      )}
    </div>
  );
};
