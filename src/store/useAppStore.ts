import { create } from 'zustand';

export type UIMode = 'lockscreen' | 'oled' | 'browser' | 'calculator' | 'vault';
export type DisguiseType = 'browser' | 'calculator';
export type StandbyStyle = 'lockscreen' | 'aod' | 'oled';
export type RecordingStatus = 'idle' | 'recording' | 'paused';
export type CameraFacing = 'environment' | 'user';
export type VideoQuality = '1080p' | '720p' | '480p';

export type PipStyle = 'oled' | 'clock' | 'stealth_icon';

interface AppState {
  uiMode: UIMode;
  disguiseType: DisguiseType;
  standbyStyle: StandbyStyle;
  recordingStatus: RecordingStatus;
  cameraFacing: CameraFacing;
  audioEnabled: boolean;
  videoQuality: VideoQuality;
  pinCode: string;             // Tier 1: Lockscreen unlock PIN (default: 1234)
  vaultPinCode: string;        // Tier 2: Pro Upgrade / Media Vault License PIN (default: 8888)
  carrierName: string;         // e.g. docomo, SoftBank, au, Rakuten
  favoriteAppPackage: string;  // e.g. com.xm.csee (iCSee)
  wakeLockAlwaysOn: boolean;
  peekPreviewActive: boolean;
  showSettings: boolean;
  showProUnlock: boolean;
  showAppLauncher: boolean;
  showRemoteHostModal: boolean;
  showPipModal: boolean;
  showScreenCurtainGuide: boolean;
  isFullscreen: boolean;
  recordingDuration: number;
  vaultCount: number;
  theme: 'light' | 'dark';

  // New features state
  autoChunkMinutes: number; // 0 = continuous, 5, 10, 15
  motionDetectionEnabled: boolean;
  motionSensitivity: number; // 10 to 80 (default 30)
  motionDetected: boolean;
  pipActive: boolean;
  pipStyle: PipStyle;

  setUIMode: (mode: UIMode) => void;
  setDisguiseType: (type: DisguiseType) => void;
  setStandbyStyle: (style: StandbyStyle) => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setCameraFacing: (facing: CameraFacing) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setVideoQuality: (quality: VideoQuality) => void;
  setPinCode: (pin: string) => void;
  setVaultPinCode: (pin: string) => void;
  setCarrierName: (carrier: string) => void;
  setFavoriteAppPackage: (pkg: string) => void;
  setWakeLockAlwaysOn: (enabled: boolean) => void;
  setPeekPreviewActive: (active: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowProUnlock: (show: boolean) => void;
  setShowAppLauncher: (show: boolean) => void;
  setShowRemoteHostModal: (show: boolean) => void;
  setShowPipModal: (show: boolean) => void;
  setShowScreenCurtainGuide: (show: boolean) => void;
  setIsFullscreen: (full: boolean) => void;
  setRecordingDuration: (duration: number | ((prev: number) => number)) => void;
  setVaultCount: (count: number) => void;

  setAutoChunkMinutes: (minutes: number) => void;
  setMotionDetectionEnabled: (enabled: boolean) => void;
  setMotionSensitivity: (sens: number) => void;
  setMotionDetected: (detected: boolean) => void;
  setPipActive: (active: boolean) => void;
  setPipStyle: (style: PipStyle) => void;
}

export const useAppStore = create<AppState>((set) => ({
  uiMode: 'lockscreen',
  disguiseType: 'browser',
  standbyStyle: 'lockscreen',
  recordingStatus: 'idle',
  cameraFacing: 'environment',
  audioEnabled: true,
  videoQuality: '1080p',
  pinCode: localStorage.getItem('sd_pin') || '1234',
  vaultPinCode: localStorage.getItem('sd_vault_pin') || '8888',
  carrierName: localStorage.getItem('sd_carrier') || 'docomo',
  favoriteAppPackage: localStorage.getItem('sd_fav_app') || 'com.xm.csee',
  wakeLockAlwaysOn: true,
  peekPreviewActive: false,
  showSettings: false,
  showProUnlock: false,
  showAppLauncher: false,
  showRemoteHostModal: false,
  showPipModal: false,
  showScreenCurtainGuide: false,
  isFullscreen: false,
  recordingDuration: 0,
  vaultCount: 0,
  theme: (localStorage.getItem('sd_theme') as 'light' | 'dark') || 'light',

  autoChunkMinutes: parseInt(localStorage.getItem('sd_autochunk') || '5', 10),
  motionDetectionEnabled: localStorage.getItem('sd_motion_enabled') === 'true',
  motionSensitivity: parseInt(localStorage.getItem('sd_motion_sens') || '30', 10),
  motionDetected: false,
  pipActive: false,
  pipStyle: (localStorage.getItem('sd_pip_style') as PipStyle) || 'oled',

  setUIMode: (mode) => set({ uiMode: mode }),
  setDisguiseType: (type) => set({ disguiseType: type }),
  setStandbyStyle: (style) => set({ standbyStyle: style }),
  setRecordingStatus: (status) => set({ recordingStatus: status }),
  setCameraFacing: (facing) => set({ cameraFacing: facing }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setVideoQuality: (quality) => set({ videoQuality: quality }),
  setPinCode: (pin) => {
    localStorage.setItem('sd_pin', pin);
    set({ pinCode: pin });
  },
  setVaultPinCode: (pin) => {
    localStorage.setItem('sd_vault_pin', pin);
    set({ vaultPinCode: pin });
  },
  setCarrierName: (carrier) => {
    localStorage.setItem('sd_carrier', carrier);
    set({ carrierName: carrier });
  },
  setFavoriteAppPackage: (pkg) => {
    localStorage.setItem('sd_fav_app', pkg);
    set({ favoriteAppPackage: pkg });
  },
  setWakeLockAlwaysOn: (enabled) => set({ wakeLockAlwaysOn: enabled }),
  setPeekPreviewActive: (active) => set({ peekPreviewActive: active }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowProUnlock: (show) => set({ showProUnlock: show }),
  setShowAppLauncher: (show) => set({ showAppLauncher: show }),
  setShowRemoteHostModal: (show) => set({ showRemoteHostModal: show }),
  setShowPipModal: (show) => set({ showPipModal: show }),
  setShowScreenCurtainGuide: (show) => set({ showScreenCurtainGuide: show }),
  setIsFullscreen: (full) => set({ isFullscreen: full }),
  setRecordingDuration: (duration) =>
    set((state) => ({
      recordingDuration: typeof duration === 'function' ? duration(state.recordingDuration) : duration,
    })),
  setVaultCount: (count) => set({ vaultCount: count }),

  setAutoChunkMinutes: (minutes) => {
    localStorage.setItem('sd_autochunk', minutes.toString());
    set({ autoChunkMinutes: minutes });
  },
  setMotionDetectionEnabled: (enabled) => {
    localStorage.setItem('sd_motion_enabled', enabled ? 'true' : 'false');
    set({ motionDetectionEnabled: enabled });
  },
  setMotionSensitivity: (sens) => {
    localStorage.setItem('sd_motion_sens', sens.toString());
    set({ motionSensitivity: sens });
  },
  setMotionDetected: (detected) => set({ motionDetected: detected }),
  setPipActive: (active) => set({ pipActive: active }),
  setPipStyle: (style) => {
    localStorage.setItem('sd_pip_style', style);
    set({ pipStyle: style });
  },
}));
