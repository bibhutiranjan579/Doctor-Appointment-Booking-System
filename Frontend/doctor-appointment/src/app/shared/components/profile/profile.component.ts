import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';
import { TopNavbarComponent } from '../top-navbar/top-navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfile } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule, MatDividerModule,
    SidebarComponent, TopNavbarComponent, FooterComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" [theme]="theme" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="My Profile" [theme]="theme" [userName]="authService.currentUser?.name || ''" [userRole]="roleLabel" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <div class="profile-wrapper">
            <!-- Profile Header -->
            <div class="profile-header" [class]="'profile-header--' + theme">
              <div class="profile-avatar">
                <span>{{ profile.name?.charAt(0) || '?' }}</span>
              </div>
              <div class="profile-header-info">
                <h2>{{ profile.name }}</h2>
                <span class="role-badge">{{ roleLabel }}</span>
                <p class="email-text">{{ profile.email }}</p>
              </div>
            </div>

            <!-- Profile Form -->
            <div class="profile-card">
              <div class="card-header">
                <h3><mat-icon>edit</mat-icon> Edit Profile</h3>
              </div>

              <form (ngSubmit)="onSave()" class="profile-form">
                <!-- Common fields -->
                <div class="form-section">
                  <h4>Personal Information</h4>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Full Name</mat-label>
                      <mat-icon matPrefix>person</mat-icon>
                      <input matInput [(ngModel)]="profile.name" name="name" required>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Email</mat-label>
                      <mat-icon matPrefix>email</mat-icon>
                      <input matInput [(ngModel)]="profile.email" name="email" disabled>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Mobile Number</mat-label>
                      <mat-icon matPrefix>phone</mat-icon>
                      <input matInput type="tel" [(ngModel)]="profile.phoneNumber" name="phoneNumber" placeholder="+91 9876543210">
                    </mat-form-field>
                  </div>
                </div>

                <!-- Patient-specific fields -->
                @if (role === 'Patient') {
                  <mat-divider></mat-divider>
                  <div class="form-section">
                    <h4>Health Details</h4>
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Age</mat-label>
                        <mat-icon matPrefix>cake</mat-icon>
                        <input matInput type="number" [(ngModel)]="profile.age" name="age">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Gender</mat-label>
                        <mat-icon matPrefix>wc</mat-icon>
                        <mat-select [(ngModel)]="profile.gender" name="gender">
                          <mat-option value="Male">Male</mat-option>
                          <mat-option value="Female">Female</mat-option>
                          <mat-option value="Other">Other</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="full-span">
                        <mat-label>Medical History</mat-label>
                        <mat-icon matPrefix>description</mat-icon>
                        <textarea matInput [(ngModel)]="profile.medicalHistory" name="medicalHistory" rows="3" placeholder="Any ongoing conditions, allergies, medications..."></textarea>
                      </mat-form-field>
                    </div>
                  </div>
                }

                <!-- Doctor-specific fields -->
                @if (role === 'Doctor') {
                  <mat-divider></mat-divider>
                  <div class="form-section">
                    <h4>Professional Details</h4>
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Specialization</mat-label>
                        <mat-icon matPrefix>local_hospital</mat-icon>
                        <input matInput [(ngModel)]="profile.specialization" name="specialization">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Experience (years)</mat-label>
                        <mat-icon matPrefix>work</mat-icon>
                        <input matInput type="number" [(ngModel)]="profile.experience" name="experience">
                      </mat-form-field>
                    </div>
                  </div>
                }

                <div class="form-actions">
                  <button mat-raised-button type="submit" class="save-btn" [class]="'save-btn--' + theme" [disabled]="saving">
                    @if (saving) {
                      <mat-icon>hourglass_empty</mat-icon>
                      <span>Saving...</span>
                    } @else {
                      <mat-icon>save</mat-icon>
                      <span>Save Changes</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
    .dashboard-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
    .dashboard-content { padding: 88px 32px 32px; flex: 1; }

    .profile-wrapper { max-width: 800px; margin: 0 auto; }

    .profile-header {
      display: flex; align-items: center; gap: 24px;
      padding: 32px; border-radius: 16px; margin-bottom: 24px; color: #fff;
    }
    .profile-header--admin { background: linear-gradient(135deg, #0d1b4a, #1b3a7b); }
    .profile-header--doctor { background: linear-gradient(135deg, #0a3d2e, #1b7a5a); }
    .profile-header--patient { background: linear-gradient(135deg, #2d1b69, #5b3a9e); }

    .profile-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 700; color: #fff;
      border: 3px solid rgba(255,255,255,0.4);
    }
    .profile-header-info h2 { margin: 0 0 6px; font-size: 24px; font-weight: 700; }
    .role-badge {
      display: inline-block; padding: 3px 14px; border-radius: 20px;
      background: rgba(255,255,255,0.2); font-size: 12px; font-weight: 600;
      letter-spacing: 0.5px; text-transform: uppercase;
    }
    .email-text { margin: 8px 0 0; font-size: 14px; opacity: 0.85; }

    .profile-card {
      background: #fff; border-radius: 16px; padding: 28px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    }
    .card-header {
      margin-bottom: 20px;
    }
    .card-header h3 {
      display: flex; align-items: center; gap: 8px;
      margin: 0; font-size: 18px; font-weight: 600; color: #1a1a2e;
    }

    .form-section { padding: 20px 0; }
    .form-section h4 {
      margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #555;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px;
    }
    .full-span { grid-column: 1 / -1; }

    mat-divider { margin: 4px 0; }

    .form-actions { padding-top: 16px; display: flex; justify-content: flex-end; }
    .save-btn {
      height: 44px; border-radius: 10px !important;
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: #fff !important;
    }
    .save-btn--admin { background: #1b3a7b !important; }
    .save-btn--admin:hover { background: #0d1b4a !important; }
    .save-btn--doctor { background: #1b7a5a !important; }
    .save-btn--doctor:hover { background: #0a3d2e !important; }
    .save-btn--patient { background: #5b3a9e !important; }
    .save-btn--patient:hover { background: #2d1b69 !important; }
    .save-btn:disabled { opacity: 0.7; }

    @media (max-width: 1024px) { .dashboard-main { margin-left: 220px; } }
    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; }
      .dashboard-content { padding: 72px 16px 24px; }
      .form-grid { grid-template-columns: 1fr; }
      .profile-header { flex-direction: column; text-align: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  role = '';
  theme: 'admin' | 'doctor' | 'patient' = 'admin';
  roleLabel = '';
  sidebarItems: SidebarItem[] = [];
  saving = false;

  profile: UserProfile = {
    name: '', email: '', role: '', phoneNumber: '',
    age: undefined, gender: '', specialization: '', experience: undefined,
    availabilitySchedule: '', medicalHistory: ''
  };

  private adminSidebar: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: 'medical_services', route: '/admin/manage-doctors' },
    { label: 'Manage Hospitals', icon: 'local_hospital', route: '/admin/manage-hospitals' },
    { label: 'Appointments', icon: 'calendar_today', route: '/admin/appointments' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' },
  ];

  private doctorSidebar: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/doctor/dashboard' },
    { label: 'Chat', icon: 'chat', route: '/doctor/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/doctor/video-call' },
    { label: 'Profile', icon: 'person', route: '/doctor/profile' },
  ];

  private patientSidebar: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctors', icon: 'search', route: '/patient/search-doctors' },
    { label: 'Chat', icon: 'chat', route: '/patient/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/patient/video-call' },
    { label: 'Profile', icon: 'person', route: '/patient/profile' },
  ];

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.role = this.authService.currentUser?.role || '';
    this.setupRole();
    this.loadProfile();
  }

  private setupRole(): void {
    switch (this.role) {
      case 'Admin':
        this.theme = 'admin'; this.roleLabel = 'Administrator'; this.sidebarItems = this.adminSidebar; break;
      case 'Doctor':
        this.theme = 'doctor'; this.roleLabel = 'Doctor'; this.sidebarItems = this.doctorSidebar; break;
      default:
        this.theme = 'patient'; this.roleLabel = 'Patient'; this.sidebarItems = this.patientSidebar; break;
    }
  }

  private loadProfile(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.profile.name = user.name;
      this.profile.email = user.email;
      this.profile.role = user.role;
    }

    // Load from backend API based on role
    if (this.role === 'Patient') {
      this.http.get<any>(`${environment.apiUrl}/patients/profile`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.profile.age = res.data.age || undefined;
            this.profile.gender = res.data.gender || '';
            this.profile.medicalHistory = res.data.medicalHistory || '';
            this.profile.phoneNumber = res.data.phoneNumber || '';
          }
        },
        error: () => {}
      });
    } else if (this.role === 'Doctor') {
      this.http.get<any>(`${environment.apiUrl}/doctors/profile`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.profile.specialization = res.data.specialization || '';
            this.profile.experience = res.data.experience || undefined;
            this.profile.name = res.data.name || this.profile.name;
          }
        },
        error: () => {}
      });
    } else if (this.role === 'Admin') {
      this.http.get<any>(`${environment.apiUrl}/auth/profile`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.profile.name = res.data.name || this.profile.name;
          }
        },
        error: () => {}
      });
    }
  }

  onSave(): void {
    this.saving = true;
    const user = this.authService.currentUser;

    if (this.role === 'Patient') {
      const payload = {
        age: this.profile.age || 0,
        gender: this.profile.gender || '',
        medicalHistory: this.profile.medicalHistory || '',
        phoneNumber: this.profile.phoneNumber || ''
      };
      this.http.put<any>(`${environment.apiUrl}/patients/profile`, payload).subscribe({
        next: () => {
          this.saving = false;
          this.updateUserName(user);
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error saving profile', 'Close', { duration: 3000 });
        }
      });
    } else if (this.role === 'Doctor') {
      const payload = {
        name: this.profile.name,
        email: this.profile.email,
        specialization: this.profile.specialization || '',
        experience: this.profile.experience || 0,
        availabilitySchedule: ''
      };
      this.http.put<any>(`${environment.apiUrl}/doctors/profile`, payload).subscribe({
        next: () => {
          this.saving = false;
          this.updateUserName(user);
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error saving profile', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Admin
      const payload = { name: this.profile.name };
      this.http.put<any>(`${environment.apiUrl}/auth/profile`, payload).subscribe({
        next: () => {
          this.saving = false;
          this.updateUserName(user);
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error saving profile', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private updateUserName(user: any): void {
    if (user) {
      const updatedUser = { ...user, name: this.profile.name };
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }
}
