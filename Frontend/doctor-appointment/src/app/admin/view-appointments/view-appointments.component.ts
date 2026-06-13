import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/models';

@Component({
  selector: 'app-view-appointments',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule, MatSnackBarModule, MatTooltipModule,
    SidebarComponent, TopNavbarComponent, StatusBadgeComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="admin" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="All Appointments" theme="admin" [userName]="authService.currentUser?.name || ''" userRole="Administrator" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <!-- Filters -->
          <div class="filters-bar">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadAppointments()">
                <mat-option [value]="-1">All</mat-option>
                <mat-option [value]="0">Pending</mat-option>
                <mat-option [value]="1">Approved</mat-option>
                <mat-option [value]="2">Rejected</mat-option>
                <mat-option [value]="3">Completed</mat-option>
              </mat-select>
            </mat-form-field>
            <span class="total-label">Total: {{ totalCount }} appointments</span>
          </div>

          <div class="table-card">
            <div class="table-wrapper">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Date & Time</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of appointments; track a.id) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div class="avatar avatar--purple">{{ a.patientName?.charAt(0) }}</div>
                          <span>{{ a.patientName }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="user-cell">
                          <div class="avatar avatar--green">{{ a.doctorName?.charAt(0) }}</div>
                          <span>Dr. {{ a.doctorName }}</span>
                        </div>
                      </td>
                      <td>{{ a.specialization }}</td>
                      <td>{{ a.appointmentDate | date:'MMM d, y, h:mm a' }}</td>
                      <td>
                        @if (a.payment) {
                          <div class="payment-info">
                            <span class="payment-amount">₹{{ a.payment.amount }}</span>
                            <span class="payment-method">{{ a.payment.paymentMethod }}</span>
                          </div>
                        } @else {
                          <span class="no-payment">—</span>
                        }
                      </td>
                      <td><app-status-badge [status]="a.status"></app-status-badge></td>
                      <td>
                        <div class="action-btns">
                          @if (a.status === 0) {
                            <button mat-icon-button class="approve-btn" matTooltip="Approve" (click)="updateStatus(a.id, 1)">
                              <mat-icon>check_circle</mat-icon>
                            </button>
                            <button mat-icon-button class="reject-btn" matTooltip="Reject" (click)="updateStatus(a.id, 2)">
                              <mat-icon>cancel</mat-icon>
                            </button>
                          }
                          @if (a.status === 1) {
                            <button mat-icon-button class="complete-btn" matTooltip="Mark Completed" (click)="updateStatus(a.id, 3)">
                              <mat-icon>task_alt</mat-icon>
                            </button>
                            <button mat-icon-button class="reject-btn" matTooltip="Cancel" (click)="updateStatus(a.id, 2)">
                              <mat-icon>cancel</mat-icon>
                            </button>
                          }
                          @if (a.status === 2 || a.status === 3) {
                            <span class="no-action">—</span>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                  @if (appointments.length === 0) {
                    <tr><td colspan="7" class="empty-row">No appointments found</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            @if (totalPages > 1) {
              <div class="pagination">
                <button mat-icon-button [disabled]="page <= 1" (click)="goToPage(page - 1)"><mat-icon>chevron_left</mat-icon></button>
                @for (p of pageNumbers; track p) {
                  <button mat-button [class.active-page]="p === page" (click)="goToPage(p)">{{ p }}</button>
                }
                <button mat-icon-button [disabled]="page >= totalPages" (click)="goToPage(page + 1)"><mat-icon>chevron_right</mat-icon></button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
    .dashboard-main { flex: 1; margin-left: 260px; }
    .dashboard-content { padding: 88px 32px 32px; }

    .filters-bar {
      display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
    }
    .filter-field { width: 200px; }
    .total-label { font-size: 14px; color: #666; font-weight: 500; }

    .table-card {
      background: #fff; border-radius: 12px; padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .table-wrapper { overflow-x: auto; }
    .custom-table { width: 100%; border-collapse: collapse; }
    .custom-table th {
      text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; color: #888;
      border-bottom: 2px solid #f0f0f0;
    }
    .custom-table td {
      padding: 14px 16px; font-size: 14px; color: #333;
      border-bottom: 1px solid #f5f5f5;
    }
    .custom-table tbody tr { transition: background 0.15s ease; }
    .custom-table tbody tr:hover { background: #f8f9fc; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px; color: #fff;
    }
    .avatar--purple { background: #5b3a9e; }
    .avatar--green { background: #1b7a5a; }
    .empty-row { text-align: center; color: #aaa; padding: 40px 0 !important; }

    .payment-info { display: flex; flex-direction: column; }
    .payment-amount { font-weight: 600; color: #2e7d32; }
    .payment-method { font-size: 12px; color: #888; }
    .no-payment { color: #ccc; }

    .action-btns { display: flex; gap: 2px; }
    .approve-btn { color: #2e7d32; }
    .reject-btn { color: #c62828; }
    .complete-btn { color: #1565c0; }
    .no-action { color: #ccc; padding: 8px; }

    .pagination {
      display: flex; justify-content: center; align-items: center; gap: 4px;
      margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0;
    }
    .active-page { background: #1b3a7b !important; color: #fff !important; border-radius: 8px !important; }
  `]
})
export class ViewAppointmentsComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: 'medical_services', route: '/admin/manage-doctors' },
    { label: 'Manage Hospitals', icon: 'local_hospital', route: '/admin/manage-hospitals' },
    { label: 'Appointments', icon: 'calendar_today', route: '/admin/appointments' },
    { label: 'Feedback', icon: 'rate_review', route: '/admin/feedback' },
    { label: 'Manage Users', icon: 'group', route: '/admin/manage-users' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' },
  ];

  appointments: Appointment[] = [];
  statusFilter = -1;
  page = 1;
  pageSize = 15;
  totalCount = 0;
  totalPages = 0;

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  constructor(
    public authService: AuthService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const status = this.statusFilter >= 0 ? this.statusFilter : undefined;
    this.appointmentService.getAll(this.page, this.pageSize, status).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.appointments = res.data.items || [];
          this.totalCount = res.data.totalCount || 0;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        }
        this.cdr.detectChanges();
      },
      error: () => { this.appointments = []; this.cdr.detectChanges(); }
    });
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadAppointments();
  }

  updateStatus(id: string, status: number): void {
    const labels = ['Pending', 'Approved', 'Rejected', 'Completed'];
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        this.snackBar.open(`Appointment ${labels[status]}`, 'Close', { duration: 2000 });
        this.loadAppointments();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed to update', 'Close', { duration: 3000 })
    });
  }
}
