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
