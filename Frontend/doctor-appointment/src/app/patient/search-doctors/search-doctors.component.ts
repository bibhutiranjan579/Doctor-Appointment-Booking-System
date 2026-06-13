import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { DoctorService } from '../../core/services/doctor.service';
import { HospitalService } from '../../core/services/hospital.service';
import { AuthService } from '../../core/services/auth.service';
import { Doctor, Hospital } from '../../core/models/models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-doctors',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatIconModule,
    MatSnackBarModule, SidebarComponent, TopNavbarComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="patient" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Find Doctors" theme="patient" [userName]="authService.currentUser?.name || ''" userRole="Patient" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">

          <!-- Location Bar -->
          <div class="location-bar">
            <div class="location-bar__left">
              <mat-icon class="location-pin">location_on</mat-icon>
              @if (locationStatus === 'detected') {
                <span class="location-text">{{ cityName }}</span>
                @if (stateName) {
                  <span class="location-sub">, {{ stateName }}</span>
                }
              } @else if (locationStatus === 'detecting') {
                <span class="location-text">Detecting your location...</span>
              } @else {
                <span class="location-text">Location not detected</span>
              }
            </div>
            <div class="location-bar__actions">
              <button mat-raised-button class="loc-btn" (click)="detectLocation()" [disabled]="locationStatus === 'detecting'">
                <mat-icon>my_location</mat-icon> {{ locationStatus === 'detected' ? 'Refresh Location' : 'Detect My Location' }}
              </button>
            </div>
          </div>

          <!-- Search & Filter Bar -->
          <div class="search-card">
            <div class="search-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search by specialization</mat-label>
                <mat-icon matPrefix>search</mat-icon>
                <input matInput [(ngModel)]="specialization" placeholder="e.g. Cardiology, Dermatology...">
              </mat-form-field>
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>City / Area</mat-label>
                <mat-icon matPrefix>place</mat-icon>
                <input matInput [(ngModel)]="locationSearch" placeholder="e.g. Delhi, Mumbai, Noida...">
              </mat-form-field>
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Hospital</mat-label>
                <mat-icon matPrefix>local_hospital</mat-icon>
                <mat-select [(ngModel)]="selectedHospitalId">
                  <mat-option value="">All Hospitals</mat-option>
                  @for (h of hospitals; track h.id) {
                    <mat-option [value]="h.id">{{ h.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-raised-button class="search-btn" (click)="search()">
                <mat-icon>search</mat-icon> Search
              </button>
            </div>

            <!-- Sort Options -->
            <div class="filters-row">
              <div class="filter-group">
                <label class="filter-label">Sort By</label>
                <div class="sort-chips">
                  <button class="sort-chip" [class.active]="sortBy === 'experience'" (click)="sortBy = 'experience'; search()">
                    <mat-icon>workspace_premium</mat-icon> Experience
                  </button>
                  <button class="sort-chip" [class.active]="sortBy === 'name'" (click)="sortBy = 'name'; search()">
                    <mat-icon>sort_by_alpha</mat-icon> Name
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Results -->
          <h3 class="section-title">
            @if (doctors.length > 0) {
              {{ totalCount }} Doctor{{ totalCount > 1 ? 's' : '' }} Found
              @if (locationSearch) { <span class="title-sub">in "{{ locationSearch }}"</span> }
            } @else {
              Search Results
            }
          </h3>
          <div class="doctor-grid">
            @for (doctor of doctors; track doctor.id) {
              <div class="doctor-card">
                <div class="doctor-card__top">
                  <div class="doctor-avatar">{{ doctor.name?.charAt(0) }}</div>
                  <div class="doctor-basic">
                    <h4>Dr. {{ doctor.name }}</h4>
                    <span class="spec-badge">{{ doctor.specialization }}</span>
                  </div>
                </div>
                <div class="doctor-card__details">
                  <div class="detail-item">
                    <mat-icon>work</mat-icon>
                    <span>{{ doctor.experience }} years experience</span>
                  </div>
                  <div class="detail-item">
                    <mat-icon>local_hospital</mat-icon>
                    <span>{{ doctor.hospitalName || 'Independent Practice' }}</span>
                  </div>
                  @if (doctor.hospitalLocation) {
                    <div class="detail-item">
                      <mat-icon>place</mat-icon>
                      <span>{{ doctor.hospitalLocation }}</span>
                    </div>
                  }
                  <div class="detail-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ doctor.availabilitySchedule || 'Contact for schedule' }}</span>
                  </div>
                </div>
                <button mat-raised-button class="book-btn" routerLink="/patient/book-appointment" [queryParams]="{doctorId: doctor.id, doctorName: doctor.name}">
                  <mat-icon>calendar_today</mat-icon> Book Appointment
                </button>
              </div>
            }
            @if (doctors.length === 0) {
              <div class="empty-state">
                <mat-icon>person_search</mat-icon>
                <p>No doctors found. Try adjusting your search criteria or changing the location.</p>
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

    /* Location Bar */
    .location-bar {
      background: linear-gradient(135deg, #1b7a5a 0%, #00c853 100%); border-radius: 12px; padding: 16px 24px;
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
    }
    .location-bar__left { display: flex; align-items: center; gap: 8px; color: #fff; }
    .location-pin { font-size: 28px; width: 28px; height: 28px; }
    .location-text { font-size: 16px; font-weight: 700; }
    .location-sub { font-size: 15px; font-weight: 500; opacity: 0.9; }
    .location-bar__actions { display: flex; align-items: center; gap: 12px; }
    .loc-btn { background: rgba(255,255,255,0.2) !important; color: #fff !important; border-radius: 8px !important; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(4px); }
    .loc-btn:hover { background: rgba(255,255,255,0.35) !important; }

    /* Search Card */
    .search-card {
      background: #fff; border-radius: 12px; padding: 20px 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px;
    }
    .search-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 180px; }
    .search-btn {
      background: #5b3a9e !important; color: #fff !important; height: 56px;
      border-radius: 10px !important; display: flex; align-items: center; gap: 8px;
    }

    /* Filters Row */
    .filters-row {
      display: flex; gap: 32px; align-items: flex-start; margin-top: 16px;
      padding-top: 16px; border-top: 1px solid #eee; flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-label { font-size: 13px; font-weight: 600; color: #555; }
    .sort-chips { display: flex; gap: 8px; }
    .sort-chip {
      display: flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 20px;
      border: 2px solid #e0e0e0; background: #fff; color: #555; font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
    }
    .sort-chip:hover { border-color: #5b3a9e; color: #5b3a9e; }
    .sort-chip.active { background: #5b3a9e; color: #fff; border-color: #5b3a9e; }
    .sort-chip mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .section-title { font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
    .title-sub { font-size: 14px; font-weight: 400; color: #888; }

    /* Doctor Grid */
    .doctor-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px;
    }
    .doctor-card {
      background: #fff; border-radius: 12px; padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex; flex-direction: column;
    }
    .doctor-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

    .doctor-card__top { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
    .doctor-avatar {
      width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #1b7a5a, #00c853);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 22px; flex-shrink: 0;
    }
    .doctor-basic { flex: 1; }
    .doctor-basic h4 { margin: 0 0 4px; font-size: 17px; font-weight: 600; color: #1a1a2e; }
    .spec-badge {
      display: inline-block; background: #e8f5e9; color: #2e7d32;
      padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
    }

    .doctor-card__details {
      display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; flex: 1;
    }
    .detail-item {
      display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666;
    }
    .detail-item mat-icon { font-size: 18px; width: 18px; height: 18px; color: #999; }

    .book-btn {
      background: #5b3a9e !important; color: #fff !important; width: 100%;
      height: 44px; border-radius: 10px !important; display: flex;
      align-items: center; justify-content: center; gap: 8px; font-weight: 600;
    }
    .book-btn:hover { background: #2d1b69 !important; }

    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 60px; color: #aaa;
      background: #fff; border-radius: 12px;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
  `]
})
export class SearchDoctorsComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctors', icon: 'search', route: '/patient/search-doctors' },
    { label: 'Feedback', icon: 'rate_review', route: '/patient/feedback' },
    { label: 'Chat', icon: 'chat', route: '/patient/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/patient/video-call' },
    { label: 'Profile', icon: 'person', route: '/patient/profile' },
  ];

  doctors: Doctor[] = [];
  hospitals: Hospital[] = [];
  specialization = '';
  selectedHospitalId = '';
  locationSearch = '';
  totalCount = 0;
  sortBy = 'experience';

  // Location state
  cityName = '';
  stateName = '';
  locationStatus: 'none' | 'detecting' | 'detected' = 'none';

  constructor(
    public authService: AuthService,
    private doctorService: DoctorService,
    private hospitalService: HospitalService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHospitals();
    this.detectLocation();
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.search();
      return;
    }
    this.locationStatus = 'detecting';
    this.cdr.detectChanges();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        this.locationStatus = 'none';
        this.snackBar.open('Location access denied. You can search by city name.', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
        this.search();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        const addr = data.address || {};
        this.cityName = addr.city || addr.town || addr.village || addr.county || 'Unknown';
        this.stateName = addr.state || '';
        this.locationSearch = this.cityName;
        this.locationStatus = 'detected';
        this.cdr.detectChanges();
        this.search();
      },
      error: () => {
        this.locationStatus = 'none';
        this.cdr.detectChanges();
        this.search();
      }
    });
  }

  loadHospitals(): void {
    this.hospitalService.getAll().subscribe({
      next: (res) => { if (res.success) this.hospitals = res.data || []; this.cdr.detectChanges(); }
    });
  }

  search(): void {
    this.doctorService.search(
      this.specialization || undefined,
      this.selectedHospitalId || undefined,
      this.locationSearch || undefined
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.doctors = res.data?.items || [];
          this.totalCount = res.data?.totalCount || 0;
        }
        this.cdr.detectChanges();
      },
      error: () => { this.doctors = []; this.cdr.detectChanges(); }
    });
  }
}
