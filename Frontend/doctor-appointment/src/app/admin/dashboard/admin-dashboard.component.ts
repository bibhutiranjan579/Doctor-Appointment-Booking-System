import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { forkJoin, finalize, timeout, catchError, of } from 'rxjs';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AuthService } from '../../core/services/auth.service';
import { DoctorService } from '../../core/services/doctor.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { HospitalService } from '../../core/services/hospital.service';
import { PatientService } from '../../core/services/patient.service';
import { Appointment, ApiResponse, Doctor, Hospital, Patient, PagedResult } from '../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatSnackBarModule, MatIconModule, MatButtonModule,
    NgxChartsModule, SidebarComponent, TopNavbarComponent, StatCardComponent, StatusBadgeComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="admin" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar
          title="Admin Dashboard"
          theme="admin"
          [userName]="userName"
          userRole="Administrator"
          (logoutClicked)="authService.logout()">
        </app-top-navbar>

        <div class="dashboard-content">
          <!-- Stats Row -->
          <div class="stats-row">
            <app-stat-card label="Total Doctors" [value]="totalDoctors" icon="medical_services" color="#1b7a5a" [loading]="loading"></app-stat-card>
            <app-stat-card label="Total Patients" [value]="totalPatients" icon="people" color="#5b3a9e" [loading]="loading"></app-stat-card>
            <app-stat-card label="Total Appointments" [value]="totalAppointments" icon="calendar_today" color="#e65100" [loading]="loading"></app-stat-card>
            <app-stat-card label="Hospitals" [value]="totalHospitals" icon="local_hospital" color="#1b3a7b" [loading]="loading"></app-stat-card>
          </div>

          <!-- Charts Row -->
          <div class="charts-row">
            <div class="chart-card">
              <h3>Appointment Status Overview</h3>
              <ngx-charts-pie-chart
                [results]="appointmentStatusData"
                [view]="[480, 300]"
                [gradient]="true"
                [legend]="true"
                [legendTitle]="''"
                [legendPosition]="legendPosition"
                [labels]="true"
                [doughnut]="true"
                [scheme]="pieColorScheme">
              </ngx-charts-pie-chart>
            </div>
            <div class="chart-card">
              <h3>Monthly Appointments</h3>
              <ngx-charts-bar-vertical
                [results]="monthlyData"
                [view]="[500, 280]"
                [xAxis]="true"
                [yAxis]="true"
                [gradient]="true"
                [scheme]="barColorScheme">
              </ngx-charts-bar-vertical>
            </div>
          </div>

          <!-- Recent Appointments Table -->
          <div class="table-card">
            <div class="table-header">
              <h3>Recent Appointments</h3>
              <a mat-button color="primary" routerLink="/admin/appointments">View All</a>
            </div>
            <div class="table-wrapper">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of recentAppointments; track a.id) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div class="user-avatar user-avatar--patient">{{ a.patientName?.charAt(0) }}</div>
                          <span>{{ a.patientName }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="user-cell">
                          <div class="user-avatar user-avatar--doctor">{{ a.doctorName?.charAt(0) }}</div>
                          <span>Dr. {{ a.doctorName }}</span>
                        </div>
                      </td>
                      <td>{{ a.specialization }}</td>
                      <td>{{ a.appointmentDate | date:'MMM d, y' }}</td>
                      <td><app-status-badge [status]="a.status"></app-status-badge></td>
                    </tr>
                  }
                  @if (recentAppointments.length === 0 && !loading) {
                    <tr><td colspan="5" class="empty-row">No appointments found</td></tr>
                  }
                </tbody>
              </table>
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    .chart-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .chart-card h3 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .table-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .table-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .table-wrapper { overflow-x: auto; }
    .custom-table {
      width: 100%;
      border-collapse: collapse;
    }
    .custom-table th {
      text-align: left;
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
      border-bottom: 2px solid #f0f0f0;
    }
    .custom-table td {
      padding: 14px 16px;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid #f5f5f5;
    }
    .custom-table tbody tr {
      transition: background 0.15s ease;
    }
    .custom-table tbody tr:hover {
      background: #f8f9fc;
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      color: #fff;
    }
    .user-avatar--patient { background: #5b3a9e; }
    .user-avatar--doctor { background: #1b7a5a; }
    .empty-row {
      text-align: center;
      color: #aaa;
      padding: 40px 0 !important;
    }

    @media (max-width: 1024px) {
      .charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; }
      .stats-row { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: 'medical_services', route: '/admin/manage-doctors' },
    { label: 'Manage Hospitals', icon: 'local_hospital', route: '/admin/manage-hospitals' },
    { label: 'Appointments', icon: 'calendar_today', route: '/admin/appointments' },
    { label: 'Feedback', icon: 'rate_review', route: '/admin/feedback' },
    { label: 'Manage Users', icon: 'group', route: '/admin/manage-users' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' },
  ];

  userName = '';
  loading = true;
  totalDoctors = 0;
  totalPatients = 0;
  totalAppointments = 0;
  totalHospitals = 0;
  recentAppointments: Appointment[] = [];

  appointmentStatusData: any[] = [];
  monthlyData: any[] = [];

  pieColorScheme: any = { domain: ['#e65100', '#2e7d32', '#c62828', '#1565c0'] };
  barColorScheme: any = { domain: ['#1b3a7b'] };
  legendPosition = LegendPosition.Below;

  constructor(
    public authService: AuthService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private hospitalService: HospitalService,
    private patientService: PatientService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.userName = this.authService.currentUser?.name || '';
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    forkJoin({
      doctors: this.doctorService.getAll().pipe(catchError(() => of({ success: false, data: [] as any, message: '' }))),
      hospitals: this.hospitalService.getAll().pipe(catchError(() => of({ success: false, data: [] as any, message: '' }))),
      patients: this.patientService.getAll().pipe(catchError(() => of({ success: false, data: [] as any, message: '' }))),
      appointments: this.appointmentService.getAll(1, 1000).pipe(catchError(() => of({ success: false, data: { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 } as any, message: '' })))
    }).pipe(
      timeout(15000),
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: ({ doctors, hospitals, patients, appointments }) => {
        if (doctors.success && doctors.data) this.totalDoctors = Array.isArray(doctors.data) ? doctors.data.length : 0;
        if (hospitals.success && hospitals.data) this.totalHospitals = Array.isArray(hospitals.data) ? hospitals.data.length : 0;
        if (patients.success && patients.data) this.totalPatients = Array.isArray(patients.data) ? patients.data.length : 0;
        if (appointments.success && appointments.data) {
          const items: Appointment[] = appointments.data.items || [];
          this.totalAppointments = appointments.data.totalCount || items.length;
          this.recentAppointments = items.slice(0, 8);

          // Pie chart - status counts
          const statusCounts = [0, 0, 0, 0];
          items.forEach((a: Appointment) => { if (a.status >= 0 && a.status <= 3) statusCounts[a.status]++; });
          this.appointmentStatusData = [
            { name: 'Pending', value: statusCounts[0] || 0 },
            { name: 'Approved', value: statusCounts[1] || 0 },
            { name: 'Rejected', value: statusCounts[2] || 0 },
            { name: 'Completed', value: statusCounts[3] || 0 },
          ];

          // Bar chart - monthly appointments from real data
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthlyCounts: { [key: string]: number } = {};
          items.forEach((a: Appointment) => {
            const d = new Date(a.appointmentDate);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            monthlyCounts[label] = (monthlyCounts[label] || 0) + 1;
          });
          this.monthlyData = Object.entries(monthlyCounts)
            .map(([name, value]) => ({ name, value }))
            .slice(-6);
          if (this.monthlyData.length === 0) {
            this.monthlyData = [{ name: 'No data', value: 0 }];
          }
        }
        this.cdr.detectChanges();
      }
    });
  }
}
