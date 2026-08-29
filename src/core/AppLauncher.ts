export const PRESET_APPS = [
  { id: 'icsee', name: 'iCSee', packageName: 'com.xm.csee', iosScheme: 'icsee://', iconColor: 'bg-blue-500' },
  { id: 'ezviz', name: 'EZVIZ', packageName: 'com.ezviz.m', iosScheme: 'ezviz://', iconColor: 'bg-emerald-500' },
  { id: 'imou', name: 'Imou Life', packageName: 'com.mm.android.smartlifeiot', iosScheme: 'imou://', iconColor: 'bg-orange-500' },
  { id: 'yoosee', name: 'Yoosee', packageName: 'com.yoosee', iosScheme: 'yoosee://', iconColor: 'bg-indigo-500' },
  { id: 'kasa', name: 'Kasa Smart', packageName: 'com.tplink.kasa_android', iosScheme: 'kasa://', iconColor: 'bg-teal-500' },
  { id: 'tapo', name: 'TP-Link Tapo', packageName: 'com.tplink.iot', iosScheme: 'tapo://', iconColor: 'bg-cyan-500' }
];

class AppLauncherService {
  public launch(pkgName: string, iosScheme: string = '', appStoreUrl: string = ''): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // iOS handling: try custom schemes first
      const schemesToTry = [
        iosScheme,
        'icsee://',
        'com.xm.csee://',
        'xmeye://',
        'shortcuts://run-shortcut?name=iCSee',
        'shortcuts://'
      ].filter(Boolean);

      const targetScheme = schemesToTry[0];
      const link = document.createElement('a');
      link.href = targetScheme;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // If app is not installed, provide option to open in App Store
      setTimeout(() => {
        if (appStoreUrl) {
          window.location.href = appStoreUrl;
        }
      }, 1800);
      return;
    }

    // Android handling: launch via standard Android Intent
    const intentUrl = `intent://#Intent;package=${encodeURIComponent(pkgName)};action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`;
    
    const link = document.createElement('a');
    link.href = intentUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const appLauncherService = new AppLauncherService();
