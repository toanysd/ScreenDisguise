import { Peer, DataConnection, MediaConnection } from 'peerjs';
import { cameraRecorder } from './CameraRecorder';
import { useAppStore } from '../store/useAppStore';

export interface RemoteCommand {
  type: 'START_RECORD' | 'STOP_RECORD' | 'SWITCH_CAMERA' | 'SET_MODE_OLED' | 'SET_MODE_LOCK' | 'TAKE_SNAPSHOT' | 'SWITCH_STREAM_SOURCE' | 'SYNC_STATUS';
  payload?: any;
}

class RemoteStreamService {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private currentConn: DataConnection | null = null;
  private roomId: string = '';
  private isHost: boolean = false;
  private screenStream: MediaStream | null = null;
  private activeStreamSource: 'camera' | 'screen' = 'camera';

  public onStatusChange?: (status: string) => void;
  public onPhoneStateChange?: (state: any) => void;

  public getRoomId(): string {
    return this.roomId;
  }

  public getActiveStreamSource(): 'camera' | 'screen' {
    return this.activeStreamSource;
  }

  // --- HOST (PHONE) SIDE ---
  public async initializeAsHost(onReady: (id: string) => void): Promise<string> {
    this.isHost = true;
    this.cleanup();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.roomId = `SD-${randomSuffix}`;

    this.onStatusChange?.('Đang kết nối Server...');

    this.peer = new Peer(this.roomId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    this.peer.on('open', (id) => {
      this.roomId = id;
      this.onStatusChange?.('Sẵn sàng kết nối');
      onReady(id);
    });

    this.peer.on('connection', (conn) => {
      this.currentConn = conn;
      this.onStatusChange?.('Máy tính đã kết nối Data');

      conn.on('data', async (data: any) => {
        this.handleHostReceivedCommand(data as RemoteCommand);
      });

      conn.on('close', () => {
        this.onStatusChange?.('Máy tính đã ngắt kết nối');
      });

      this.sendHostStatus();
    });

    this.peer.on('call', async (call) => {
      this.currentCall = call;
      let streamToSend = await this.getCurrentStream();
      if (streamToSend) {
        call.answer(streamToSend);
        this.onStatusChange?.('Đang truyền luồng trực tiếp');
      }

      call.on('close', () => {
        this.onStatusChange?.('Luồng video đã đóng');
      });
    });

    this.peer.on('error', (err) => {
      console.warn('Peer host error:', err);
      this.onStatusChange?.(`Lỗi kết nối: ${err.type}`);
    });

    return this.roomId;
  }

  public async setStreamSource(source: 'camera' | 'screen'): Promise<boolean> {
    this.activeStreamSource = source;
    if (source === 'screen') {
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          alert('Trình duyệt không hỗ trợ chia sẻ màn hình trực tiếp. Vui lòng mở trên Safari iOS 13+ hoặc Chrome.');
          return false;
        }
        try {
          this.screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
        } catch (err1) {
          console.warn('First getDisplayMedia failed, trying fallback:', err1);
          this.screenStream = await (navigator.mediaDevices as any).getDisplayMedia();
        }

        // Handle user stop share from system UI
        if (this.screenStream?.getVideoTracks()?.length) {
          this.screenStream.getVideoTracks()[0].onended = () => {
            this.setStreamSource('camera');
          };
        }
      } catch (err) {
        console.warn('Cannot capture screen:', err);
        this.activeStreamSource = 'camera';
        return false;
      }
    }

    // Replace track if in call
    const activeStream = await this.getCurrentStream();
    if (activeStream && this.currentCall) {
      const videoTrack = activeStream.getVideoTracks()[0];
      const sender = (this.currentCall.peerConnection as any)?.getSenders()?.find((s: any) => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    }

    this.sendHostStatus();
    return true;
  }

  private async getCurrentStream(): Promise<MediaStream | null> {
    if (this.activeStreamSource === 'screen' && this.screenStream) {
      return this.screenStream;
    }
    let camStream = cameraRecorder.getStream();
    if (!camStream) {
      const state = useAppStore.getState();
      await cameraRecorder.initialize(state.cameraFacing, state.audioEnabled, state.videoQuality);
      camStream = cameraRecorder.getStream();
    }
    return camStream;
  }

