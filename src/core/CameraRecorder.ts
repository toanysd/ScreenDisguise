import { useAppStore, CameraFacing, VideoQuality } from '../store/useAppStore';
import { indexedDBVault } from './IndexedDBVault';
import { motionDetector } from './MotionDetector';

class CameraRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: BlobPart[] = [];
  private timerInterval: any = null;
  private startTime: number = 0;
  private isChunkSwitching: boolean = false;

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public async initialize(facing: CameraFacing = 'environment', audio: boolean = true, quality: VideoQuality = '1080p'): Promise<boolean> {
    this.stopStreamOnly();

    const resolutionMap = {
      '1080p': { width: { ideal: 1920 }, height: { ideal: 1080 } },
      '720p': { width: { ideal: 1280 }, height: { ideal: 720 } },
      '480p': { width: { ideal: 640 }, height: { ideal: 480 } },
    };

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: facing },
        ...resolutionMap[quality],
      },
      audio: audio,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (useAppStore.getState().motionDetectionEnabled) {
        motionDetector.start(this.stream);
      }
      return true;
    } catch (err) {
      console.warn('Camera init error with resolution, attempting fallback 1 (without resolution constraints):', err);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: audio,
        });
        if (useAppStore.getState().motionDetectionEnabled) {
          motionDetector.start(this.stream);
        }
        return true;
      } catch (fallbackErr1) {
        console.warn('Camera fallback 1 failed, attempting fallback 2 (video only, no audio):', fallbackErr1);
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing },
            audio: false,
          });
          return true;
        } catch (fallbackErr2) {
          console.warn('Camera fallback 2 failed, attempting fallback 3 (basic generic video):', fallbackErr2);
          try {
            this.stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            return true;
          } catch (finalErr) {
            console.error('All camera initialization fallbacks failed:', finalErr);
            return false;
          }
        }
      }
    }
  }

  public async startRecording(): Promise<boolean> {
    const state = useAppStore.getState();
    if (!this.stream) {
      const initialized = await this.initialize(state.cameraFacing, state.audioEnabled, state.videoQuality);
      if (!initialized || !this.stream) {
        return false;
      }
    }

    this.startMediaRecorder();

    useAppStore.getState().setRecordingStatus('recording');
    useAppStore.getState().setRecordingDuration(0);

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      useAppStore.getState().setRecordingDuration((prev) => {
        const next = prev + 1;
        // Auto-chunking check
        const chunkLimitSec = useAppStore.getState().autoChunkMinutes * 60;
        if (chunkLimitSec > 0 && next >= chunkLimitSec && !this.isChunkSwitching) {
          this.cycleChunk();
          return 0;
        }
        return next;
      });
    }, 1000);

    return true;
  }

  private startMediaRecorder() {
    if (!this.stream) return;
    this.recordedChunks = [];
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }
    }

    try {
      this.mediaRecorder = mimeType ? new MediaRecorder(this.stream, { mimeType }) : new MediaRecorder(this.stream);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      const duration = Math.round((Date.now() - this.startTime) / 1000);
      if (this.recordedChunks.length > 0) {
        const finalType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: finalType });
        await indexedDBVault.saveVideo(blob, duration);
        const count = await indexedDBVault.getCount();
        useAppStore.getState().setVaultCount(count);
      }
      this.recordedChunks = [];

      // If this stop was triggered by auto-chunk rollover, restart next chunk seamlessly
      if (this.isChunkSwitching) {
        this.isChunkSwitching = false;
        this.startMediaRecorder();
      } else {
        clearInterval(this.timerInterval);
        useAppStore.getState().setRecordingDuration(0);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(1000);
  }

  private cycleChunk() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.isChunkSwitching = true;
      this.mediaRecorder.stop();
    }
  }

  public async takeSnapshot(): Promise<Blob | null> {
    if (!this.stream) {
      const state = useAppStore.getState();
      const initialized = await this.initialize(state.cameraFacing, state.audioEnabled, state.videoQuality);
      if (!initialized || !this.stream) return null;
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return null;

    // Method 1: ImageCapture API (High quality hardware capture)
    if ('ImageCapture' in window) {
      try {
        const imageCapture = new (window as any).ImageCapture(videoTrack);
        const blob = await imageCapture.takePhoto();
        return blob;
      } catch (err) {
        console.warn('ImageCapture takePhoto fallback to canvas:', err);
      }
    }

    // Method 2: Offscreen video canvas fallback
    return new Promise((resolve) => {
      const tempVideo = document.createElement('video');
      tempVideo.muted = true;
      tempVideo.playsInline = true;
      tempVideo.srcObject = this.stream;
      tempVideo.onloadedmetadata = () => {
        tempVideo.play().then(() => {
          const canvas = document.createElement('canvas');
          canvas.width = tempVideo.videoWidth || 1280;
          canvas.height = tempVideo.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              tempVideo.pause();
              tempVideo.srcObject = null;
              resolve(blob);
            }, 'image/jpeg', 0.95);
          } else {
            resolve(null);
          }
        }).catch(() => resolve(null));
      };
    });
  }

  public pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      useAppStore.getState().setRecordingStatus('paused');
    }
  }

  public resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      useAppStore.getState().setRecordingStatus('recording');
    }
  }

  public stopRecording() {
    this.isChunkSwitching = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    useAppStore.getState().setRecordingStatus('idle');
    this.stopStreamOnly();
  }

  private stopStreamOnly() {
    motionDetector.stop();
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}

export const cameraRecorder = new CameraRecorder();

