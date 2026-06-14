import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { SignalrService } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-incoming-call',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    @if (showIncoming) {
      <div class="incoming-call-overlay">
        <div class="incoming-call-card">
          <div class="call-pulse-wrap">
            <div class="call-pulse"></div>
            <div class="call-pulse delay"></div>
            <div class="caller-avatar">
              <mat-icon>person</mat-icon>
            </div>
          </div>
          <h3>Incoming Video Call</h3>
          <p class="caller-name">{{ callerName }}</p>
          <p class="call-status">is calling you...</p>
          <div class="call-actions">
            <button mat-fab class="reject-btn" (click)="reject()">
              <mat-icon>call_end</mat-icon>
            </button>
            <button mat-fab class="accept-btn" (click)="accept()">
              <mat-icon>videocam</mat-icon>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .incoming-call-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .incoming-call-card {
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 24px; padding: 48px 40px; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      min-width: 320px; max-width: 400px;
    }

    .call-pulse-wrap {
      position: relative; width: 110px; height: 110px;
      margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;
    }
    .call-pulse {
      position: absolute; inset: 0; border-radius: 50%;
      border: 3px solid #4caf50; animation: pulseExpand 1.5s ease-out infinite; opacity: 0;
    }
    .call-pulse.delay { animation-delay: 0.75s; }
    @keyframes pulseExpand { 0% { transform: scale(0.7); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }

    .caller-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, #4caf50, #2e7d32);
      display: flex; align-items: center; justify-content: center;
    }
    .caller-avatar mat-icon { font-size: 40px; width: 40px; height: 40px; color: #fff; }

    h3 { color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 400; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px; }
    .caller-name { color: #fff; font-size: 22px; font-weight: 600; margin: 0 0 4px; }
    .call-status { color: rgba(255,255,255,0.5); font-size: 14px; margin: 0 0 32px; }

    .call-actions { display: flex; justify-content: center; gap: 48px; }
    .reject-btn { background: #e53935 !important; color: #fff !important; width: 64px !important; height: 64px !important; }
    .accept-btn { background: #4caf50 !important; color: #fff !important; width: 64px !important; height: 64px !important; animation: shake 0.4s ease-in-out infinite alternate; }
    @keyframes shake { 0% { transform: rotate(-3deg) scale(1); } 100% { transform: rotate(3deg) scale(1.05); } }

    @media (max-width: 480px) {
      .incoming-call-card { padding: 36px 24px; min-width: 280px; }
      .call-actions { gap: 32px; }
    }
  `]
})
export class IncomingCallComponent implements OnInit, OnDestroy {
  showIncoming = false;
  callerName = '';
  private roomId = '';
  private callerId = '';
  private subscriptions: Subscription[] = [];
  private ringtoneCtx?: AudioContext;
  private ringtoneInterval?: any;
  private oscillator?: OscillatorNode;

  constructor(
    private signalrService: SignalrService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.signalrService.incomingCall$.subscribe(({ callerId, callerName, roomId }) => {
        // Don't show if already on video-call page
        if (this.router.url.includes('/video-call')) return;
        // Don't show if already showing an incoming call
        if (this.showIncoming) return;
        this.callerName = callerName;
        this.roomId = roomId;
        this.callerId = callerId;
        this.showIncoming = true;
        this.playRingtone();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.stopRingtone();
  }

  accept(): void {
    this.stopRingtone();
    this.showIncoming = false;
    // Tell the caller we accepted
    this.signalrService.respondToCall(this.roomId, true, this.callerId).catch(() => {});
    // Navigate to video-call page with room ID
    const role = this.authService.currentUser?.role === 'Doctor' ? 'doctor' : 'patient';
    this.router.navigate([`/${role}/video-call`], {
      queryParams: { appointmentId: this.roomId, receiverId: this.callerId }
    });
  }

  reject(): void {
    this.stopRingtone();
    this.showIncoming = false;
    this.signalrService.respondToCall(this.roomId, false, this.callerId).catch(() => {});
  }

  private playRingtone(): void {
    try {
      this.ringtoneCtx = new AudioContext();
      const gain = this.ringtoneCtx.createGain();
      gain.gain.value = 0.25;
      gain.connect(this.ringtoneCtx.destination);

      const playTone = () => {
        if (!this.ringtoneCtx || !this.showIncoming) return;
        this.oscillator = this.ringtoneCtx.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = 440;
        this.oscillator.connect(gain);
        this.oscillator.start();
        setTimeout(() => {
          this.oscillator?.stop();
          if (!this.ringtoneCtx || !this.showIncoming) return;
          setTimeout(() => {
            if (!this.ringtoneCtx || !this.showIncoming) return;
            const osc2 = this.ringtoneCtx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = 554;
            osc2.connect(gain);
            osc2.start();
            setTimeout(() => osc2.stop(), 400);
          }, 200);
        }, 400);
      };
      playTone();
      this.ringtoneInterval = setInterval(playTone, 2500);
    } catch {}
  }

  private stopRingtone(): void {
    if (this.ringtoneInterval) { clearInterval(this.ringtoneInterval); this.ringtoneInterval = undefined; }
    try { this.oscillator?.stop(); } catch {}
    if (this.ringtoneCtx) { this.ringtoneCtx.close(); this.ringtoneCtx = undefined; }
  }
}
