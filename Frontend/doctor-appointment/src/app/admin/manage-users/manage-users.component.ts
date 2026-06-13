import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule,
    SidebarComponent, TopNavbarComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="admin" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Manage Users" theme="admin" [userName]="authService.currentUser?.name || ''" userRole="Administrator" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <!-- Filters -->
          <div class="filters-bar">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Role</mat-label>
              <mat-select [(ngModel)]="roleFilter" (selectionChange)="applyFilter()">
                <mat-option value="all">All Roles</mat-option>
                <mat-option value="Admin">Admin</mat-option>
                <mat-option value="Doctor">Doctor</mat-option>
                <mat-option value="Patient">Patient</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search by name or email</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [(ngModel)]="searchQuery" (input)="applyFilter()">
            </mat-form-field>
            <span class="total-label">{{ filteredUsers.length }} of {{ allUsers.length }} users</span>
          </div>

          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-chip">
              <mat-icon>people</mat-icon>
              <div><span class="stat-num">{{ allUsers.length }}</span><span class="stat-lbl">Total</span></div>
            </div>
            <div class="stat-chip stat-admin">
              <mat-icon>admin_panel_settings</mat-icon>
              <div><span class="stat-num">{{ countByRole('Admin') }}</span><span class="stat-lbl">Admins</span></div>
            </div>
            <div class="stat-chip stat-doctor">
              <mat-icon>medical_services</mat-icon>
              <div><span class="stat-num">{{ countByRole('Doctor') }}</span><span class="stat-lbl">Doctors</span></div>
            </div>
            <div class="stat-chip stat-patient">
              <mat-icon>person</mat-icon>
              <div><span class="stat-num">{{ countByRole('Patient') }}</span><span class="stat-lbl">Patients</span></div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-card">
            <div class="table-wrapper">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of filteredUsers; track u.id) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div class="avatar" [class]="'avatar--' + u.role.toLowerCase()">{{ u.name?.charAt(0) }}</div>
                          <span>{{ u.name }}</span>
                        </div>
                      </td>
                      <td>{{ u.email }}</td>
                      <td>
                        <span class="role-badge" [class]="'role--' + u.role.toLowerCase()">{{ u.role }}</span>
                      </td>
                      <td>{{ u.createdAt | date:'MMM d, y' }}</td>
                    </tr>
                  }
                  @if (filteredUsers.length === 0) {
                    <tr><td colspan="4" class="empty-row">No users found</td></tr>
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

    .filters-bar {
      display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .filter-field { width: 180px; }
    .search-field { flex: 1; min-width: 200px; max-width: 350px; }
    .total-label { font-size: 14px; color: #666; font-weight: 500; }

    .stats-row {
      display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .stat-chip {
      display: flex; align-items: center; gap: 12px;
      background: #fff; border-radius: 12px; padding: 16px 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); min-width: 140px;
    }
    .stat-chip mat-icon { font-size: 28px; width: 28px; height: 28px; color: #1b3a7b; }
    .stat-chip div { display: flex; flex-direction: column; }
    .stat-num { font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .stat-lbl { font-size: 12px; color: #888; }
    .stat-admin mat-icon { color: #e65100; }
    .stat-doctor mat-icon { color: #1b7a5a; }
    .stat-patient mat-icon { color: #5b3a9e; }

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
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; color: #fff;
    }
    .avatar--admin { background: #e65100; }
    .avatar--doctor { background: #1b7a5a; }
    .avatar--patient { background: #5b3a9e; }
    .role-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .role--admin { background: #fff3e0; color: #e65100; }
    .role--doctor { background: #e8f5e9; color: #2e7d32; }
    .role--patient { background: #ede7f6; color: #5b3a9e; }
    .empty-row { text-align: center; color: #aaa; padding: 40px 0 !important; }
  `]
})
export class ManageUsersComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: 'medical_services', route: '/admin/manage-doctors' },
    { label: 'Manage Hospitals', icon: 'local_hospital', route: '/admin/manage-hospitals' },
    { label: 'Appointments', icon: 'calendar_today', route: '/admin/appointments' },
    { label: 'Feedback', icon: 'rate_review', route: '/admin/feedback' },
    { label: 'Manage Users', icon: 'group', route: '/admin/manage-users' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' },
  ];

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  roleFilter = 'all';
  searchQuery = '';

  constructor(
    public authService: AuthService,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.allUsers = res.data || [];
          this.applyFilter();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.allUsers = [];
        this.filteredUsers = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    let users = [...this.allUsers];
    if (this.roleFilter !== 'all') {
      users = users.filter(u => u.role === this.roleFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    this.filteredUsers = users;
  }

  countByRole(role: string): number {
    return this.allUsers.filter(u => u.role === role).length;
  }
}
