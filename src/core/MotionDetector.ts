import { useAppStore } from '../store/useAppStore';
import { cameraRecorder } from './CameraRecorder';

class MotionDetector {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private video: HTMLVideoElement | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private intervalId: any = null;
  private stillnessTimer: any = null;
  private isAutoTriggered: boolean = false;
  private isRunning: boolean = false;

  private initElements() {
    if (typeof document === 'undefined') return;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 48; // Ultra low resolution for high speed & zero battery drain
      this.canvas.height = 36;
      this.canvas.style.display = 'none';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    if (!this.video) {
      this.video = document.createElement('video');
      this.video.style.display = 'none';
      this.video.muted = true;
      this.video.playsInline = true;
      document.body.appendChild(this.video);
    }
  }

  public start(stream: MediaStream) {
    this.stop();
    this.initElements();
    if (!this.canvas || !this.video || !this.ctx) return;

    this.isRunning = true;
    this.video.srcObject = stream;
    this.video.play().catch(() => {});

    this.prevFrameData = null;

    // Check motion 4 times a second (250ms interval)
    this.intervalId = setInterval(() => {
      this.checkMotion();
    }, 250);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.stillnessTimer) {
      clearTimeout(this.stillnessTimer);
      this.stillnessTimer = null;
    }
    this.prevFrameData = null;
    this.isAutoTriggered = false;
    useAppStore.getState().setMotionDetected(false);
  }

  private checkMotion() {
    if (!this.isRunning || !this.video || !this.ctx || !this.canvas) return;
    if (this.video.readyState < 2) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.drawImage(this.video, 0, 0, w, h);
    const frame = this.ctx.getImageData(0, 0, w, h);
    const data = frame.data;

    if (!this.prevFrameData) {
      this.prevFrameData = new Uint8ClampedArray(data);
      return;
    }

    let diffCount = 0;
    const totalPixels = w * h;
    const pixelDiffThreshold = 25; // Minimum luminance change to count as a changed pixel

    for (let i = 0; i < data.length; i += 4) {
      // Calculate grayscale difference
      const rDiff = Math.abs(data[i] - this.prevFrameData[i]);
      const gDiff = Math.abs(data[i + 1] - this.prevFrameData[i + 1]);
      const bDiff = Math.abs(data[i + 2] - this.prevFrameData[i + 2]);
      const avgDiff = (rDiff + gDiff + bDiff) / 3;

      if (avgDiff > pixelDiffThreshold) {
        diffCount++;
      }
      this.prevFrameData[i] = data[i];
      this.prevFrameData[i + 1] = data[i + 1];
      this.prevFrameData[i + 2] = data[i + 2];
    }

    const motionPercentage = (diffCount / totalPixels) * 100;
    const sensitivity = useAppStore.getState().motionSensitivity; // e.g. 30
    const motionThreshold = Math.max(1, 100 - sensitivity) * 0.15; // Map sensitivity to percentage threshold

    const hasMotion = motionPercentage > motionThreshold;
    const store = useAppStore.getState();

    if (hasMotion) {
      store.setMotionDetected(true);

      if (store.motionDetectionEnabled && store.recordingStatus === 'idle') {
        this.isAutoTriggered = true;
        cameraRecorder.startRecording();
      }

      // Reset stillness countdown (keep recording for 10 seconds after motion stops)
      if (this.stillnessTimer) {
        clearTimeout(this.stillnessTimer);
      }
      this.stillnessTimer = setTimeout(() => {
        useAppStore.getState().setMotionDetected(false);
        if (this.isAutoTriggered && useAppStore.getState().recordingStatus === 'recording') {
          cameraRecorder.stopRecording();
          this.isAutoTriggered = false;
        }
      }, 10000);
    }
  }
}

export const motionDetector = new MotionDetector();
