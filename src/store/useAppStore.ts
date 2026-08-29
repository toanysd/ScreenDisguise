import { create } from 'zustand';

export type UIMode = 'lockscreen' | 'oled' | 'browser' | 'calculator' | 'vault';
export type DisguiseType = 'browser' | 'calculator';
export type StandbyStyle = 'lockscreen' | 'aod' | 'oled';
export type RecordingStatus = 'idle' | 'recording' | 'paused';
export type CameraFacing = 'environment' | 'user';
export type VideoQuality = '1080p' | '720p' | '480p';

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
  isFullscreen: boolean;
  recordingDuration: number;
  vaultCount: number;
  theme: 'light' | 'dark';

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
  setIsFullscreen: (full: boolean) => void;
  setRecordingDuration: (duration: number | ((prev: number) => number)) => void;
  setVaultCount: (count: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
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
  isFullscreen: false,
  recordingDuration: 0,
  vaultCount: 0,
  theme: (localStorage.getItem('sd_theme') as 'light' | 'dark') || 'light',

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
  setIsFullscreen: (full) => set({ isFullscreen: full }),
  setRecordingDuration: (duration) =>
    set((state) => ({
      recordingDuration: typeof duration === 'function' ? duration(state.recordingDuration) : duration,
    })),
  setVaultCount: (count) => set({ vaultCount: count }),
  setTheme: (theme) => {
    localStorage.setItem('sd_theme', theme);
    set({ theme });
  },
}));
