import { create } from 'zustand';

export type UIMode = 'lockscreen' | 'oled' | 'browser' | 'calculator' | 'vault';
export type DisguiseType = 'browser' | 'calculator';
export type RecordingStatus = 'idle' | 'recording' | 'paused';
export type CameraFacing = 'environment' | 'user';
export type VideoQuality = '1080p' | '720p' | '480p';

interface AppState {
  uiMode: UIMode;
  disguiseType: DisguiseType;
  recordingStatus: RecordingStatus;
  cameraFacing: CameraFacing;
  audioEnabled: boolean;
  videoQuality: VideoQuality;
  pinCode: string;
  wakeLockAlwaysOn: boolean;
  peekPreviewActive: boolean;
  showSettings: boolean;
  recordingDuration: number;
  vaultCount: number;

  setUIMode: (mode: UIMode) => void;
  setDisguiseType: (type: DisguiseType) => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setCameraFacing: (facing: CameraFacing) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVideoQuality: (quality: VideoQuality) => void;
  setPinCode: (pin: string) => void;
  setWakeLockAlwaysOn: (enabled: boolean) => void;
  setPeekPreviewActive: (active: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setRecordingDuration: (duration: number | ((prev: number) => number)) => void;
  setVaultCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  uiMode: 'lockscreen',
  disguiseType: 'browser',
  recordingStatus: 'idle',
  cameraFacing: 'environment',
  audioEnabled: true,
  videoQuality: '1080p',
  pinCode: localStorage.getItem('sd_pin') || '1234',
  wakeLockAlwaysOn: true,
  peekPreviewActive: false,
  showSettings: false,
  recordingDuration: 0,
  vaultCount: 0,

  setUIMode: (mode) => set({ uiMode: mode }),
  setDisguiseType: (type) => set({ disguiseType: type }),
  setRecordingStatus: (status) => set({ recordingStatus: status }),
  setCameraFacing: (facing) => set({ cameraFacing: facing }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setVideoQuality: (quality) => set({ videoQuality: quality }),
  setPinCode: (pin) => {
    localStorage.setItem('sd_pin', pin);
    set({ pinCode: pin });
  },
  setWakeLockAlwaysOn: (enabled) => set({ wakeLockAlwaysOn: enabled }),
  setPeekPreviewActive: (active) => set({ peekPreviewActive: active }),
  setShowSettings: (show) => set({ showSettings: show }),
  setRecordingDuration: (duration) =>
    set((state) => ({
      recordingDuration: typeof duration === 'function' ? duration(state.recordingDuration) : duration,
    })),
  setVaultCount: (count) => set({ vaultCount: count }),
}));
