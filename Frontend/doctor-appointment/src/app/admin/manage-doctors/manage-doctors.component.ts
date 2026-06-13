import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { DoctorService } from '../../core/services/doctor.service';
import { HospitalService } from '../../core/services/hospital.service';
import { AuthService } from '../../core/services/auth.service';
import { Doctor, CreateDoctor, Hospital } from '../../core/models/models';

@Component({
  selector: 'app-manage-doctors',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatDialogModule, MatCheckboxModule,
    MatSelectModule, SidebarComponent, TopNavbarComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="admin" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Manage Doctors" theme="admin" [userName]="authService.currentUser?.name || ''" userRole="Administrator" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <!-- Add/Edit Form Card -->
          <div class="form-card">
            <div class="form-card__header">
              <h3>{{ editingDoctor ? 'Edit Doctor' : 'Add New Doctor' }}</h3>
              @if (editingDoctor) {
                <button mat-button (click)="cancelEdit()"><mat-icon>close</mat-icon> Cancel</button>
              }
            </div>
            <form (ngSubmit)="onSubmit()" class="doctor-form">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Full Name</mat-label>
                  <mat-icon matPrefix>person</mat-icon>
                  <input matInput [(ngModel)]="formData.name" name="name" required>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <mat-icon matPrefix>email</mat-icon>
                  <input matInput type="email" [(ngModel)]="formData.email" name="email" required>
                </mat-form-field>
                @if (!editingDoctor) {
                  <mat-form-field appearance="outline">
                    <mat-label>Password</mat-label>
                    <mat-icon matPrefix>lock</mat-icon>
                    <input matInput type="password" [(ngModel)]="formData.password" name="password" required>
                  </mat-form-field>
                }
                <mat-form-field appearance="outline">
                  <mat-label>Specialization</mat-label>
                  <mat-icon matPrefix>local_hospital</mat-icon>
                  <mat-select [(ngModel)]="formData.specialization" name="specialization" required>
                    @for (spec of specializations; track spec) {
                      <mat-option [value]="spec">{{ spec }}</mat-option>
                    }
                    <mat-option value="__custom__">+ Add Custom</mat-option>
                  </mat-select>
                </mat-form-field>
                @if (formData.specialization === '__custom__') {
                  <mat-form-field appearance="outline">
                    <mat-label>Custom Specialization</mat-label>
                    <mat-icon matPrefix>edit</mat-icon>
                    <input matInput [(ngModel)]="customSpecialization" name="customSpecialization" placeholder="Enter specialization">
                  </mat-form-field>
                }
                <mat-form-field appearance="outline">
                  <mat-label>Experience (years)</mat-label>
                  <mat-icon matPrefix>work</mat-icon>
                  <input matInput type="number" [(ngModel)]="formData.experience" name="experience">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Hospital</mat-label>
                  <mat-icon matPrefix>local_hospital</mat-icon>
                  <mat-select [(ngModel)]="formData.hospitalId" name="hospitalId">
                    <mat-option [value]="undefined">Independent</mat-option>
                    @for (h of hospitals; track h.id) {
                      <mat-option [value]="h.id">{{ h.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <mat-icon matPrefix>location_city</mat-icon>
                  <input matInput [(ngModel)]="formData.city" name="city">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>State</mat-label>
                  <mat-icon matPrefix>map</mat-icon>
                  <input matInput [(ngModel)]="formData.state" name="state">
                </mat-form-field>
              </div>
              <div class="weekday-selector">
                <label class="weekday-label"><mat-icon>schedule</mat-icon> Available Days</label>
                <div class="weekday-chips">
                  @for (day of weekdays; track day) {
                    <button type="button" class="weekday-chip" [class.selected]="isDaySelected(day)" (click)="toggleDay(day)">{{ day.substring(0, 3) }}</button>
                  }
                </div>
              </div>
              <button mat-raised-button class="submit-btn" type="submit">
                <mat-icon>{{ editingDoctor ? 'save' : 'add' }}</mat-icon>
                {{ editingDoctor ? 'Update Doctor' : 'Add Doctor' }}
              </button>
            </form>
          </div>

          <!-- Doctors Grid -->
          <h3 class="section-title">All Doctors ({{ doctors.length }})</h3>
          <div class="doctors-grid">
            @for (d of doctors; track d.id) {
              <div class="doctor-card">
                <div class="doctor-card__avatar">
                  <div class="avatar-circle">{{ d.name?.charAt(0) }}</div>
                </div>
                <div class="doctor-card__info">
                  <h4>Dr. {{ d.name }}</h4>
                  <span class="specialization">{{ d.specialization }}</span>
                  <div class="meta">
                    <span><mat-icon class="meta-icon">email</mat-icon> {{ d.email }}</span>
                    <span><mat-icon class="meta-icon">work</mat-icon> {{ d.experience }} yrs experience</span>
                    <span><mat-icon class="meta-icon">local_hospital</mat-icon> {{ d.hospitalName || 'Independent' }}</span>
                  </div>
                </div>
                <div class="doctor-card__actions">
                  <button mat-icon-button class="edit-btn" (click)="editDoctor(d)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button class="delete-btn" (click)="deleteDoctor(d.id)"><mat-icon>delete</mat-icon></button>
                </div>
              </div>
            }
            @if (doctors.length === 0) {
              <div class="empty-state">
                <mat-icon>medical_services</mat-icon>
                <p>No doctors added yet</p>
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

    .form-card {
      background: #fff; border-radius: 12px; padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 28px;
    }
    .form-card__header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
    }
    .form-card__header h3 { margin: 0; font-size: 18px; font-weight: 600; color: #1a1a2e; }
    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 8px 16px;
    }
    .submit-btn {
      background: #1b3a7b !important; color: #fff !important; height: 44px;
      border-radius: 8px !important; display: flex; align-items: center; gap: 8px;
    }

    .section-title {
      font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 16px;
    }
    .doctors-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px;
    }
    .doctor-card {
      background: #fff; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; gap: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .doctor-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    .avatar-circle {
      width: 52px; height: 52px; border-radius: 50%; background: #1b7a5a;
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 20px;
    }
    .doctor-card__info { flex: 1; }
    .doctor-card__info h4 { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a2e; }
    .specialization { font-size: 13px; color: #1b7a5a; font-weight: 600; }
    .meta { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; font-size: 12px; color: #888; }
    .meta span { display: flex; align-items: center; gap: 4px; }
    .meta-icon { font-size: 14px; width: 14px; height: 14px; }
    .doctor-card__actions { display: flex; flex-direction: column; gap: 4px; }
    .edit-btn { color: #1b3a7b; }
    .delete-btn { color: #c62828; }
    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 60px; color: #aaa;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }

    .weekday-selector { margin-bottom: 16px; }
    .weekday-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;
    }
    .weekday-label mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .weekday-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .weekday-chip {
      padding: 8px 16px; border-radius: 20px; border: 2px solid #e0e0e0;
      background: #fff; color: #555; font-weight: 600; font-size: 13px;
      cursor: pointer; transition: all 0.2s ease;
    }
    .weekday-chip:hover { border-color: #1b3a7b; color: #1b3a7b; }
    .weekday-chip.selected {
      background: #1b3a7b; color: #fff; border-color: #1b3a7b;
    }
  `]
})
export class ManageDoctorsComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: 'medical_services', route: '/admin/manage-doctors' },
    { label: 'Manage Hospitals', icon: 'local_hospital', route: '/admin/manage-hospitals' },
    { label: 'Appointments', icon: 'calendar_today', route: '/admin/appointments' },
    { label: 'Feedback', icon: 'rate_review', route: '/admin/feedback' },
    { label: 'Manage Users', icon: 'group', route: '/admin/manage-users' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' },
  ];

  doctors: Doctor[] = [];
  hospitals: Hospital[] = [];
  formData: CreateDoctor = { name: '', email: '', password: '', specialization: '', experience: 0, hospitalId: undefined, availabilitySchedule: '', city: '', state: '' };
  editingDoctor: Doctor | null = null;
  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = [];
  customSpecialization = '';

  specializations: string[] = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
    'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Gynecologist',
    'Ophthalmologist', 'ENT Specialist', 'Dentist', 'Urologist',
    'Oncologist', 'Endocrinologist', 'Pulmonologist', 'Gastroenterologist',
    'Nephrologist', 'Rheumatologist', 'Surgeon', 'Radiologist'
  ];

  constructor(public authService: AuthService, private doctorService: DoctorService, private hospitalService: HospitalService, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadDoctors(); this.loadHospitals(); }

  loadHospitals(): void {
    this.hospitalService.getAll().subscribe({
      next: (res) => { if (res.success) this.hospitals = res.data || []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  loadDoctors(): void {
    this.doctorService.getAll().subscribe({
      next: (res) => { if (res.success) this.doctors = res.data || []; this.cdr.detectChanges(); },
      error: () => { this.doctors = []; this.cdr.detectChanges(); }
    });
  }

  onSubmit(): void {
    // Handle custom specialization
    if (this.formData.specialization === '__custom__' && this.customSpecialization.trim()) {
      this.formData.specialization = this.customSpecialization.trim();
      if (!this.specializations.includes(this.formData.specialization)) {
        this.specializations.push(this.formData.specialization);
      }
    }
    this.formData.availabilitySchedule = this.selectedDays.join(', ');
    if (this.editingDoctor) {
      this.doctorService.update(this.editingDoctor.id, {
        name: this.formData.name,
        email: this.formData.email,
        specialization: this.formData.specialization, experience: this.formData.experience,
        hospitalId: this.formData.hospitalId,
        availabilitySchedule: this.formData.availabilitySchedule,
        city: this.formData.city,
        state: this.formData.state
      }).subscribe({
        next: () => { this.loadDoctors(); this.cancelEdit(); this.snackBar.open('Doctor updated', 'Close', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
      });
    } else {
      this.doctorService.create(this.formData).subscribe({
        next: () => {
          this.loadDoctors();
          this.formData = { name: '', email: '', password: '', specialization: '', experience: 0, hospitalId: undefined, availabilitySchedule: '', city: '', state: '' };
          this.customSpecialization = '';
          this.snackBar.open('Doctor added', 'Close', { duration: 2000 });
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
      });
    }
  }

  editDoctor(doctor: Doctor): void {
    this.editingDoctor = doctor;
    this.formData = { ...doctor, password: '' };
    this.selectedDays = doctor.availabilitySchedule ? doctor.availabilitySchedule.split(', ').filter(d => d) : [];
  }

  cancelEdit(): void {
    this.editingDoctor = null;
    this.formData = { name: '', email: '', password: '', specialization: '', experience: 0, hospitalId: undefined, availabilitySchedule: '', city: '', state: '' };
    this.selectedDays = [];
    this.customSpecialization = '';
  }

  isDaySelected(day: string): boolean {
    return this.selectedDays.includes(day);
  }

  toggleDay(day: string): void {
    const idx = this.selectedDays.indexOf(day);
    if (idx >= 0) this.selectedDays.splice(idx, 1);
    else this.selectedDays.push(day);
  }

  deleteDoctor(id: string): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.doctorService.delete(id).subscribe({
        next: () => { this.loadDoctors(); this.snackBar.open('Doctor deleted', 'Close', { duration: 2000 }); },
        error: (err) => this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 3000 })
      });
    }
  }
}
