import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const OledBlack: React.FC = () => {
  const { setUIMode, recordingStatus } = useAppStore();
  const [showExitHint, setShowExitHint] = useState(false);

  // Tap counter for exit
  let tapCount = 0;
  let tapTimeout: any = null;

  const handleScreenTap = () => {
    tapCount++;
    if (tapCount === 1) {
      setShowExitHint(true);
      setTimeout(() => setShowExitHint(false), 2000);
    }
    if (tapCount >= 2) {
      setUIMode('lockscreen');
    }
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => {
      tapCount = 0;
    }, 800);
  };

  return (
    <div
      onClick={handleScreenTap}
      className="fixed inset-0 bg-black z-50 cursor-none select-none flex items-center justify-center"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Invisible ultra faint status or hint on tap */}
      {showExitHint && (
        <div className="text-white/20 text-xs text-center pointer-events-none select-none transition-opacity">
          Chạm 2 lần để quay lại màn hình khóa
        </div>
      )}

      {/* Micro dot indicator if recording (almost imperceptible) */}
      {recordingStatus === 'recording' && (
        <div className="fixed bottom-1 right-1 w-1.5 h-1.5 bg-red-900/30 rounded-full pointer-events-none" />
      )}
    </div>
  );
};