  private async handleHostReceivedCommand(cmd: RemoteCommand) {
    const store = useAppStore.getState();
    switch (cmd.type) {
      case 'START_RECORD':
        if (store.recordingStatus === 'idle') {
          await cameraRecorder.startRecording();
          this.sendHostStatus();
        }
        break;
      case 'STOP_RECORD':
        if (store.recordingStatus !== 'idle') {
          cameraRecorder.stopRecording();
          this.sendHostStatus();
        }
        break;
      case 'SWITCH_CAMERA':
        const nextFacing = store.cameraFacing === 'environment' ? 'user' : 'environment';
        store.setCameraFacing(nextFacing);
        await cameraRecorder.initialize(nextFacing, store.audioEnabled, store.videoQuality);
        if (this.activeStreamSource === 'camera') {
          const newStream = cameraRecorder.getStream();
          if (newStream && this.currentCall) {
            const videoTrack = newStream.getVideoTracks()[0];
            const sender = (this.currentCall.peerConnection as any)?.getSenders()?.find((s: any) => s.track?.kind === 'video');
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          }
        }
        this.sendHostStatus();
        break;
      case 'SWITCH_STREAM_SOURCE':
        await this.setStreamSource(cmd.payload?.source || 'camera');
        break;
      case 'SET_MODE_OLED':
        store.setUIMode('oled');
        break;
      case 'SET_MODE_LOCK':
        store.setUIMode('lockscreen');
        break;
    }
  }

  public sendHostStatus() {
    if (this.currentConn && this.currentConn.open) {
      const store = useAppStore.getState();
      this.currentConn.send({
        type: 'SYNC_STATUS',
        payload: {
          recordingStatus: store.recordingStatus,
          recordingDuration: store.recordingDuration,
          cameraFacing: store.cameraFacing,
          uiMode: store.uiMode,
          streamSource: this.activeStreamSource,
        },
      });
    }
  }

  // --- VIEWER (PC) SIDE ---
  public async connectAsViewer(
    hostRoomId: string,
    onStreamReceived: (stream: MediaStream) => void
  ): Promise<boolean> {
    this.isHost = false;
    this.cleanup();

    this.onStatusChange?.('Đang kết nối tới máy chủ P2P...');

    return new Promise((resolve) => {
      this.peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      this.peer.on('open', () => {
        if (!this.peer) return;

        this.onStatusChange?.('Đang tìm kiếm điện thoại ' + hostRoomId + '...');

        // 1. Data Connection
        this.currentConn = this.peer.connect(hostRoomId);
        this.currentConn.on('open', () => {
          this.onStatusChange?.('Đã kết nối thành công');
          resolve(true);
        });

        this.currentConn.on('data', (data: any) => {
          if (data && data.type === 'SYNC_STATUS') {
            this.onPhoneStateChange?.(data.payload);
          }
        });

        this.currentConn.on('close', () => {
          this.onStatusChange?.('Ngắt kết nối với điện thoại');
        });

        // 2. Call Phone for Video
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 10;
        dummyCanvas.height = 10;
        const dummyStream = dummyCanvas.captureStream();

        const call = this.peer.call(hostRoomId, dummyStream);
        this.currentCall = call;

        call.on('stream', (remoteStream) => {
          this.onStatusChange?.('Đã nhận luồng trực tiếp');
          onStreamReceived(remoteStream);
        });

        call.on('error', (err) => {
          console.warn('Viewer call error:', err);
          this.onStatusChange?.('Lỗi nhận luồng video');
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Peer viewer error:', err);
        this.onStatusChange?.(`Lỗi kết nối: ${err.type}`);
        resolve(false);
      });
    });
  }

  public sendCommand(cmd: 'start_record' | 'stop_record' | 'switch_camera' | 'black_screen' | 'switch_to_screen' | 'switch_to_camera') {
    if (!this.currentConn || !this.currentConn.open) return;

    switch (cmd) {
      case 'start_record':
        this.currentConn.send({ type: 'START_RECORD' });
        break;
      case 'stop_record':
        this.currentConn.send({ type: 'STOP_RECORD' });
        break;
      case 'switch_camera':
        this.currentConn.send({ type: 'SWITCH_CAMERA' });
        break;
      case 'black_screen':
        this.currentConn.send({ type: 'SET_MODE_OLED' });
        break;
      case 'switch_to_screen':
        this.currentConn.send({ type: 'SWITCH_STREAM_SOURCE', payload: { source: 'screen' } });
        break;
      case 'switch_to_camera':
        this.currentConn.send({ type: 'SWITCH_STREAM_SOURCE', payload: { source: 'camera' } });
        break;
    }
  }

  public disconnect() {
    this.cleanup();
  }

  public cleanup() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    if (this.currentConn) {
      this.currentConn.close();
      this.currentConn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const remoteStreamService = new RemoteStreamService();
