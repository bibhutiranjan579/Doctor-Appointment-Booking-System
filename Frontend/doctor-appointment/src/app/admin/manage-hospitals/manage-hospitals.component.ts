import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HospitalService } from '../../core/services/hospital.service';
import { AuthService } from '../../core/services/auth.service';
import { Hospital, CreateHospital } from '../../core/models/models';

@Component({
  selector: 'app-manage-hospitals',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule,
    SidebarComponent, TopNavbarComponent, FooterComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="admin" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Manage Hospitals" theme="admin" [userName]="authService.currentUser?.name || ''" userRole="Administrator" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <!-- Add/Edit Form -->
          <div class="form-card">
            <div class="form-card__header">
              <h3>{{ editing ? 'Edit Hospital' : 'Add New Hospital' }}</h3>
              @if (editing) {
                <button mat-button (click)="cancelEdit()"><mat-icon>close</mat-icon> Cancel</button>
              }
            </div>
            <form (ngSubmit)="onSubmit()" class="form-inline">
              <mat-form-field appearance="outline" class="flex-field">
                <mat-label>Hospital Name</mat-label>
                <mat-icon matPrefix>local_hospital</mat-icon>
                <input matInput [(ngModel)]="formData.name" name="name" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-field">
                <mat-label>City</mat-label>
                <mat-icon matPrefix>location_city</mat-icon>
                <input matInput [(ngModel)]="formData.city" name="city" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-field">
                <mat-label>State</mat-label>
                <mat-icon matPrefix>map</mat-icon>
                <input matInput [(ngModel)]="formData.state" name="state" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="flex-field">
                <mat-label>Country</mat-label>
                <mat-icon matPrefix>public</mat-icon>
                <input matInput [(ngModel)]="formData.country" name="country" required>
              </mat-form-field>
              <button mat-raised-button class="submit-btn" type="submit">
                <mat-icon>{{ editing ? 'save' : 'add' }}</mat-icon>
                {{ editing ? 'Update' : 'Add Hospital' }}
              </button>
            </form>
          </div>

          <!-- Hospitals Grid -->
          <h3 class="section-title">All Hospitals ({{ hospitals.length }})</h3>
          <div class="hospitals-grid">
            @for (h of hospitals; track h.id) {
              <div class="hospital-card">
                <div class="hospital-card__icon-wrap">
                  <mat-icon>local_hospital</mat-icon>
                </div>
                <div class="hospital-card__info">
                  <h4>{{ h.name }}</h4>
                  <span class="location"><mat-icon class="loc-icon">location_city</mat-icon> {{ h.city }}, {{ h.state }}</span>
                  <span class="coords"><mat-icon class="loc-icon">public</mat-icon> {{ h.country }}</span>
                </div>
                <div class="hospital-card__actions">
                  <button mat-icon-button class="edit-btn" (click)="edit(h)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button class="delete-btn" (click)="deleteHospital(h.id)"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
            }
            @if (hospitals.length === 0) {
              <div class="empty-state">
                <mat-icon>domain_disabled</mat-icon>
                <p>No hospitals added yet</p>
              </div>
            }
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

    .form-card {
      background: #fff; border-radius: 12px; padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 28px;
    }
    .form-card__header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
    }
    .form-card__header h3 { margin: 0; font-size: 18px; font-weight: 600; }
    .form-inline { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .flex-field { flex: 1; min-width: 180px; }
    .submit-btn {
      background: #1b3a7b !important; color: #fff !important; height: 56px;
      border-radius: 8px !important; display: flex; align-items: center; gap: 8px;
    }

    .section-title { font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 16px; }
    .hospitals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .hospital-card {
      background: #fff; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .hospital-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    .hospital-card__icon-wrap {
      width: 52px; height: 52px; border-radius: 12px; background: #e3f2fd;
      color: #1b3a7b; display: flex; align-items: center; justify-content: center;
    }
    .hospital-card__icon-wrap mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .hospital-card__info { flex: 1; }
    .hospital-card__info h4 { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a2e; }
    .location { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #888; }
    .coords { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #aaa; }
    .loc-icon { font-size: 14px; width: 14px; height: 14px; }
    .hospital-card__actions { display: flex; gap: 4px; }
    .edit-btn { color: #1b3a7b; }
    .delete-btn { color: #c62828; }
    .empty-state {
      grid-column: 1 / -1;
      text-align: center; padding: 48px 20px; color: #aaa;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; }
    .empty-state p { font-size: 16px; margin: 12px 0 0; }

    @media (max-width: 1024px) { .dashboard-main { margin-left: 220px; } .hospitals-grid { grid-template-columns: 1fr; } }
    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; }
      .dashboard-content { padding: 72px 16px 24px; }
      .form-inline { flex-direction: column; }
      .flex-field { min-width: 100%; }
      .hospital-card { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `]
})
export class ManageHospitalsComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: 'medical_services', route: '/admin/manage-doctors' },
    { label: 'Manage Hospitals', icon: 'local_hospital', route: '/admin/manage-hospitals' },
    { label: 'Appointments', icon: 'calendar_today', route: '/admin/appointments' },
    { label: 'Feedback', icon: 'rate_review', route: '/admin/feedback' },
    { label: 'Manage Users', icon: 'group', route: '/admin/manage-users' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' },
  ];

  hospitals: Hospital[] = [];
  formData: CreateHospital = { name: '', city: '', state: '', country: '' };
  editing: Hospital | null = null;

  constructor(public authService: AuthService, private hospitalService: HospitalService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadHospitals(); }

  loadHospitals(): void {
    this.hospitalService.getAll().subscribe({
      next: (res) => { if (res.success) this.hospitals = res.data || []; this.cdr.detectChanges(); },
      error: () => { this.hospitals = []; this.cdr.detectChanges(); }
    });
  }

  onSubmit(): void {
    if (this.editing) {
      this.hospitalService.update(this.editing.id, this.formData).subscribe({
        next: () => { this.loadHospitals(); this.cancelEdit(); this.snackBar.open('Hospital updated', 'Close', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
      });
    } else {
      this.hospitalService.create(this.formData).subscribe({
        next: () => { this.loadHospitals(); this.formData = { name: '', city: '', state: '', country: '' }; this.snackBar.open('Hospital added', 'Close', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
      });
    }
  }

  edit(hospital: Hospital): void {
    this.editing = hospital;
    this.formData = { name: hospital.name, city: hospital.city, state: hospital.state, country: hospital.country };
  }

  cancelEdit(): void {
    this.editing = null;
    this.formData = { name: '', city: '', state: '', country: '' };
  }

  deleteHospital(id: string): void {
    if (confirm('Delete hospital?')) {
      this.hospitalService.delete(id).subscribe({
        next: () => { this.loadHospitals(); this.snackBar.open('Hospital deleted', 'Close', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
      });
    }
  }
}
