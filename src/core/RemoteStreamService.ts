import { Peer, DataConnection, MediaConnection } from 'peerjs';
import { cameraRecorder } from './CameraRecorder';
import { useAppStore } from '../store/useAppStore';

export interface RemoteCommand {
  type: 'START_RECORD' | 'STOP_RECORD' | 'SWITCH_CAMERA' | 'SET_MODE_OLED' | 'SET_MODE_LOCK' | 'TAKE_SNAPSHOT' | 'SYNC_STATUS';
  payload?: any;
}

class RemoteStreamService {
  private peer: Peer | null = null;
  private currentCall: MediaConnection | null = null;
  private currentConn: DataConnection | null = null;
  private roomId: string = '';
  private isHost: boolean = false;

  public getRoomId(): string {
    return this.roomId;
  }

  // --- HOST (PHONE) SIDE ---
  public async initHost(
    onViewerConnected?: () => void,
    onViewerDisconnected?: () => void
  ): Promise<string> {
    this.isHost = true;
    this.cleanup();

    // Generate random 6-character room ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.roomId = `SD-${randomSuffix}`;

    return new Promise((resolve) => {
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
        resolve(id);
      });

      // When PC connects data channel
      this.peer.on('connection', (conn) => {
        this.currentConn = conn;
        onViewerConnected?.();

        conn.on('data', async (data: any) => {
          this.handleHostReceivedCommand(data as RemoteCommand);
        });

        conn.on('close', () => {
          onViewerDisconnected?.();
        });

        // Send current status to PC
        this.sendHostStatus();
      });

      // When PC calls for video stream
      this.peer.on('call', async (call) => {
        this.currentCall = call;
        let stream = cameraRecorder.getStream();
        if (!stream) {
          const state = useAppStore.getState();
          await cameraRecorder.initialize(state.cameraFacing, state.audioEnabled, state.videoQuality);
          stream = cameraRecorder.getStream();
        }

        if (stream) {
          call.answer(stream);
        }

        call.on('close', () => {
          onViewerDisconnected?.();
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Peer host error:', err);
      });
    });
  }

  // Handle command sent from PC to Phone
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
        const newStream = cameraRecorder.getStream();
        if (newStream && this.currentCall) {
          // Re-establish call or replace tracks
          const videoTrack = newStream.getVideoTracks()[0];
          const sender = (this.currentCall.peerConnection as any)?.getSenders()?.find((s: any) => s.track?.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }
        this.sendHostStatus();
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
        },
      });
    }
  }

  // --- VIEWER (PC) SIDE ---
  public async initViewer(
    hostRoomId: string,
    onStreamReceived: (stream: MediaStream) => void,
    onStatusReceived?: (status: any) => void
  ): Promise<boolean> {
    this.isHost = false;
    this.cleanup();

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

        // 1. Open Data Connection to Phone
        this.currentConn = this.peer.connect(hostRoomId);
        this.currentConn.on('open', () => {
          resolve(true);
        });

        this.currentConn.on('data', (data: any) => {
          if (data && data.type === 'SYNC_STATUS') {
            onStatusReceived?.(data.payload);
          }
        });

        // 2. Call Phone for Video Stream
        // Dummy local audio stream to initiate call
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 10;
        dummyCanvas.height = 10;
        const dummyStream = dummyCanvas.captureStream();

        const call = this.peer.call(hostRoomId, dummyStream);
        this.currentCall = call;

        call.on('stream', (remoteStream) => {
          onStreamReceived(remoteStream);
        });

        call.on('error', (err) => {
          console.warn('Viewer call error:', err);
          resolve(false);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Peer viewer error:', err);
        resolve(false);
      });
    });
  }

  public sendViewerCommand(cmd: RemoteCommand) {
    if (this.currentConn && this.currentConn.open) {
      this.currentConn.send(cmd);
    }
  }

  public cleanup() {
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
