export interface PresetApp {
  id: string;
  name: string;
  packageName: string;
  iosScheme: string;
  iconColor: string;
  description: string;
}

export const PRESET_APPS: PresetApp[] = [
  {
    id: 'icsee',
    name: 'iCSee',
    packageName: 'com.xm.csee',
    iosScheme: 'icsee://',
    iconColor: 'bg-emerald-600',
    description: 'Ứng dụng quản lý camera iCSee (Xiongmai)',
  },
  {
    id: 'icsee-pro',
    name: 'iCSee Pro',
    packageName: 'com.xm.csee.pro',
    iosScheme: 'icseepro://',
    iconColor: 'bg-teal-600',
    description: 'Bản chuyên nghiệp iCSee Pro',
  },
  {
    id: 'xmeye',
    name: 'XMEye / XMEye Pro',
    packageName: 'com.mobile.myeye',
    iosScheme: 'xmeye://',
    iconColor: 'bg-blue-600',
    description: 'Hệ sinh thái Xiongmai P2P',
  },
  {
    id: 'yoosee',
    name: 'Yoosee',
    packageName: 'com.yoosee',
    iosScheme: 'yoosee://',
    iconColor: 'bg-orange-600',
    description: 'Camera IP Yoosee Cloud',
  },
  {
    id: 'ezviz',
    name: 'EZVIZ',
    packageName: 'com.ezviz',
    iosScheme: 'ezviz://',
    iconColor: 'bg-indigo-600',
    description: 'Camera Ezviz / Hikvision',
  },
  {
    id: 'system-cam',
    name: 'Camera Hệ Thống',
    packageName: 'com.android.camera',
    iosScheme: 'camera://',
    iconColor: 'bg-rose-600',
    description: 'Ứng dụng máy ảnh gốc của điện thoại',
  }
];

class AppLauncherService {
  public launch(pkgName: string, iosScheme: string = ''): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS && iosScheme) {
      // iOS URL Scheme launch
      window.location.href = iosScheme;
      setTimeout(() => {
        // Fallback or notice
      }, 1500);
      return;
    }

    // Android Intent URL launch
    // Standard intent format to launch any Android application package
    const intentUrl = `intent://#Intent;package=${encodeURIComponent(pkgName)};scheme=android-app;end`;
    
    // Try opening intent
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = intentUrl;
    document.body.appendChild(iframe);
    
    // Also try window.location for modern Chrome
    window.location.href = intentUrl;

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }
}

export const appLauncherService = new AppLauncherService();
