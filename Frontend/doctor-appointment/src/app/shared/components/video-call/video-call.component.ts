import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';
import { TopNavbarComponent } from '../top-navbar/top-navbar.component';
@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, SidebarComponent, TopNavbarComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" [theme]="theme" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Video Call" [theme]="theme" [userName]="authService.currentUser?.name || ''" [userRole]="roleLabel" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content-vc">
          <div class="video-page">

            <!-- Idle State: No call -->
            @if (callState === 'idle') {
              <div class="idle-state">
                <div class="idle-card">
                  <div class="idle-icon-wrap">
                    <mat-icon>videocam</mat-icon>
                  </div>
                  <h2>Video Consultation</h2>
                  <p>Start a secure video call with your {{ theme === 'doctor' ? 'patient' : 'doctor' }}</p>
                  <div class="idle-features">
                    <div class="idle-feature"><mat-icon>hd</mat-icon><span>HD Video</span></div>
                    <div class="idle-feature"><mat-icon>lock</mat-icon><span>Encrypted</span></div>
                    <div class="idle-feature"><mat-icon>screen_share</mat-icon><span>Screen Share</span></div>
                  </div>
                  <button mat-raised-button class="start-call-btn" (click)="initiateCall()">
                    <mat-icon>videocam</mat-icon>
                    Start Video Call
                  </button>
                </div>
              </div>
            }

            <!-- Calling State: Ringing -->
            @if (callState === 'calling') {
              <div class="calling-state">
                <div class="calling-card">
                  <div class="calling-avatar-wrap">
                    <div class="pulse-ring"></div>
                    <div class="pulse-ring delay"></div>
                    <div class="calling-avatar">
                      <mat-icon>person</mat-icon>
                    </div>
                  </div>
                  <h2>Calling...</h2>
                  <p>Waiting for response</p>
                  <div class="calling-timer">{{ callDuration }}</div>
                  <button mat-fab class="cancel-call-btn" (click)="cancelCall()">
                    <mat-icon>call_end</mat-icon>
                  </button>
                </div>
              </div>
            }

            <!-- Incoming Call State -->
            @if (callState === 'incoming') {
              <div class="calling-state incoming">
                <div class="calling-card">
                  <div class="calling-avatar-wrap">
                    <div class="pulse-ring incoming-pulse"></div>
                    <div class="pulse-ring incoming-pulse delay"></div>
                    <div class="calling-avatar incoming-avatar">
                      <mat-icon>person</mat-icon>
                    </div>
                  </div>
                  <h2>Incoming Call</h2>
                  <p>Video call from {{ theme === 'doctor' ? 'Patient' : 'Doctor' }}</p>
                  <div class="incoming-actions">
                    <button mat-fab class="reject-btn" (click)="rejectCall()">
                      <mat-icon>call_end</mat-icon>
                    </button>
                    <button mat-fab class="accept-btn" (click)="acceptCall()">
                      <mat-icon>videocam</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- In Call State -->
            @if (callState === 'connected') {
              <div class="in-call-state">
                <div class="video-container">
                  <div class="remote-video-wrapper">
                    <video #remoteVideoEl autoplay playsinline class="remote-video"></video>
                    @if (!remoteConnected) {
                      <div class="video-placeholder">
                        <div class="connecting-dots">
                          <span></span><span></span><span></span>
                        </div>
                        <p>Connecting video...</p>
                      </div>
                    }
                    <div class="call-duration-badge">
                      <mat-icon>fiber_manual_record</mat-icon>
                      {{ callDuration }}
                    </div>
                  </div>
                  <div class="local-video-wrapper" [class.minimized]="!showLocalVideo">
                    <video #localVideoEl autoplay muted playsinline class="local-video"></video>
                    <button mat-icon-button class="toggle-local" (click)="showLocalVideo = !showLocalVideo">
                      <mat-icon>{{ showLocalVideo ? 'picture_in_picture' : 'picture_in_picture_alt' }}</mat-icon>
                    </button>
                  </div>
                </div>
                <div class="controls-bar" [class.show]="showControls" (mouseenter)="showControls = true" (mouseleave)="showControls = false">
                  <button mat-fab [class.off]="isMuted" (click)="toggleMute()" class="ctrl-btn">
                    <mat-icon>{{ isMuted ? 'mic_off' : 'mic' }}</mat-icon>
                  </button>
                  <button mat-fab [class.off]="isCameraOff" (click)="toggleCamera()" class="ctrl-btn">
                    <mat-icon>{{ isCameraOff ? 'videocam_off' : 'videocam' }}</mat-icon>
                  </button>
                  <button mat-fab class="ctrl-btn end-call-btn" (click)="endCall()">
                    <mat-icon>call_end</mat-icon>
                  </button>
                  <button mat-fab (click)="toggleScreenShare()" class="ctrl-btn" [class.active-share]="isScreenSharing">
                    <mat-icon>{{ isScreenSharing ? 'stop_screen_share' : 'screen_share' }}</mat-icon>
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #0f0f1a; }
    .dashboard-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
    .dashboard-content-vc { padding-top: 64px; flex: 1; display: flex; }
    .video-page { flex: 1; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%); position: relative; overflow: hidden; }

    /* ===== IDLE STATE ===== */
    .idle-state { display: flex; align-items: center; justify-content: center; width: 100%; }
    .idle-card { text-align: center; padding: 60px 40px; max-width: 480px; }
    .idle-icon-wrap { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #00a884, #008069); display: flex; align-items: center; justify-content: center; margin: 0 auto 28px; box-shadow: 0 8px 32px rgba(0,168,132,0.3); }
    .idle-icon-wrap mat-icon { font-size: 48px; width: 48px; height: 48px; color: #fff; }
    .idle-card h2 { color: #fff; font-size: 28px; font-weight: 600; margin: 0 0 8px; }
    .idle-card p { color: rgba(255,255,255,0.6); font-size: 15px; margin: 0 0 32px; }
    .idle-features { display: flex; justify-content: center; gap: 24px; margin-bottom: 40px; }
    .idle-feature { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.5); font-size: 13px; }
    .idle-feature mat-icon { font-size: 18px; width: 18px; height: 18px; color: #00a884; }
    .start-call-btn { background: linear-gradient(135deg, #00a884, #008069) !important; color: #fff !important; font-size: 16px; font-weight: 600; padding: 12px 36px !important; border-radius: 30px !important; display: flex; align-items: center; gap: 10px; height: auto !important; }

    /* ===== CALLING STATE ===== */
    .calling-state { display: flex; align-items: center; justify-content: center; width: 100%; }
    .calling-card { text-align: center; padding: 40px; }
    .calling-avatar-wrap { position: relative; width: 140px; height: 140px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; }
    .pulse-ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid #00a884; animation: pulse-expand 1.5s ease-out infinite; opacity: 0; }
    .pulse-ring.delay { animation-delay: 0.75s; }
    .incoming-pulse { border-color: #4caf50; }
    @keyframes pulse-expand { 0% { transform: scale(0.7); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 0; } }
    .calling-avatar { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #00a884, #008069); display: flex; align-items: center; justify-content: center; }
    .calling-avatar mat-icon { font-size: 44px; width: 44px; height: 44px; color: #fff; }
    .incoming-avatar { background: linear-gradient(135deg, #4caf50, #2e7d32); }
    .calling-card h2 { color: #fff; font-size: 24px; margin: 0 0 4px; font-weight: 500; }
    .calling-card p { color: rgba(255,255,255,0.5); margin: 0 0 16px; font-size: 14px; }
    .calling-timer { color: rgba(255,255,255,0.4); font-size: 14px; font-family: monospace; margin-bottom: 32px; }
    .cancel-call-btn { background: #e53935 !important; color: #fff !important; width: 64px !important; height: 64px !important; }
    .incoming-actions { display: flex; justify-content: center; gap: 48px; margin-top: 24px; }
    .reject-btn { background: #e53935 !important; color: #fff !important; width: 64px !important; height: 64px !important; animation: shake 0.5s ease-in-out infinite alternate; }
    .accept-btn { background: #4caf50 !important; color: #fff !important; width: 64px !important; height: 64px !important; animation: shake 0.5s ease-in-out infinite alternate-reverse; }
    @keyframes shake { 0% { transform: rotate(-5deg); } 100% { transform: rotate(5deg); } }

    /* ===== IN-CALL STATE ===== */
    .in-call-state { width: 100%; height: calc(100vh - 64px); display: flex; flex-direction: column; position: relative; }
    .video-container { flex: 1; position: relative; background: #000; }
    .remote-video-wrapper { position: absolute; inset: 0; }
    .remote-video { width: 100%; height: 100%; object-fit: cover; }
    .video-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); }
    .video-placeholder p { font-size: 14px; margin: 12px 0 0; }
    .connecting-dots { display: flex; gap: 6px; }
    .connecting-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.4); animation: dot-bounce 1.2s ease-in-out infinite; }
    .connecting-dots span:nth-child(2) { animation-delay: 0.2s; }
    .connecting-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

    .call-duration-badge { position: absolute; top: 16px; left: 16px; background: rgba(0,0,0,0.6); color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px); }
    .call-duration-badge mat-icon { font-size: 10px; width: 10px; height: 10px; color: #e53935; }

    .local-video-wrapper { position: absolute; bottom: 100px; right: 20px; width: 200px; height: 150px; border-radius: 12px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.4); transition: all 0.3s ease; z-index: 5; }
    .local-video-wrapper.minimized { width: 80px; height: 80px; border-radius: 50%; bottom: 110px; }
    .local-video { width: 100%; height: 100%; object-fit: cover; }
    .toggle-local { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5) !important; color: #fff; width: 28px; height: 28px; }
    .toggle-local mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* Controls */
    .controls-bar { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; gap: 16px; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); opacity: 1; transition: opacity 0.3s; z-index: 10; }
    .ctrl-btn { background: rgba(255,255,255,0.15) !important; color: #fff !important; backdrop-filter: blur(10px); width: 52px !important; height: 52px !important; transition: all 0.2s; }
    .ctrl-btn:hover { background: rgba(255,255,255,0.25) !important; transform: scale(1.1); }
    .ctrl-btn.off { background: rgba(255,59,48,0.3) !important; }
    .ctrl-btn.active-share { background: rgba(0,168,132,0.4) !important; }
    .end-call-btn { background: #e53935 !important; width: 60px !important; height: 60px !important; }
    .end-call-btn:hover { background: #c62828 !important; }

    /* Responsive */
    @media (max-width: 1024px) { .dashboard-main { margin-left: 220px; } }
    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; }
      .dashboard-content-vc { padding-top: 56px; }
      .idle-card { padding: 40px 24px; }
      .idle-card h2 { font-size: 22px; }
      .idle-features { flex-direction: column; align-items: center; gap: 12px; }
      .local-video-wrapper { width: 120px; height: 90px; bottom: 90px; right: 12px; }
      .local-video-wrapper.minimized { width: 60px; height: 60px; }
      .controls-bar { gap: 12px; padding: 16px; }
      .ctrl-btn { width: 46px !important; height: 46px !important; }
      .end-call-btn { width: 52px !important; height: 52px !important; }
      .incoming-actions { gap: 32px; }
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideoEl') localVideoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideoEl') remoteVideoEl!: ElementRef<HTMLVideoElement>;

  callState: 'idle' | 'calling' | 'incoming' | 'connected' = 'idle';
  callDuration = '00:00';
  showLocalVideo = true;
  showControls = true;
  remoteConnected = false;

  appointmentId = '';
  receiverId = '';  // Target user ID for the call
  private callerId = '';  // Who initiated the call (for responding)
  isMuted = false;
  isCameraOff = false;
  isScreenSharing = false;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  private peerConnection?: RTCPeerConnection;
  private subscriptions: Subscription[] = [];
  private callTimer?: any;
  private callSeconds = 0;
  private pendingOffer?: RTCSessionDescriptionInit;
  private audioContext?: AudioContext;
  private oscillator?: OscillatorNode;
  private gainNode?: GainNode;
  private ringtoneInterval?: any;

  private rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  theme: 'admin' | 'doctor' | 'patient' = 'patient';
  roleLabel = '';
  sidebarItems: SidebarItem[] = [];

  constructor(private route: ActivatedRoute, private signalrService: SignalrService, public authService: AuthService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {
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
    this.receiverId = this.route.snapshot.queryParams['receiverId'] || '';

    // Join video room immediately if we have an appointmentId
    if (this.appointmentId) {
      this.signalrService.joinVideoRoom(this.appointmentId).catch(() => {});
    }

    this.subscriptions.push(
      // Handle WebRTC signaling (offer/answer) — only when already in a call flow
      this.signalrService.signalReceived$.subscribe(async ({ signal }) => {
        const desc = JSON.parse(signal);
        if (desc.type === 'offer') {
          this.pendingOffer = desc;
          // Only show incoming UI if we're not already calling or connected
          if (this.callState === 'idle') {
            this.callState = 'incoming';
            this.playRingtone();
          }
        } else if (desc.type === 'answer') {
          await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(desc));
          this.callState = 'connected';
          this.stopRingtone();
          this.stopTimer();
          this.startTimer();
          this.attachStreamsToView();
        }
      }),
      this.signalrService.iceCandidateReceived$.subscribe(async ({ candidate }) => {
        const ice = JSON.parse(candidate);
        await this.peerConnection?.addIceCandidate(new RTCIceCandidate(ice));
      }),
      this.signalrService.userJoinedVideo$.subscribe(() => {
        this.remoteConnected = true;
      }),
      this.signalrService.userLeftVideo$.subscribe(() => {
        this.remoteConnected = false;
        if (this.callState === 'connected') {
          this.endCall();
          this.snackBar.open('The other participant left the call.', 'OK', { duration: 4000 });
        }
      }),
      // Caller receives acceptance — other user will join room and we'll exchange offer/answer
      this.signalrService.callAccepted$.subscribe(({ roomId }) => {
        if (roomId === this.appointmentId && this.callState === 'calling') {
          this.snackBar.open('Call accepted! Connecting...', '', { duration: 2000 });
          // Now send the WebRTC offer since the other user is joining the room
          this.sendOffer();
        }
      }),
      this.signalrService.callRejected$.subscribe(({ roomId }) => {
        if (roomId === this.appointmentId && this.callState === 'calling') {
          this.snackBar.open('Call was declined.', 'OK', { duration: 4000 });
          this.cancelCall();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.endCall();
    this.subscriptions.forEach(s => s.unsubscribe());
    this.stopRingtone();
    this.stopTimer();
  }

  // ===== Ringtone using Web Audio API =====
  private playRingtone(): void {
    try {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.3;
      this.gainNode.connect(this.audioContext.destination);

      const playTone = () => {
        if (!this.audioContext || this.callState !== 'incoming' && this.callState !== 'calling') return;
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = 440;
        this.oscillator.connect(this.gainNode!);
        this.oscillator.start();
        setTimeout(() => { this.oscillator?.stop(); }, 800);
      };
      playTone();
      this.ringtoneInterval = setInterval(playTone, 2000);
    } catch {
      // Audio not supported, silently ignore
    }
  }

  private stopRingtone(): void {
    if (this.ringtoneInterval) { clearInterval(this.ringtoneInterval); this.ringtoneInterval = undefined; }
    if (this.oscillator) { try { this.oscillator.stop(); } catch {} this.oscillator = undefined; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = undefined; }
  }

  // ===== Timer =====
  private startTimer(): void {
    this.callSeconds = 0;
    this.callDuration = '00:00';
    this.callTimer = setInterval(() => {
      this.callSeconds++;
      const m = Math.floor(this.callSeconds / 60).toString().padStart(2, '0');
      const s = (this.callSeconds % 60).toString().padStart(2, '0');
      this.callDuration = `${m}:${s}`;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.callTimer) { clearInterval(this.callTimer); this.callTimer = undefined; }
  }

  // ===== Call Actions =====
  async initiateCall(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        this.snackBar.open('Camera & microphone access denied. Please allow permissions in browser settings.', 'OK', { duration: 5000 });
      } else if (err.name === 'NotFoundError') {
        this.snackBar.open('No camera or microphone found. Please connect a device.', 'OK', { duration: 5000 });
      } else {
        this.snackBar.open('Could not access camera/microphone: ' + (err.message || 'Unknown error'), 'OK', { duration: 5000 });
      }
      return;
    }

    this.callState = 'calling';
    this.playRingtone();
    this.startTimer();
    this.setupPeerConnection();

    if (this.appointmentId) {
      try {
        // Join room (may already be joined from ngOnInit, that's fine)
        await this.signalrService.joinVideoRoom(this.appointmentId);
        // Send notification to the target user
        if (this.receiverId) {
          const callerName = this.authService.currentUser?.name || 'Unknown';
          await this.signalrService.initiateVideoCall(this.appointmentId, callerName, this.receiverId);
        } else {
          // No specific target — directly send offer (both are in the room already)
          await this.sendOffer();
        }
      } catch {
        this.snackBar.open('Could not connect to video server. Please try again.', 'OK', { duration: 4000 });
        this.cancelCall();
      }
    } else {
      // No appointmentId — local-only mode for testing
      this.callState = 'connected';
      this.stopRingtone();
      this.attachStreamsToView();
    }
  }

  private async sendOffer(): Promise<void> {
    if (!this.peerConnection) return;
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      await this.signalrService.sendVideoSignal(this.appointmentId, JSON.stringify(offer));
    } catch {
      this.snackBar.open('Failed to establish connection.', 'OK', { duration: 4000 });
    }
  }

  cancelCall(): void {
    this.stopRingtone();
    this.stopTimer();
    this.localStream?.getTracks().forEach(t => t.stop());
    this.peerConnection?.close();
    this.peerConnection = undefined;
    this.callState = 'idle';
    this.callDuration = '00:00';
    if (this.appointmentId) {
      this.signalrService.leaveVideoRoom(this.appointmentId);
    }
  }

  async acceptCall(): Promise<void> {
    this.stopRingtone();
    this.callState = 'connected';

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err: any) {
      this.snackBar.open('Could not access camera/microphone.', 'OK', { duration: 4000 });
      this.callState = 'idle';
      return;
    }

    this.setupPeerConnection();

    if (this.pendingOffer) {
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(this.pendingOffer));
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      await this.signalrService.sendVideoSignal(this.appointmentId, JSON.stringify(answer));
      this.pendingOffer = undefined;
    }
    this.startTimer();
    this.attachStreamsToView();
  }

  rejectCall(): void {
    this.stopRingtone();
    this.callState = 'idle';
    this.pendingOffer = undefined;
    if (this.appointmentId) {
      this.signalrService.leaveVideoRoom(this.appointmentId);
    }
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
  }

  endCall(): void {
    this.stopRingtone();
    this.stopTimer();
    this.localStream?.getTracks().forEach(t => t.stop());
    this.peerConnection?.close();
    this.peerConnection = undefined;
    this.callState = 'idle';
    this.remoteConnected = false;
    this.callDuration = '00:00';
    this.callSeconds = 0;
    if (this.appointmentId) {
      this.signalrService.leaveVideoRoom(this.appointmentId);
    }
  }

  // ===== WebRTC Setup =====
  private setupPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    this.localStream!.getTracks().forEach(track => this.peerConnection!.addTrack(track, this.localStream!));

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.remoteConnected = true;
      this.attachStreamsToView();
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.appointmentId) {
        this.signalrService.sendIceCandidate(this.appointmentId, JSON.stringify(event.candidate));
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === 'connected') {
        this.callState = 'connected';
        this.stopRingtone();
        this.remoteConnected = true;
        this.attachStreamsToView();
      } else if (this.peerConnection?.connectionState === 'disconnected' || this.peerConnection?.connectionState === 'failed') {
        this.endCall();
        this.snackBar.open('Call disconnected.', 'OK', { duration: 3000 });
      }
    };
  }

  private attachStreamsToView(): void {
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.localVideoEl && this.localStream) {
        this.localVideoEl.nativeElement.srcObject = this.localStream;
      }
      if (this.remoteVideoEl && this.remoteStream) {
        this.remoteVideoEl.nativeElement.srcObject = this.remoteStream;
      }
    });
  }
}
