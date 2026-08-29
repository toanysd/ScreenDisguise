class WakeLockManager {
  private sentinel: any = null;
  private isRequested = false;

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isRequested) {
        this.request();
      }
    });
  }

  public async request(): Promise<boolean> {
    this.isRequested = true;
    if (!('wakeLock' in navigator)) {
      console.warn('Screen Wake Lock API not supported on this browser.');
      return false;
    }
    try {
      if (!this.sentinel || this.sentinel.released) {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null;
        });
      }
      return true;
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      return false;
    }
  }

  public release(): void {
    this.isRequested = false;
    if (this.sentinel && !this.sentinel.released) {
      this.sentinel.release().catch(() => {});
      this.sentinel = null;
    }
  }
}

export const wakeLockManager = new WakeLockManager();
