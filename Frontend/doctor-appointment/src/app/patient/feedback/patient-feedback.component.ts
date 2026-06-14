import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FeedbackService } from '../../core/services/feedback.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment, Feedback, CreateFeedback, DoctorRatingSummary } from '../../core/models/models';

@Component({
  selector: 'app-patient-feedback',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatSelectModule,
    MatCardModule, MatCheckboxModule, MatChipsModule, SidebarComponent, TopNavbarComponent, FooterComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="patient" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Feedback & Ratings" theme="patient" [userName]="authService.currentUser?.name || ''" userRole="Patient" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">

          <!-- Submit Feedback Section -->
          <div class="section-card">
            <h3 class="section-title"><mat-icon>rate_review</mat-icon> Submit Feedback</h3>
            @if (completedAppointments.length === 0) {
              <div class="empty-msg"><mat-icon>info</mat-icon><p>No completed appointments available for feedback.</p></div>
            } @else {
              <form (ngSubmit)="submitFeedback()" class="feedback-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Select Appointment</mat-label>
                  <mat-select [(ngModel)]="selectedAppointmentId" name="appointmentId" required>
                    @for (a of completedAppointments; track a.id) {
                      <mat-option [value]="a.id" [disabled]="isFeedbackGiven(a.id)">
                        Dr. {{ a.doctorName }} — {{ a.appointmentDate | date:'mediumDate' }}
                        @if (isFeedbackGiven(a.id)) { <span class="given-tag">✓ Feedback Given</span> }
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <div class="rating-section">
                  <label class="rating-label">Rating</label>
                  <div class="star-rating">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button type="button" class="star-btn" [class.active]="star <= selectedRating"
                        (click)="selectedRating = star" (mouseenter)="hoverRating = star" (mouseleave)="hoverRating = 0">
                        <mat-icon>{{ star <= (hoverRating || selectedRating) ? 'star' : 'star_border' }}</mat-icon>
                      </button>
                    }
                    <span class="rating-text">{{ ratingLabels[selectedRating] || 'Select a rating' }}</span>
                  </div>
                </div>

                <!-- Tags -->
                <div class="tags-section">
                  <label class="rating-label">Quick Tags</label>
                  <div class="tag-chips">
                    @for (tag of availableTags; track tag) {
                      <button type="button" class="tag-chip" [class.selected]="selectedTags.includes(tag)" (click)="toggleTag(tag)">
                        {{ tag }}
                      </button>
                    }
                  </div>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Your Feedback</mat-label>
                  <textarea matInput [(ngModel)]="feedbackComment" name="comment" rows="4" placeholder="Share your experience with the doctor..."></textarea>
                </mat-form-field>

                <div class="anon-section">
                  <mat-checkbox [(ngModel)]="isAnonymous" name="anonymous">Submit anonymously</mat-checkbox>
                  <span class="anon-hint">Your name won't be visible to the doctor</span>
                </div>

                <button mat-raised-button class="submit-btn" type="submit"
                  [disabled]="!selectedAppointmentId || selectedRating === 0 || isFeedbackGiven(selectedAppointmentId)">
                  <mat-icon>send</mat-icon> Submit Feedback
                </button>
              </form>
            }
          </div>

          <!-- My Feedbacks -->
          <div class="section-card">
            <h3 class="section-title"><mat-icon>history</mat-icon> My Feedbacks ({{ myFeedbacks.length }})</h3>
            @if (myFeedbacks.length === 0) {
              <div class="empty-msg"><mat-icon>feedback</mat-icon><p>You haven't submitted any feedback yet.</p></div>
            } @else {
              <div class="feedback-grid">
                @for (f of myFeedbacks; track f.id) {
                  <div class="feedback-card" [class.flagged]="f.isFlagged">
                    <div class="feedback-card__header">
                      <div class="doctor-info">
                        <div class="avatar-circle">{{ f.doctorName?.charAt(0) }}</div>
                        <div>
                          <h4>Dr. {{ f.doctorName }}</h4>
                          <span class="date">{{ f.createdAt | date:'mediumDate' }}</span>
                        </div>
                      </div>
                      <div class="stars-and-sentiment">
                        <div class="stars">
                          @for (s of [1,2,3,4,5]; track s) {
                            <mat-icon class="star-icon" [class.filled]="s <= f.rating">{{ s <= f.rating ? 'star' : 'star_border' }}</mat-icon>
                          }
                        </div>
                        <span class="sentiment-badge" [class]="'sentiment-' + f.sentiment.toLowerCase()">{{ f.sentiment }}</span>
                      </div>
                    </div>
                    @if (f.tags.length > 0) {
                      <div class="feedback-tags">
                        @for (t of f.tags; track t) { <span class="mini-tag">{{ t }}</span> }
                      </div>
                    }
                    <p class="feedback-comment">{{ f.comment }}</p>
                    @if (f.isAnonymous) { <span class="anon-badge"><mat-icon>visibility_off</mat-icon> Anonymous</span> }
                  </div>
                }
              </div>
            }
          </div>

          <!-- View Doctor Ratings -->
          @if (selectedDoctorSummary) {
            <div class="section-card">
              <h3 class="section-title"><mat-icon>person</mat-icon> Dr. {{ selectedDoctorSummary.doctorName }} — Reviews</h3>
              <div class="rating-overview">
                <div class="rating-big">{{ selectedDoctorSummary.averageRating | number:'1.1-1' }}</div>
                <div class="rating-detail">
                  <div class="rating-stars-row">
                    @for (s of [1,2,3,4,5]; track s) {
                      <mat-icon class="star-icon-lg" [class.filled]="s <= selectedDoctorSummary.averageRating">
                        {{ s <= selectedDoctorSummary.averageRating ? 'star' : 'star_border' }}
                      </mat-icon>
                    }
                  </div>
                  <span class="review-count">{{ selectedDoctorSummary.totalReviews }} review(s)</span>
                </div>
              </div>
              <!-- Rating Distribution Bar -->
              <div class="distribution-section">
                @for (star of [5,4,3,2,1]; track star) {
                  <div class="dist-row">
                    <span class="dist-label">{{ star }} ★</span>
                    <div class="dist-bar-bg">
                      <div class="dist-bar-fill" [style.width.%]="getDistPercent(star)"></div>
                    </div>
                    <span class="dist-count">{{ selectedDoctorSummary.ratingDistribution[star] || 0 }}</span>
                  </div>
                }
              </div>
              @if (selectedDoctorSummary.topKeywords.length > 0) {
                <div class="keywords-section">
                  <label class="rating-label">Popular Keywords</label>
                  <div class="tag-chips">
                    @for (kw of selectedDoctorSummary.topKeywords; track kw) {
                      <span class="mini-tag keyword-tag">{{ kw }}</span>
                    }
                  </div>
                </div>
              }
              <div class="feedback-grid" style="margin-top: 16px;">
                @for (f of selectedDoctorSummary.feedbacks; track f.id) {
                  <div class="feedback-card">
                    <div class="feedback-card__header">
                      <div class="doctor-info">
                        <div class="avatar-circle patient-avatar">{{ f.patientName?.charAt(0) }}</div>
                        <div>
                          <h4>{{ f.patientName }}</h4>
                          <span class="date">{{ f.createdAt | date:'mediumDate' }}</span>
                        </div>
                      </div>
                      <div class="stars">
                        @for (s of [1,2,3,4,5]; track s) {
                          <mat-icon class="star-icon" [class.filled]="s <= f.rating">{{ s <= f.rating ? 'star' : 'star_border' }}</mat-icon>
                        }
                      </div>
                    </div>
                    @if (f.tags.length > 0) {
                      <div class="feedback-tags">
                        @for (t of f.tags; track t) { <span class="mini-tag">{{ t }}</span> }
                      </div>
                    }
                    <p class="feedback-comment">{{ f.comment }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
    .dashboard-main { flex: 1; margin-left: 260px; display: flex; flex-direction: column; }
    .dashboard-content { padding: 88px 32px 32px; flex: 1; }
    .section-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 20px; }
    .section-title mat-icon { color: #1b3a7b; }
    .full-width { width: 100%; }
    .feedback-form { max-width: 640px; }
    .rating-section { margin-bottom: 16px; }
    .rating-label { font-size: 14px; font-weight: 500; color: #555; margin-bottom: 8px; display: block; }
    .star-rating { display: flex; gap: 4px; align-items: center; }
    .star-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #ccc; transition: all 0.2s; }
    .star-btn.active, .star-btn:hover { color: #f4a825; transform: scale(1.15); }
    .star-btn mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .rating-text { margin-left: 12px; font-size: 14px; color: #666; font-weight: 500; }
    .tags-section { margin-bottom: 16px; }
    .tag-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .tag-chip { padding: 6px 14px; border-radius: 20px; border: 2px solid #e0e0e0; background: #fff; color: #555; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .tag-chip:hover { border-color: #1b3a7b; color: #1b3a7b; }
    .tag-chip.selected { background: #1b3a7b; color: #fff; border-color: #1b3a7b; }
    .anon-section { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .anon-hint { font-size: 12px; color: #999; }
    .submit-btn { background: #1b3a7b !important; color: #fff !important; height: 44px; border-radius: 8px !important; display: flex; align-items: center; gap: 8px; }
    .submit-btn:disabled { opacity: 0.5; }
    .given-tag { font-size: 11px; color: #4caf50; margin-left: 8px; }
    .feedback-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
    .feedback-card { background: #f8f9fa; border-radius: 10px; padding: 16px; border: 1px solid #e8e8e8; transition: box-shadow 0.2s; }
    .feedback-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .feedback-card.flagged { border-left: 4px solid #ff9800; }
    .feedback-card__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .doctor-info { display: flex; align-items: center; gap: 12px; }
    .doctor-info h4 { margin: 0; font-size: 15px; font-weight: 600; color: #1a1a2e; }
    .date { font-size: 12px; color: #888; }
    .avatar-circle { width: 42px; height: 42px; border-radius: 50%; background: #1b7a5a; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
    .patient-avatar { background: #1b3a7b; }
    .stars-and-sentiment { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .stars { display: flex; gap: 2px; }
    .star-icon { font-size: 18px; width: 18px; height: 18px; color: #ccc; }
    .star-icon.filled { color: #f4a825; }
    .sentiment-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .sentiment-positive { background: #e8f5e9; color: #2e7d32; }
    .sentiment-neutral { background: #fff3e0; color: #e65100; }
    .sentiment-negative { background: #ffebee; color: #c62828; }
    .feedback-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .mini-tag { padding: 2px 10px; border-radius: 12px; background: #e3f2fd; color: #1565c0; font-size: 11px; font-weight: 600; }
    .keyword-tag { background: #f3e5f5; color: #7b1fa2; }
    .feedback-comment { font-size: 14px; color: #555; line-height: 1.5; margin: 0; }
    .anon-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #999; margin-top: 8px; }
    .anon-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .rating-overview { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 10px; }
    .rating-big { font-size: 42px; font-weight: 700; color: #1a1a2e; }
    .rating-detail { display: flex; flex-direction: column; gap: 4px; }
    .rating-stars-row { display: flex; gap: 4px; }
    .star-icon-lg { font-size: 28px; width: 28px; height: 28px; color: #ccc; }
    .star-icon-lg.filled { color: #f4a825; }
    .review-count { font-size: 14px; color: #888; }
    .distribution-section { margin-bottom: 16px; }
    .dist-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .dist-label { width: 40px; font-size: 13px; font-weight: 600; color: #555; }
    .dist-bar-bg { flex: 1; height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden; }
    .dist-bar-fill { height: 100%; background: #f4a825; border-radius: 5px; transition: width 0.3s; }
    .dist-count { width: 28px; font-size: 13px; color: #888; text-align: right; }
    .keywords-section { margin-bottom: 16px; }
    .empty-msg { text-align: center; padding: 32px; color: #aaa; }
    .empty-msg mat-icon { font-size: 40px; width: 40px; height: 40px; margin-bottom: 8px; }
    .empty-msg p { margin: 0; }

    @media (max-width: 1024px) { .dashboard-main { margin-left: 220px; } }
    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; }
      .dashboard-content { padding: 72px 16px 24px; }
    }
  `]
})
export class PatientFeedbackComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctors', icon: 'search', route: '/patient/search-doctors' },
    { label: 'Feedback', icon: 'rate_review', route: '/patient/feedback' },
    { label: 'Chat', icon: 'chat', route: '/patient/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/patient/video-call' },
    { label: 'Profile', icon: 'person', route: '/patient/profile' },
  ];

  completedAppointments: Appointment[] = [];
  myFeedbacks: Feedback[] = [];
  feedbackGivenIds = new Set<string>();
  selectedAppointmentId = '';
  selectedRating = 0;
  hoverRating = 0;
  feedbackComment = '';
  isAnonymous = false;
  selectedTags: string[] = [];
  selectedDoctorSummary: DoctorRatingSummary | null = null;

  ratingLabels: { [key: number]: string } = {
    1: 'Poor', 2: 'Below Average', 3: 'Average', 4: 'Good', 5: 'Excellent'
  };
  availableTags = [
    'Good Communication', 'Knowledgeable', 'Friendly', 'Professional',
    'Long Wait Time', 'Rushed', 'Expensive', 'Thorough Examination',
    'Good Listener', 'Clean Facility', 'Punctual', 'Compassionate'
  ];

  constructor(
    public authService: AuthService,
    private feedbackService: FeedbackService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (res) => {
        if (res.success) this.completedAppointments = (res.data || []).filter((a: Appointment) => a.status === 3);
        this.cdr.detectChanges();
      }
    });
    this.feedbackService.getMyFeedbacks().subscribe({
      next: (res) => {
        if (res.success) {
          this.myFeedbacks = res.data || [];
          this.feedbackGivenIds = new Set(this.myFeedbacks.map(f => f.appointmentId));
          if (this.myFeedbacks.length > 0) this.loadDoctorSummary(this.myFeedbacks[0].doctorId);
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadDoctorSummary(doctorId: string): void {
    this.feedbackService.getDoctorSummary(doctorId).subscribe({
      next: (res) => { if (res.success) this.selectedDoctorSummary = res.data; this.cdr.detectChanges(); }
    });
  }

  isFeedbackGiven(appointmentId: string): boolean { return this.feedbackGivenIds.has(appointmentId); }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx >= 0) this.selectedTags.splice(idx, 1);
    else this.selectedTags.push(tag);
  }

  getDistPercent(star: number): number {
    if (!this.selectedDoctorSummary || this.selectedDoctorSummary.totalReviews === 0) return 0;
    return ((this.selectedDoctorSummary.ratingDistribution[star] || 0) / this.selectedDoctorSummary.totalReviews) * 100;
  }

  submitFeedback(): void {
    if (!this.selectedAppointmentId || this.selectedRating === 0 || this.isFeedbackGiven(this.selectedAppointmentId)) return;
    const dto: CreateFeedback = {
      appointmentId: this.selectedAppointmentId,
      rating: this.selectedRating,
      comment: this.feedbackComment,
      tags: this.selectedTags,
      isAnonymous: this.isAnonymous
    };
    this.feedbackService.create(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Feedback submitted!', 'Close', { duration: 3000 });
          this.selectedAppointmentId = '';
          this.selectedRating = 0;
          this.feedbackComment = '';
          this.selectedTags = [];
          this.isAnonymous = false;
          this.loadData();
        }
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Error submitting feedback', 'Close', { duration: 3000 })
    });
  }
}
