import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private chatConnection?: signalR.HubConnection;
  private notificationConnection?: signalR.HubConnection;
  private videoConnection?: signalR.HubConnection;
  private connecting = false;
  private connected = false;

  messageReceived$ = new Subject<any>();
  notificationReceived$ = new Subject<any>();
  userJoinedVideo$ = new Subject<string>();
  userLeftVideo$ = new Subject<string>();
  signalReceived$ = new Subject<{ userId: string; signal: string }>();
  iceCandidateReceived$ = new Subject<{ userId: string; candidate: string }>();

  constructor(private authService: AuthService, private ngZone: NgZone) {}

  async startConnections(): Promise<void> {
    const token = this.authService.getToken();
    if (!token || this.connecting) return;
    if (this.connected && this.chatConnection?.state === signalR.HubConnectionState.Connected) return;

    this.connecting = true;
    try {
      // Stop any existing connections first
      if (this.chatConnection || this.notificationConnection || this.videoConnection) {
        await this.ngZone.runOutsideAngular(async () => {
          try { await this.chatConnection?.stop(); } catch {}
          try { await this.notificationConnection?.stop(); } catch {}
          try { await this.videoConnection?.stop(); } catch {}
        });
        this.chatConnection = undefined;
        this.notificationConnection = undefined;
        this.videoConnection = undefined;
      }

      // Run SignalR outside Angular zone to prevent zone interference with change detection
      await this.ngZone.runOutsideAngular(async () => {
        // Chat Hub
        this.chatConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${environment.hubUrl}/chat`, { accessTokenFactory: () => token })
          .withAutomaticReconnect()
          .build();

        this.chatConnection.on('ReceiveMessage', (message) => {
          this.ngZone.run(() => this.messageReceived$.next(message));
        });

        // Notification Hub
        this.notificationConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${environment.hubUrl}/notification`, { accessTokenFactory: () => token })
          .withAutomaticReconnect()
          .build();

        this.notificationConnection.on('ReceiveNotification', (notification) => {
          this.ngZone.run(() => this.notificationReceived$.next(notification));
        });

        // Video Hub
        this.videoConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${environment.hubUrl}/video`, { accessTokenFactory: () => token })
          .withAutomaticReconnect()
          .build();

        this.videoConnection.on('UserJoined', (userId) => this.ngZone.run(() => this.userJoinedVideo$.next(userId)));
        this.videoConnection.on('UserLeft', (userId) => this.ngZone.run(() => this.userLeftVideo$.next(userId)));
        this.videoConnection.on('ReceiveSignal', (userId, signal) => this.ngZone.run(() => this.signalReceived$.next({ userId, signal })));
        this.videoConnection.on('ReceiveIceCandidate', (userId, candidate) => this.ngZone.run(() => this.iceCandidateReceived$.next({ userId, candidate })));

        try { await this.chatConnection.start(); } catch (e) { console.warn('Chat hub connection failed:', e); }
        try { await this.notificationConnection.start(); } catch (e) { console.warn('Notification hub connection failed:', e); }
        try { await this.videoConnection.start(); } catch (e) { console.warn('Video hub connection failed:', e); }
      });
      this.connected = true;
    } catch {
      this.connected = false;
    } finally {
      this.connecting = false;
    }
  }

  async joinVideoRoom(appointmentId: string): Promise<void> {
    await this.videoConnection?.invoke('JoinVideoRoom', appointmentId);
  }

  async leaveVideoRoom(appointmentId: string): Promise<void> {
    await this.videoConnection?.invoke('LeaveVideoRoom', appointmentId);
  }

  async sendVideoSignal(appointmentId: string, signal: string): Promise<void> {
    await this.videoConnection?.invoke('SendSignal', appointmentId, signal);
  }

  async sendIceCandidate(appointmentId: string, candidate: string): Promise<void> {
    await this.videoConnection?.invoke('SendIceCandidate', appointmentId, candidate);
  }

  async stopConnections(): Promise<void> {
    this.connected = false;
    await this.ngZone.runOutsideAngular(async () => {
      try { await this.chatConnection?.stop(); } catch {}
      try { await this.notificationConnection?.stop(); } catch {}
      try { await this.videoConnection?.stop(); } catch {}
    });
    this.chatConnection = undefined;
    this.notificationConnection = undefined;
    this.videoConnection = undefined;
  }
}
