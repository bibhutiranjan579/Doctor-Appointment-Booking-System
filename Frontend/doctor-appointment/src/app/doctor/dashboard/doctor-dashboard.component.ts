import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, timeout, catchError, of } from 'rxjs';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/models';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule,
    SidebarComponent, TopNavbarComponent, StatCardComponent, StatusBadgeComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="doctor" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Doctor Dashboard" theme="doctor" [userName]="authService.currentUser?.name || ''" userRole="Doctor" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <!-- Stats -->
          <div class="stats-row">
            <app-stat-card label="Total Appointments" [value]="appointments.length" icon="calendar_today" color="#1b7a5a" [loading]="loading"></app-stat-card>
            <app-stat-card label="Pending Requests" [value]="pendingCount" icon="pending_actions" color="#e65100" [loading]="loading"></app-stat-card>
            <app-stat-card label="Approved" [value]="approvedCount" icon="check_circle" color="#2e7d32" [loading]="loading"></app-stat-card>
            <app-stat-card label="Completed" [value]="completedCount" icon="task_alt" color="#1565c0" [loading]="loading"></app-stat-card>
          </div>

          <!-- Pending Requests Section -->
          @if (pendingAppointments.length > 0) {
            <div class="section">
              <h3 class="section-title"><mat-icon>pending_actions</mat-icon> Pending Requests</h3>
              <div class="cards-grid">
                @for (a of pendingAppointments; track a.id) {
                  <div class="appointment-card appointment-card--pending">
                    <div class="appointment-card__header">
                      <div class="patient-info">
                        <div class="patient-avatar">{{ a.patientName?.charAt(0) }}</div>
                        <div>
                          <h4>{{ a.patientName }}</h4>
                          <span class="date">{{ a.appointmentDate | date:'MMM d, y, h:mm a' }}</span>
                        </div>
                      </div>
                      <app-status-badge [status]="a.status"></app-status-badge>
                    </div>
                    @if (a.notes) {
                      <p class="notes"><mat-icon class="notes-icon">notes</mat-icon> {{ a.notes }}</p>
                    }
                    <div class="appointment-card__actions">
                      <button mat-raised-button class="approve-btn" (click)="updateStatus(a.id, 1)">
                        <mat-icon>check</mat-icon> Approve
                      </button>
                      <button mat-raised-button class="reject-btn" (click)="updateStatus(a.id, 2)">
                        <mat-icon>close</mat-icon> Reject
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Upcoming Appointments Section -->
          <div class="section">
            <h3 class="section-title"><mat-icon>event</mat-icon> Upcoming Appointments</h3>
            <div class="cards-grid">
              @for (a of approvedAppointments; track a.id) {
                <div class="appointment-card appointment-card--approved">
                  <div class="appointment-card__header">
                    <div class="patient-info">
                      <div class="patient-avatar patient-avatar--green">{{ a.patientName?.charAt(0) }}</div>
                      <div>
                        <h4>{{ a.patientName }}</h4>
                        <span class="date">{{ a.appointmentDate | date:'MMM d, y, h:mm a' }}</span>
                      </div>
                    </div>
                    <app-status-badge [status]="a.status"></app-status-badge>
                  </div>
                  @if (a.notes) {
                    <p class="notes"><mat-icon class="notes-icon">notes</mat-icon> {{ a.notes }}</p>
                  }
                  <div class="appointment-card__actions">
                    <button mat-raised-button class="complete-btn" (click)="updateStatus(a.id, 3)">
                      <mat-icon>task_alt</mat-icon> Complete
                    </button>
                    <button mat-raised-button class="video-btn" routerLink="/doctor/video-call" [queryParams]="{appointmentId: a.id}">
                      <mat-icon>videocam</mat-icon> Video Call
                    </button>
                    <button mat-raised-button class="chat-btn" routerLink="/doctor/chat">
                      <mat-icon>chat</mat-icon> Chat
                    </button>
                  </div>
                </div>
              }
              @if (approvedAppointments.length === 0 && !loading) {
                <div class="empty-state">
                  <mat-icon>event_busy</mat-icon>
                  <p>No upcoming appointments</p>
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

    .stats-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px; margin-bottom: 28px;
    }

    .section { margin-bottom: 28px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 16px;
    }
    .section-title mat-icon { color: #1b7a5a; }

    .cards-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px;
    }

    .appointment-card {
      background: #fff; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border-left: 4px solid transparent;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .appointment-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    .appointment-card--pending { border-left-color: #e65100; }
    .appointment-card--approved { border-left-color: #2e7d32; }

    .appointment-card__header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
    }
    .patient-info { display: flex; gap: 12px; align-items: center; }
    .patient-avatar {
      width: 44px; height: 44px; border-radius: 50%; background: #5b3a9e;
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px;
    }
    .patient-avatar--green { background: #1b7a5a; }
    .patient-info h4 { margin: 0; font-size: 15px; font-weight: 600; color: #1a1a2e; }
    .date { font-size: 12px; color: #888; }

    .notes {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: #666; background: #f8f9fc;
      padding: 8px 12px; border-radius: 8px; margin: 0 0 12px;
    }
    .notes-icon { font-size: 16px; width: 16px; height: 16px; color: #888; }

    .appointment-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .approve-btn { background: #2e7d32 !important; color: #fff !important; font-size: 13px; }
    .reject-btn { background: #c62828 !important; color: #fff !important; font-size: 13px; }
    .complete-btn { background: #1565c0 !important; color: #fff !important; font-size: 13px; }
    .video-btn { background: #1b7a5a !important; color: #fff !important; font-size: 13px; }
    .chat-btn { background: #5b3a9e !important; color: #fff !important; font-size: 13px; }

    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 60px; color: #aaa;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/doctor/dashboard' },
    { label: 'Feedback', icon: 'rate_review', route: '/doctor/feedback' },
    { label: 'Chat', icon: 'chat', route: '/doctor/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/doctor/video-call' },
    { label: 'Profile', icon: 'person', route: '/doctor/profile' },
  ];

  appointments: Appointment[] = [];
  loading = true;

  constructor(
    public authService: AuthService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadAppointments(); }

  get pendingAppointments(): Appointment[] { return this.appointments.filter(a => a.status === 0); }
  get approvedAppointments(): Appointment[] { return this.appointments.filter(a => a.status === 1); }
  get pendingCount(): number { return this.pendingAppointments.length; }
  get approvedCount(): number { return this.approvedAppointments.length; }
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

  updateStatus(id: string, status: number): void {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        this.loadAppointments();
        const labels = ['', 'Approved', 'Rejected', 'Completed'];
        this.snackBar.open(`Appointment ${labels[status]}`, 'Close', { duration: 2000 });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
    });
  }
}
