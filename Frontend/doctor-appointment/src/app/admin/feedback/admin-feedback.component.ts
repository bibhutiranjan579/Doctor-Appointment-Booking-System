import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FeedbackService } from '../../core/services/feedback.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminFeedbackAnalytics, Feedback } from '../../core/models/models';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatButtonModule, MatSnackBarModule, SidebarComponent, TopNavbarComponent, FooterComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="admin" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Feedback Analytics" theme="admin" [userName]="authService.currentUser?.name || ''" userRole="Administrator" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          @if (analytics) {
            <!-- Tabs -->
            <div class="tab-row">
              <button class="tab-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'"><mat-icon>dashboard</mat-icon> Overview</button>
              <button class="tab-btn" [class.active]="activeTab === 'doctors'" (click)="activeTab = 'doctors'"><mat-icon>people</mat-icon> Doctor Performance</button>
              <button class="tab-btn" [class.active]="activeTab === 'moderation'" (click)="activeTab = 'moderation'"><mat-icon>shield</mat-icon> Moderation ({{ analytics.flaggedReviews }})</button>
              <button class="tab-btn" [class.active]="activeTab === 'reviews'" (click)="activeTab = 'reviews'"><mat-icon>reviews</mat-icon> Recent Reviews</button>
            </div>

            <!-- OVERVIEW TAB -->
            @if (activeTab === 'overview') {
              <div class="stats-row">
                <div class="stat-card accent-blue"><div class="stat-icon"><mat-icon>rate_review</mat-icon></div><div class="stat-info"><span class="stat-value">{{ analytics.totalReviews }}</span><span class="stat-label">Total Reviews</span></div></div>
                <div class="stat-card accent-green"><div class="stat-icon"><mat-icon>star</mat-icon></div><div class="stat-info"><span class="stat-value">{{ analytics.platformAverageRating | number:'1.1-1' }}</span><span class="stat-label">Platform Avg Rating</span></div></div>
                <div class="stat-card accent-teal"><div class="stat-icon"><mat-icon>medical_services</mat-icon></div><div class="stat-info"><span class="stat-value">{{ analytics.uniqueDoctorsRated }}</span><span class="stat-label">Doctors Rated</span></div></div>
                <div class="stat-card accent-purple"><div class="stat-icon"><mat-icon>person</mat-icon></div><div class="stat-info"><span class="stat-value">{{ analytics.uniquePatientsReviewed }}</span><span class="stat-label">Unique Patients</span></div></div>
                <div class="stat-card accent-orange"><div class="stat-icon"><mat-icon>flag</mat-icon></div><div class="stat-info"><span class="stat-value">{{ analytics.flaggedReviews }}</span><span class="stat-label">Flagged Reviews</span></div></div>
              </div>

              <div class="charts-row">
                <!-- Rating Distribution -->
                <div class="section-card">
                  <h3 class="section-title"><mat-icon>bar_chart</mat-icon> Rating Distribution</h3>
                  @for (star of [5,4,3,2,1]; track star) {
                    <div class="dist-row">
                      <span class="dist-label">{{ star }} ★</span>
                      <div class="dist-bar-bg"><div class="dist-bar-fill" [style.width.%]="getDistPercent(star)"></div></div>
                      <span class="dist-count">{{ analytics.ratingDistribution[star] || 0 }}</span>
                    </div>
                  }
                </div>
                <!-- Sentiment Breakdown -->
                <div class="section-card">
                  <h3 class="section-title"><mat-icon>sentiment_satisfied</mat-icon> Sentiment Breakdown</h3>
                  <div class="sentiment-pie">
                    <div class="pie-visual">
                      <div class="pie-ring" [style.background]="pieGradient"></div>
                      <div class="pie-center">{{ analytics.totalReviews }}<br><small>reviews</small></div>
                    </div>
                    <div class="pie-legend">
                      <div class="legend-row"><span class="dot bg-green"></span> Positive <strong>{{ analytics.sentimentSummary.positive }}</strong></div>
                      <div class="legend-row"><span class="dot bg-orange"></span> Neutral <strong>{{ analytics.sentimentSummary.neutral }}</strong></div>
                      <div class="legend-row"><span class="dot bg-red"></span> Negative <strong>{{ analytics.sentimentSummary.negative }}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Monthly Trends -->
              <div class="section-card">
                <h3 class="section-title"><mat-icon>trending_up</mat-icon> Monthly Trends</h3>
                @if (analytics.monthlyTrends.length > 0) {
                  <div class="trends-chart">
                    @for (t of analytics.monthlyTrends; track t.month) {
                      <div class="trend-col">
                        <div class="trend-bar-wrap">
                          <div class="trend-bar" [style.height.%]="getTrendHeight(t.reviewCount)">
                            <span class="trend-value">{{ t.reviewCount }}</span>
                          </div>
                        </div>
                        <div class="trend-avg">★ {{ t.averageRating | number:'1.1-1' }}</div>
                        <span class="trend-label">{{ t.month }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-muted">No trend data available yet.</p>
                }
              </div>

              <!-- Top Keywords -->
              @if (analytics.topKeywords.length > 0) {
                <div class="section-card">
                  <h3 class="section-title"><mat-icon>label</mat-icon> Top Keywords</h3>
                  <div class="tag-chips">
                    @for (kw of analytics.topKeywords; track kw; let i = $index) {
                      <span class="kw-tag" [style.font-size.px]="16 - i">{{ kw }}</span>
                    }
                  </div>
                </div>
              }
            }

            <!-- DOCTOR PERFORMANCE TAB -->
            @if (activeTab === 'doctors') {
              <div class="charts-row">
                <div class="section-card">
                  <h3 class="section-title"><mat-icon>emoji_events</mat-icon> Top Rated Doctors</h3>
                  @if (analytics.topDoctors.length === 0) {
                    <p class="text-muted">No data available.</p>
                  } @else {
                    <div class="perf-list">
                      @for (d of analytics.topDoctors; track d.doctorId; let i = $index) {
                        <div class="perf-row" [class.gold]="i === 0" [class.silver]="i === 1" [class.bronze]="i === 2">
                          <span class="rank">#{{ i + 1 }}</span>
                          <div class="avatar-circle doc-av">{{ d.doctorName?.charAt(0) }}</div>
                          <div class="perf-info">
                            <span class="perf-name">Dr. {{ d.doctorName }}</span>
                            <span class="perf-sub">{{ d.reviewCount }} review(s)</span>
                          </div>
                          <div class="perf-rating">
                            <mat-icon class="star-filled">star</mat-icon>
                            <span>{{ d.averageRating | number:'1.1-1' }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
                <div class="section-card">
                  <h3 class="section-title"><mat-icon>warning</mat-icon> Low Rated Doctors</h3>
                  @if (analytics.lowRatedDoctors.length === 0) {
                    <p class="text-muted">No low-rated doctors.</p>
                  } @else {
                    <div class="perf-list">
                      @for (d of analytics.lowRatedDoctors; track d.doctorId; let i = $index) {
                        <div class="perf-row low-rated">
                          <span class="rank">#{{ i + 1 }}</span>
                          <div class="avatar-circle low-av">{{ d.doctorName?.charAt(0) }}</div>
                          <div class="perf-info">
                            <span class="perf-name">Dr. {{ d.doctorName }}</span>
                            <span class="perf-sub">{{ d.reviewCount }} review(s)</span>
                          </div>
                          <div class="perf-rating low">
                            <mat-icon class="star-filled">star</mat-icon>
                            <span>{{ d.averageRating | number:'1.1-1' }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- MODERATION TAB -->
            @if (activeTab === 'moderation') {
              <div class="section-card">
                <h3 class="section-title"><mat-icon>shield</mat-icon> Flagged Reviews ({{ analytics.flaggedFeedbacks.length }})</h3>
                @if (analytics.flaggedFeedbacks.length === 0) {
                  <div class="empty-msg"><mat-icon>verified</mat-icon><p>No flagged reviews. All clear!</p></div>
                } @else {
                  <div class="feedback-list">
                    @for (f of analytics.flaggedFeedbacks; track f.id) {
                      <div class="feedback-row flagged-row">
                        <div class="avatar-circle flag-av">{{ f.patientName?.charAt(0) }}</div>
                        <div class="feedback-row__info">
                          <div class="row-top">
                            <span class="patient-name">{{ f.patientName }}</span>
                            <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                            <span class="doctor-name">Dr. {{ f.doctorName }}</span>
                            <div class="stars">@for (s of [1,2,3,4,5]; track s) { <mat-icon class="star-icon" [class.filled]="s <= f.rating">{{ s <= f.rating ? 'star' : 'star_border' }}</mat-icon> }</div>
                            <span class="sentiment-badge" [class]="'sentiment-' + f.sentiment.toLowerCase()">{{ f.sentiment }}</span>
                            <span class="status-badge" [class]="'status-' + f.moderationStatus.toLowerCase()">{{ f.moderationStatus }}</span>
                          </div>
                          @if (f.tags.length > 0) {
                            <div class="feedback-tags">@for (t of f.tags; track t) { <span class="mini-tag">{{ t }}</span> }</div>
                          }
                          <p class="comment">{{ f.comment }}</p>
                          <div class="mod-actions">
                            <button mat-raised-button class="approve-btn" (click)="moderateFeedback(f.id, 'Approved')"><mat-icon>check_circle</mat-icon> Approve</button>
                            <button mat-raised-button class="reject-btn" (click)="moderateFeedback(f.id, 'Rejected')"><mat-icon>cancel</mat-icon> Reject</button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- RECENT REVIEWS TAB -->
            @if (activeTab === 'reviews') {
              <div class="section-card">
                <h3 class="section-title"><mat-icon>reviews</mat-icon> Recent Reviews ({{ analytics.recentFeedbacks.length }})</h3>
                @if (analytics.recentFeedbacks.length === 0) {
                  <div class="empty-msg"><mat-icon>feedback</mat-icon><p>No feedback received yet.</p></div>
                } @else {
                  <div class="feedback-list">
                    @for (f of analytics.recentFeedbacks; track f.id) {
                      <div class="feedback-row" [class.flagged-row]="f.isFlagged">
                        <div class="avatar-circle patient-av">{{ f.patientName?.charAt(0) }}</div>
                        <div class="feedback-row__info">
                          <div class="row-top">
                            <span class="patient-name">{{ f.patientName }}</span>
                            <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                            <span class="doctor-name">Dr. {{ f.doctorName }}</span>
                            <div class="stars">@for (s of [1,2,3,4,5]; track s) { <mat-icon class="star-icon" [class.filled]="s <= f.rating">{{ s <= f.rating ? 'star' : 'star_border' }}</mat-icon> }</div>
                            <span class="sentiment-badge" [class]="'sentiment-' + f.sentiment.toLowerCase()">{{ f.sentiment }}</span>
                            <span class="date">{{ f.createdAt | date:'mediumDate' }}</span>
                            @if (f.isFlagged) { <mat-icon class="flag-icon">flag</mat-icon> }
                          </div>
                          @if (f.tags.length > 0) {
                            <div class="feedback-tags">@for (t of f.tags; track t) { <span class="mini-tag">{{ t }}</span> }</div>
                          }
                          <p class="comment">{{ f.comment }}</p>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          } @else {
            <div class="section-card"><div class="empty-msg"><mat-icon>hourglass_empty</mat-icon><p>Loading analytics...</p></div></div>
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

    .tab-row { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .tab-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; border: 2px solid #e0e0e0; background: #fff; color: #555; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .tab-btn:hover { border-color: #1b3a7b; color: #1b3a7b; }
    .tab-btn.active { background: #1b3a7b; color: #fff; border-color: #1b3a7b; }
    .tab-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 24px; width: 24px; height: 24px; color: #fff; }
    .accent-blue .stat-icon { background: #1b3a7b; }
    .accent-green .stat-icon { background: #1b7a5a; }
    .accent-teal .stat-icon { background: #00897b; }
    .accent-purple .stat-icon { background: #7b1fa2; }
    .accent-orange .stat-icon { background: #ff6f00; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .section-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 20px; }
    .section-title mat-icon { color: #1b3a7b; }

    .dist-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .dist-label { width: 40px; font-size: 13px; font-weight: 600; color: #555; }
    .dist-bar-bg { flex: 1; height: 12px; background: #e0e0e0; border-radius: 6px; overflow: hidden; }
    .dist-bar-fill { height: 100%; background: linear-gradient(90deg, #f4a825, #ff8f00); border-radius: 6px; transition: width 0.4s ease; }
    .dist-count { width: 28px; font-size: 13px; color: #888; text-align: right; }

    .sentiment-pie { display: flex; align-items: center; gap: 32px; }
    .pie-visual { position: relative; width: 140px; height: 140px; }
    .pie-ring { width: 140px; height: 140px; border-radius: 50%; }
    .pie-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 80px; height: 80px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: 700; font-size: 18px; color: #1a1a2e; line-height: 1.2; }
    .pie-center small { font-size: 11px; font-weight: 400; color: #888; }
    .pie-legend { display: flex; flex-direction: column; gap: 10px; }
    .legend-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #555; }
    .legend-row strong { margin-left: auto; color: #1a1a2e; }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .bg-green { background: #4caf50; }
    .bg-orange { background: #ff9800; }
    .bg-red { background: #f44336; }

    .trends-chart { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding: 16px 0; overflow-x: auto; }
    .trend-col { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 60px; flex: 1; }
    .trend-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
    .trend-bar { width: 36px; background: linear-gradient(180deg, #1b3a7b, #3f51b5); border-radius: 6px 6px 0 0; display: flex; align-items: flex-start; justify-content: center; min-height: 8px; transition: height 0.4s ease; }
    .trend-value { color: #fff; font-size: 11px; font-weight: 700; padding-top: 4px; }
    .trend-avg { font-size: 11px; color: #f4a825; font-weight: 600; }
    .trend-label { font-size: 11px; color: #888; }

    .tag-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .kw-tag { padding: 6px 16px; border-radius: 16px; background: #f3e5f5; color: #7b1fa2; font-weight: 600; }

    .perf-list { display: flex; flex-direction: column; gap: 10px; }
    .perf-row { display: flex; align-items: center; gap: 14px; padding: 14px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e8e8e8; transition: all 0.2s; }
    .perf-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .perf-row.gold { border-left: 4px solid #ffd700; }
    .perf-row.silver { border-left: 4px solid #c0c0c0; }
    .perf-row.bronze { border-left: 4px solid #cd7f32; }
    .perf-row.low-rated { border-left: 4px solid #f44336; }
    .rank { font-size: 16px; font-weight: 700; color: #888; width: 30px; text-align: center; }
    .avatar-circle { width: 42px; height: 42px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .doc-av { background: #1b7a5a; }
    .low-av { background: #c62828; }
    .patient-av { background: #1b3a7b; }
    .flag-av { background: #ff6f00; }
    .perf-info { flex: 1; display: flex; flex-direction: column; }
    .perf-name { font-weight: 600; color: #1a1a2e; font-size: 14px; }
    .perf-sub { font-size: 12px; color: #888; }
    .perf-rating { display: flex; align-items: center; gap: 4px; font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .perf-rating.low { color: #c62828; }
    .star-filled { color: #f4a825; font-size: 22px; width: 22px; height: 22px; }

    .feedback-list { display: flex; flex-direction: column; gap: 12px; }
    .feedback-row { display: flex; gap: 14px; padding: 16px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e8e8e8; transition: all 0.2s; }
    .feedback-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .flagged-row { border-left: 4px solid #ff9800; background: #fffde7; }
    .feedback-row__info { flex: 1; }
    .row-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .patient-name { font-weight: 600; color: #1b3a7b; font-size: 14px; }
    .doctor-name { font-weight: 600; color: #1b7a5a; font-size: 14px; }
    .arrow-icon { font-size: 16px; width: 16px; height: 16px; color: #aaa; }
    .stars { display: flex; gap: 2px; }
    .star-icon { font-size: 16px; width: 16px; height: 16px; color: #ccc; }
    .star-icon.filled { color: #f4a825; }
    .sentiment-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .sentiment-positive { background: #e8f5e9; color: #2e7d32; }
    .sentiment-neutral { background: #fff3e0; color: #e65100; }
    .sentiment-negative { background: #ffebee; color: #c62828; }
    .status-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-pending { background: #fff3e0; color: #e65100; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .date { font-size: 12px; color: #888; }
    .flag-icon { font-size: 16px; width: 16px; height: 16px; color: #ff9800; }
    .feedback-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
    .mini-tag { padding: 2px 10px; border-radius: 12px; background: #e3f2fd; color: #1565c0; font-size: 11px; font-weight: 600; }
    .comment { font-size: 14px; color: #555; line-height: 1.5; margin: 0; }
    .mod-actions { display: flex; gap: 8px; margin-top: 12px; }
    .approve-btn { background: #4caf50 !important; color: #fff !important; border-radius: 8px !important; display: flex; align-items: center; gap: 4px; }
    .reject-btn { background: #f44336 !important; color: #fff !important; border-radius: 8px !important; display: flex; align-items: center; gap: 4px; }

    .text-muted { color: #aaa; font-size: 14px; }
    .empty-msg { text-align: center; padding: 40px; color: #aaa; }
    .empty-msg mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .empty-msg p { margin: 0; }

    @media (max-width: 1024px) { .dashboard-main { margin-left: 220px; } }
    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; }
      .dashboard-content { padding: 72px 16px 24px; }
    }
  `]
})
export class AdminFeedbackComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Manage Doctors', icon: 'medical_services', route: '/admin/manage-doctors' },
    { label: 'Manage Hospitals', icon: 'local_hospital', route: '/admin/manage-hospitals' },
    { label: 'Appointments', icon: 'calendar_today', route: '/admin/appointments' },
    { label: 'Feedback', icon: 'rate_review', route: '/admin/feedback' },
    { label: 'Manage Users', icon: 'group', route: '/admin/manage-users' },
    { label: 'Profile', icon: 'person', route: '/admin/profile' },
  ];

  analytics: AdminFeedbackAnalytics | null = null;
  activeTab = 'overview';
  pieGradient = '';
  maxTrend = 1;

  constructor(
    public authService: AuthService,
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.feedbackService.getAdminAnalytics().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.analytics = res.data;
          this.buildPieGradient();
          this.maxTrend = Math.max(...this.analytics.monthlyTrends.map(t => t.reviewCount), 1);
        }
        this.cdr.detectChanges();
      }
    });
  }

  getDistPercent(star: number): number {
    if (!this.analytics || this.analytics.totalReviews === 0) return 0;
    return ((this.analytics.ratingDistribution[star] || 0) / this.analytics.totalReviews) * 100;
  }

  getTrendHeight(count: number): number {
    return (count / this.maxTrend) * 100;
  }

  buildPieGradient(): void {
    if (!this.analytics || this.analytics.totalReviews === 0) { this.pieGradient = '#e0e0e0'; return; }
    const total = this.analytics.totalReviews;
    const pos = (this.analytics.sentimentSummary.positive / total) * 360;
    const neu = (this.analytics.sentimentSummary.neutral / total) * 360;
    this.pieGradient = `conic-gradient(#4caf50 0deg ${pos}deg, #ff9800 ${pos}deg ${pos + neu}deg, #f44336 ${pos + neu}deg 360deg)`;
  }

  moderateFeedback(id: string, status: string): void {
    this.feedbackService.moderate(id, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open(`Feedback ${status.toLowerCase()}!`, 'Close', { duration: 3000 });
          this.ngOnInit();
        }
      },
      error: () => this.snackBar.open('Failed to moderate feedback', 'Close', { duration: 3000 })
    });
  }
}
