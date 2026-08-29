class FullscreenManager {
  public isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  public async request(): Promise<boolean> {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen({ navigationUI: 'hide' }).catch(() => docEl.requestFullscreen());
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      return true;
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      return false;
    }
  }

  public async exit(): Promise<void> {
    try {
      const doc = document as any;
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen exit failed:', err);
    }
  }

  public toggle(): void {
    if (this.isFullscreen()) {
      this.exit();
    } else {
      this.request();
    }
  }
}

export const fullscreenManager = new FullscreenManager();
