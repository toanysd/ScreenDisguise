import { useAppStore, CameraFacing, VideoQuality } from '../store/useAppStore';
import { indexedDBVault } from './IndexedDBVault';

class CameraRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: BlobPart[] = [];
  private timerInterval: any = null;
  private startTime: number = 0;

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
      return true;
    } catch (err) {
      console.error('Camera init error, attempting fallback without resolution constraints:', err);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: audio,
        });
        return true;
      } catch (fallbackErr) {
        console.error('Camera fallback error:', fallbackErr);
        return false;
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
      clearInterval(this.timerInterval);
      useAppStore.getState().setRecordingDuration(0);
    };

    this.mediaRecorder.start(1000);
    this.startTime = Date.now();
    useAppStore.getState().setRecordingStatus('recording');
    useAppStore.getState().setRecordingDuration(0);

    this.timerInterval = setInterval(() => {
      useAppStore.getState().setRecordingDuration((prev) => prev + 1);
    }, 1000);

    return true;
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
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    useAppStore.getState().setRecordingStatus('idle');
    this.stopStreamOnly();
  }

  private stopStreamOnly() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}

export const cameraRecorder = new CameraRecorder();
