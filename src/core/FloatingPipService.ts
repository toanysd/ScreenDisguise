import { useAppStore, PipStyle } from '../store/useAppStore';

class FloatingPipService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private stream: MediaStream | null = null;
  private isRendering: boolean = false;

  constructor() {
    this.initElements();
  }

  private initElements() {
    if (typeof document === 'undefined') return;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 360;
      this.canvas.height = 200;
      this.canvas.style.display = 'none';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }

    if (!this.video) {
      this.video = document.createElement('video');
      this.video.style.display = 'none';
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.setAttribute('playsinline', 'true');
      this.video.setAttribute('webkit-playsinline', 'true');
      document.body.appendChild(this.video);

      this.video.addEventListener('enterpictureinpicture', () => {
        useAppStore.getState().setPipActive(true);
      });

      this.video.addEventListener('leavepictureinpicture', () => {
        useAppStore.getState().setPipActive(false);
        this.stopRendering();
      });

      // iOS Safari presentationmode change
      (this.video as any).addEventListener?.('webkitpresentationmodechanged', () => {
        const mode = (this.video as any).webkitPresentationMode;
        if (mode === 'picture-in-picture') {
          useAppStore.getState().setPipActive(true);
        } else {
          useAppStore.getState().setPipActive(false);
          this.stopRendering();
        }
      });
    }
  }

  public isSupported(): boolean {
    if (typeof document === 'undefined') return false;
    const standardSupport = 'pictureInPictureEnabled' in document && (document as any).pictureInPictureEnabled;
    const iosSupport = this.video && typeof (this.video as any).webkitSupportsPresentationMode === 'function' &&
      (this.video as any).webkitSupportsPresentationMode('picture-in-picture');
    return Boolean(standardSupport || iosSupport);
  }

  public async startPip(style: PipStyle = 'oled'): Promise<boolean> {
    this.initElements();
    if (!this.canvas || !this.video || !this.ctx) return false;

    useAppStore.getState().setPipStyle(style);
    this.startRendering(style);

    try {
      // Capture canvas stream at 10 FPS to save CPU and battery
      if (!this.stream) {
        if (typeof (this.canvas as any).captureStream === 'function') {
          this.stream = (this.canvas as any).captureStream(10);
        } else if (typeof (this.canvas as any).mozCaptureStream === 'function') {
          this.stream = (this.canvas as any).mozCaptureStream(10);
        }
      }

      if (this.stream) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }

      // Request Picture in Picture
      if ('requestPictureInPicture' in this.video) {
        await this.video.requestPictureInPicture();
        useAppStore.getState().setPipActive(true);
        return true;
      } else if (typeof (this.video as any).webkitSetPresentationMode === 'function') {
        (this.video as any).webkitSetPresentationMode('picture-in-picture');
        useAppStore.getState().setPipActive(true);
        return true;
      } else {
        alert('Trình duyệt của bạn chưa hỗ trợ tính năng Picture-in-Picture (PiP). Vui lòng thử mở trên Safari iOS 14+ hoặc Chrome.');
        return false;
      }
    } catch (err: any) {
      console.warn('Cannot enter PiP mode:', err);
      alert(`Không thể kích hoạt cửa sổ PiP nổi: ${err?.message || err}. Hãy đảm bảo bạn bấm trực tiếp vào nút.`);
      this.stopRendering();
      return false;
    }
  }

  public async stopPip(): Promise<void> {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (this.video && typeof (this.video as any).webkitSetPresentationMode === 'function') {
        (this.video as any).webkitSetPresentationMode('inline');
      }
    } catch (err) {
      console.warn('Error exiting PiP:', err);
    } finally {
      useAppStore.getState().setPipActive(false);
      this.stopRendering();
    }
  }

  public togglePip(style: PipStyle = 'oled'): Promise<boolean | void> {
    if (useAppStore.getState().pipActive) {
      return this.stopPip();
    } else {
      return this.startPip(style);
    }
  }

  private startRendering(style: PipStyle) {
    this.isRendering = true;

    const renderLoop = () => {
      if (!this.isRendering || !this.canvas || !this.ctx) return;

      const w = this.canvas.width;
      const h = this.canvas.height;

      // Draw background
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, w, h);

      if (style === 'clock') {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });

        this.ctx.fillStyle = '#f1f5f9';
        this.ctx.font = '300 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(timeStr, w / 2, h / 2 - 12);

        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '400 16px -apple-system, BlinkMacSystemFont, sans-serif';
        this.ctx.fillText(dateStr, w / 2, h / 2 + 32);
      } else if (style === 'stealth_icon') {
        // Ultra subtle dark gray battery or dot
        this.ctx.fillStyle = '#1e293b';
        this.ctx.beginPath();
        this.ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#334155';
        this.ctx.font = '500 11px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SYSTEM READY', w / 2, h / 2 + 30);
      }
      // if style === 'oled', canvas remains 100% solid pure black #000000

      // Throttle rendering at ~500ms intervals when in clock mode, or 2s in oled
      const interval = style === 'clock' ? 500 : 2000;
      setTimeout(() => {
        if (this.isRendering) {
          this.animationFrameId = requestAnimationFrame(renderLoop);
        }
      }, interval);
    };

    renderLoop();
  }

  private stopRendering() {
    this.isRendering = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

export const floatingPipService = new FloatingPipService();
