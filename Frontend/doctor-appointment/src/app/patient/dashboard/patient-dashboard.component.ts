import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription, finalize, timeout, catchError, of } from 'rxjs';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { SignalrService } from '../../core/services/signalr.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/models';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatBadgeModule,
    SidebarComponent, TopNavbarComponent, StatCardComponent, StatusBadgeComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="patient" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar
          title="Patient Dashboard"
          theme="patient"
          [userName]="authService.currentUser?.name || ''"
          userRole="Patient"
          [notificationCount]="notifications.length"
          (logoutClicked)="authService.logout()">
        </app-top-navbar>

        <div class="dashboard-content">
          <!-- Notifications -->
          @if (notifications.length > 0) {
            <div class="notification-banner">
              <mat-icon>notifications_active</mat-icon>
              <div class="notification-list">
                @for (n of notifications; track n) {
                  <span>{{ n }}</span>
                }
              </div>
              <button mat-icon-button (click)="notifications = []"><mat-icon>close</mat-icon></button>
            </div>
          }

          <!-- Stats -->
          <div class="stats-row">
            <app-stat-card label="Total Appointments" [value]="appointments.length" icon="calendar_today" color="#5b3a9e" [loading]="loading"></app-stat-card>
            <app-stat-card label="Pending" [value]="pendingCount" icon="hourglass_empty" color="#e65100" [loading]="loading"></app-stat-card>
            <app-stat-card label="Approved" [value]="approvedCount" icon="check_circle" color="#2e7d32" [loading]="loading"></app-stat-card>
            <app-stat-card label="Completed" [value]="completedCount" icon="task_alt" color="#1565c0" [loading]="loading"></app-stat-card>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button mat-raised-button class="action-btn action-btn--primary" routerLink="/patient/search-doctors">
              <mat-icon>search</mat-icon> Find Doctors
            </button>
            <button mat-raised-button class="action-btn action-btn--chat" routerLink="/patient/chat">
              <mat-icon>chat</mat-icon> Chat
            </button>
          </div>

          <!-- My Appointments -->
          <div class="section">
            <h3 class="section-title"><mat-icon>calendar_today</mat-icon> My Appointments</h3>
            <div class="appointment-list">
              @for (a of appointments; track a.id) {
                <div class="appointment-row">
                  <div class="appointment-row__left">
                    <div class="doctor-avatar">{{ a.doctorName?.charAt(0) }}</div>
                    <div class="appointment-info">
                      <h4>Dr. {{ a.doctorName }}</h4>
                      <span class="specialization">{{ a.specialization }}</span>
                      <span class="date"><mat-icon class="date-icon">schedule</mat-icon> {{ a.appointmentDate | date:'MMM d, y, h:mm a' }}</span>
                    </div>
                  </div>
                  <div class="appointment-row__right">
                    <app-status-badge [status]="a.status"></app-status-badge>
                    @if (a.status === 1) {
                      <button mat-raised-button class="video-btn" routerLink="/patient/video-call" [queryParams]="{appointmentId: a.id}">
                        <mat-icon>videocam</mat-icon> Join Call
                      </button>
                    }
                  </div>
                </div>
              }
              @if (appointments.length === 0 && !loading) {
                <div class="empty-state">
                  <mat-icon>event_busy</mat-icon>
                  <p>No appointments yet.</p>
                  <button mat-raised-button class="action-btn action-btn--primary" routerLink="/patient/search-doctors">
                    Book Your First Appointment
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
    .dashboard-main { flex: 1; margin-left: 260px; }
    .dashboard-content { padding: 88px 32px 32px; }

    .notification-banner {
      display: flex; align-items: center; gap: 12px;
      background: linear-gradient(135deg, #fff3e0, #ffe0b2); padding: 12px 16px;
      border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #e65100;
    }
    .notification-banner mat-icon { color: #e65100; }
    .notification-list { flex: 1; display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #333; }

    .stats-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px; margin-bottom: 24px;
    }

    .quick-actions { display: flex; gap: 12px; margin-bottom: 28px; }
    .action-btn {
      height: 44px; border-radius: 10px !important; display: flex;
      align-items: center; gap: 8px; font-weight: 600;
    }
    .action-btn--primary { background: #5b3a9e !important; color: #fff !important; }
    .action-btn--chat { background: #1b7a5a !important; color: #fff !important; }

    .section { margin-bottom: 28px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 16px;
    }
    .section-title mat-icon { color: #5b3a9e; }

    .appointment-list { display: flex; flex-direction: column; gap: 12px; }
    .appointment-row {
      background: #fff; border-radius: 12px; padding: 16px 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      display: flex; justify-content: space-between; align-items: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .appointment-row:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .appointment-row__left { display: flex; gap: 14px; align-items: center; }
    .doctor-avatar {
      width: 48px; height: 48px; border-radius: 50%; background: #1b7a5a;
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 20px;
    }
    .appointment-info h4 { margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #1a1a2e; }
    .specialization { font-size: 12px; color: #1b7a5a; font-weight: 600; }
    .date { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #888; margin-top: 4px; }
    .date-icon { font-size: 14px; width: 14px; height: 14px; }
    .appointment-row__right { display: flex; align-items: center; gap: 12px; }
    .video-btn { background: #1b7a5a !important; color: #fff !important; font-size: 12px; }

    .empty-state {
      text-align: center; padding: 60px; color: #aaa;
      background: #fff; border-radius: 12px;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
  `]
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctors', icon: 'search', route: '/patient/search-doctors' },
    { label: 'Feedback', icon: 'rate_review', route: '/patient/feedback' },
    { label: 'Chat', icon: 'chat', route: '/patient/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/patient/video-call' },
    { label: 'Profile', icon: 'person', route: '/patient/profile' },
  ];

  appointments: Appointment[] = [];
  notifications: string[] = [];
  loading = true;
  private subscription?: Subscription;

  constructor(
    public authService: AuthService,
    private appointmentService: AppointmentService,
    private signalrService: SignalrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.subscription = this.signalrService.notificationReceived$.subscribe((n: any) => {
      this.notifications.unshift(n.message);
      this.loadAppointments();
    });
  }

  ngOnDestroy(): void { this.subscription?.unsubscribe(); }

  get pendingCount(): number { return this.appointments.filter(a => a.status === 0).length; }
  get approvedCount(): number { return this.appointments.filter(a => a.status === 1).length; }
  get completedCount(): number { return this.appointments.filter(a => a.status === 3).length; }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getMyAppointments().pipe(
      timeout(10000),
      catchError(() => of({ success: false, message: 'Error', data: [] as any })),
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res) => {
        this.appointments = res.success ? (res.data || []) : [];
        this.cdr.detectChanges();
      }
    });
  }
}
