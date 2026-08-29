import React, { useEffect, useRef } from 'react';
import { cameraRecorder } from '../../core/CameraRecorder';
import { useAppStore } from '../../store/useAppStore';
import { X, RefreshCw } from 'lucide-react';

export const PeekCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { peekPreviewActive, setPeekPreviewActive, cameraFacing, setCameraFacing } = useAppStore();

  useEffect(() => {
    if (peekPreviewActive && videoRef.current) {
      const stream = cameraRecorder.getStream();
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [peekPreviewActive]);

  if (!peekPreviewActive) return null;

  const handleToggleFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    await cameraRecorder.initialize(nextFacing);
    if (videoRef.current) {
      videoRef.current.srcObject = cameraRecorder.getStream();
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-black/90 p-1.5 rounded-xl border border-white/20 shadow-2xl backdrop-blur-md flex flex-col items-center">
      <div className="flex justify-between items-center w-full px-1 pb-1">
        <span className="text-[10px] text-gray-400 font-mono">GÓC QUAY</span>
        <div className="flex space-x-2">
          <button onClick={handleToggleFacing} className="text-gray-400 hover:text-white">
            <RefreshCw size={12} />
          </button>
          <button onClick={() => setPeekPreviewActive(false)} className="text-gray-400 hover:text-white">
            <X size={12} />
          </button>
        </div>
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-32 h-24 rounded-lg bg-black object-cover"
      />
    </div>
  );
};
