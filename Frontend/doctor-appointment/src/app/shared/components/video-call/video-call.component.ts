import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';
import { TopNavbarComponent } from '../top-navbar/top-navbar.component';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, SidebarComponent, TopNavbarComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" [theme]="theme" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Video Call" [theme]="theme" [userName]="authService.currentUser?.name || ''" [userRole]="roleLabel" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content-vc">
    <div class="video-page">
      <div class="video-container">
        <!-- Remote Video (Large) -->
        <div class="remote-video-wrapper">
          <video #remoteVideo autoplay playsinline class="remote-video"></video>
          @if (!inCall) {
            <div class="video-placeholder">
              <mat-icon>videocam_off</mat-icon>
              <p>Waiting to connect...</p>
            </div>
          }
          <!-- Local Video (Picture-in-Picture) -->
          <div class="local-video-wrapper">
            <video #localVideo autoplay muted playsinline class="local-video"></video>
            @if (!inCall) {
              <div class="local-placeholder">
                <mat-icon>person</mat-icon>
              </div>
            }
          </div>
        </div>

        <!-- Controls -->
        <div class="controls-bar">
          <button mat-fab [class.active]="!isMuted" (click)="toggleMute()" class="control-btn" [title]="isMuted ? 'Unmute' : 'Mute'" [attr.aria-label]="isMuted ? 'Unmute' : 'Mute'">
            <mat-icon>{{ isMuted ? 'mic_off' : 'mic' }}</mat-icon>
          </button>
          <button mat-fab [class.active]="!isCameraOff" (click)="toggleCamera()" class="control-btn" [title]="isCameraOff ? 'Turn camera on' : 'Turn camera off'" [attr.aria-label]="isCameraOff ? 'Turn camera on' : 'Turn camera off'">
            <mat-icon>{{ isCameraOff ? 'videocam_off' : 'videocam' }}</mat-icon>
          </button>

          @if (!inCall) {
            <button mat-fab class="control-btn call-btn" (click)="startCall()" title="Start call" aria-label="Start call">
              <mat-icon>call</mat-icon>
            </button>
          } @else {
            <button mat-fab class="control-btn end-btn" (click)="endCall()" title="End call" aria-label="End call">
              <mat-icon>call_end</mat-icon>
            </button>
          }

          <button mat-fab class="control-btn" (click)="toggleScreenShare()" [title]="isScreenSharing ? 'Stop sharing' : 'Share screen'" [attr.aria-label]="isScreenSharing ? 'Stop sharing' : 'Share screen'">
            <mat-icon>{{ isScreenSharing ? 'stop_screen_share' : 'screen_share' }}</mat-icon>
          </button>
        </div>
      </div>
    </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #1a1a2e; }
    .dashboard-main { flex: 1; margin-left: 260px; }
    .dashboard-content-vc { padding-top: 64px; }
    .video-page {
      height: calc(100vh - 64px);
      background: #1a1a2e;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .video-container {
      width: 100%;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .remote-video-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #0d0d1a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }

    .remote-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.3);
    }
    .video-placeholder mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 12px;
    }
    .video-placeholder p {
      font-size: 16px;
      margin: 0;
    }

    .local-video-wrapper {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 240px;
      height: 180px;
      background: #0d0d1a;
      border-radius: 12px;
      overflow: hidden;
      border: 3px solid rgba(255,255,255,0.15);
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }

    .local-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .local-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.2);
    }
    .local-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    /* Controls */
    .controls-bar {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    .control-btn {
      width: 56px !important;
      height: 56px !important;
      background: rgba(255,255,255,0.12) !important;
      color: #fff !important;
      transition: all 0.2s ease;
    }
    .control-btn:hover {
      background: rgba(255,255,255,0.2) !important;
      transform: scale(1.05);
    }
    .control-btn.active {
      background: rgba(255,255,255,0.2) !important;
    }

    .call-btn {
      background: #2e7d32 !important;
      width: 64px !important;
      height: 64px !important;
    }
    .call-btn:hover { background: #1b5e20 !important; }

    .end-btn {
      background: #c62828 !important;
      width: 64px !important;
      height: 64px !important;
    }
    .end-btn:hover { background: #b71c1c !important; }

    @media (max-width: 768px) {
      .local-video-wrapper { width: 140px; height: 105px; }
      .controls-bar { gap: 10px; }
      .control-btn { width: 48px !important; height: 48px !important; }
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  appointmentId = '';
  inCall = false;
  isMuted = false;
  isCameraOff = false;
  isScreenSharing = false;
  private localStream?: MediaStream;
  private peerConnection?: RTCPeerConnection;
  private subscriptions: Subscription[] = [];

  private rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  theme: 'admin' | 'doctor' | 'patient' = 'patient';
  roleLabel = '';
  sidebarItems: SidebarItem[] = [];

  constructor(private route: ActivatedRoute, private signalrService: SignalrService, public authService: AuthService) {
    const role = this.authService.currentUser?.role || 'Patient';
    if (role === 'Doctor') {
      this.theme = 'doctor'; this.roleLabel = 'Doctor';
      this.sidebarItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/doctor/dashboard' },
        { label: 'Chat', icon: 'chat', route: '/doctor/chat' },
        { label: 'Video Call', icon: 'videocam', route: '/doctor/video-call' },
        { label: 'Profile', icon: 'person', route: '/doctor/profile' },
      ];
    } else {
      this.theme = 'patient'; this.roleLabel = 'Patient';
      this.sidebarItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
        { label: 'Find Doctors', icon: 'search', route: '/patient/search-doctors' },
        { label: 'Chat', icon: 'chat', route: '/patient/chat' },
        { label: 'Video Call', icon: 'videocam', route: '/patient/video-call' },
        { label: 'Profile', icon: 'person', route: '/patient/profile' },
      ];
    }
  }

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.queryParams['appointmentId'] || '';

    this.subscriptions.push(
      this.signalrService.signalReceived$.subscribe(async ({ signal }) => {
        const desc = JSON.parse(signal);
        if (desc.type === 'offer') {
          await this.handleOffer(desc);
        } else if (desc.type === 'answer') {
          await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(desc));
        }
      }),
      this.signalrService.iceCandidateReceived$.subscribe(async ({ candidate }) => {
        const ice = JSON.parse(candidate);
        await this.peerConnection?.addIceCandidate(new RTCIceCandidate(ice));
      })
    );
  }

  ngOnDestroy(): void {
    this.endCall();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.localStream?.getAudioTracks().forEach(t => t.enabled = !this.isMuted);
  }

  toggleCamera(): void {
    this.isCameraOff = !this.isCameraOff;
    this.localStream?.getVideoTracks().forEach(t => t.enabled = !this.isCameraOff);
  }

  toggleScreenShare(): void {
    this.isScreenSharing = !this.isScreenSharing;
    // Screen share logic would go here
  }

  async startCall(): Promise<void> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.nativeElement.srcObject = this.localStream;

    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    this.localStream.getTracks().forEach(track => this.peerConnection!.addTrack(track, this.localStream!));

    this.peerConnection.ontrack = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalrService.sendIceCandidate(this.appointmentId, JSON.stringify(event.candidate));
      }
    };

    await this.signalrService.joinVideoRoom(this.appointmentId);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    await this.signalrService.sendVideoSignal(this.appointmentId, JSON.stringify(offer));

    this.inCall = true;
  }

  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localVideo.nativeElement.srcObject = this.localStream;
      this.peerConnection = new RTCPeerConnection(this.rtcConfig);
      this.localStream.getTracks().forEach(track => this.peerConnection!.addTrack(track, this.localStream!));
      this.peerConnection.ontrack = (event) => {
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
      };
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.signalrService.sendIceCandidate(this.appointmentId, JSON.stringify(event.candidate));
        }
      };
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.signalrService.sendVideoSignal(this.appointmentId, JSON.stringify(answer));
    this.inCall = true;
  }

  endCall(): void {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.peerConnection?.close();
    this.peerConnection = undefined;
    this.inCall = false;
    if (this.appointmentId) {
      this.signalrService.leaveVideoRoom(this.appointmentId);
    }
  }
}
