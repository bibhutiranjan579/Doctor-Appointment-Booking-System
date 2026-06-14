import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FeedbackService } from '../../core/services/feedback.service';
import { AuthService } from '../../core/services/auth.service';
import { DoctorRatingSummary, Feedback } from '../../core/models/models';

@Component({
  selector: 'app-doctor-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCardModule, MatButtonModule, MatSelectModule, MatFormFieldModule, SidebarComponent, TopNavbarComponent, FooterComponent],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="doctor" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="My Feedback & Ratings" theme="doctor" [userName]="authService.currentUser?.name || ''" userRole="Doctor" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          @if (summary) {
            <!-- Stats Row -->
            <div class="stats-row">
              <div class="stat-card accent-green">
                <div class="stat-icon"><mat-icon>star</mat-icon></div>
                <div class="stat-info"><span class="stat-value">{{ summary.averageRating | number:'1.1-1' }}</span><span class="stat-label">Average Rating</span></div>
              </div>
              <div class="stat-card accent-blue">
                <div class="stat-icon"><mat-icon>rate_review</mat-icon></div>
                <div class="stat-info"><span class="stat-value">{{ summary.totalReviews }}</span><span class="stat-label">Total Reviews</span></div>
              </div>
              <div class="stat-card accent-teal">
                <div class="stat-icon"><mat-icon>thumb_up</mat-icon></div>
                <div class="stat-info"><span class="stat-value">{{ summary.sentimentSummary.positive }}</span><span class="stat-label">Positive</span></div>
              </div>
              <div class="stat-card accent-red">
                <div class="stat-icon"><mat-icon>thumb_down</mat-icon></div>
                <div class="stat-info"><span class="stat-value">{{ summary.sentimentSummary.negative }}</span><span class="stat-label">Negative</span></div>
              </div>
            </div>

            <!-- Rating Distribution & Sentiment -->
            <div class="charts-row">
              <div class="section-card">
                <h3 class="section-title"><mat-icon>bar_chart</mat-icon> Rating Distribution</h3>
                @for (star of [5,4,3,2,1]; track star) {
                  <div class="dist-row">
                    <span class="dist-label">{{ star }} ★</span>
                    <div class="dist-bar-bg"><div class="dist-bar-fill" [style.width.%]="getDistPercent(star)"></div></div>
                    <span class="dist-count">{{ summary.ratingDistribution[star] || 0 }}</span>
                  </div>
                }
              </div>
              <div class="section-card">
                <h3 class="section-title"><mat-icon>sentiment_satisfied</mat-icon> Sentiment Analysis</h3>
                <div class="sentiment-chart">
                  <div class="sentiment-bar">
                    @if (summary.totalReviews > 0) {
                      <div class="s-pos" [style.width.%]="(summary.sentimentSummary.positive / summary.totalReviews) * 100"></div>
                      <div class="s-neu" [style.width.%]="(summary.sentimentSummary.neutral / summary.totalReviews) * 100"></div>
                      <div class="s-neg" [style.width.%]="(summary.sentimentSummary.negative / summary.totalReviews) * 100"></div>
                    }
                  </div>
                  <div class="sentiment-legend">
                    <span class="legend-item"><span class="dot dot-pos"></span> Positive ({{ summary.sentimentSummary.positive }})</span>
                    <span class="legend-item"><span class="dot dot-neu"></span> Neutral ({{ summary.sentimentSummary.neutral }})</span>
                    <span class="legend-item"><span class="dot dot-neg"></span> Negative ({{ summary.sentimentSummary.negative }})</span>
                  </div>
                </div>
                @if (summary.topKeywords.length > 0) {
                  <div class="keywords-section">
                    <label class="sub-label">Top Keywords</label>
                    <div class="tag-chips">
                      @for (kw of summary.topKeywords; track kw) { <span class="kw-tag">{{ kw }}</span> }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Reviews with Filter -->
            <div class="section-card">
              <div class="reviews-header">
                <h3 class="section-title" style="margin:0"><mat-icon>reviews</mat-icon> Patient Reviews ({{ filteredFeedbacks.length }})</h3>
                <div class="filter-row">
                  <button class="filter-btn" [class.active]="sortBy === 'latest'" (click)="applySortBy('latest')">Latest</button>
                  <button class="filter-btn" [class.active]="sortBy === 'highest'" (click)="applySortBy('highest')">Highest</button>
                  <button class="filter-btn" [class.active]="sortBy === 'lowest'" (click)="applySortBy('lowest')">Lowest</button>
                  <button class="filter-btn" [class.active]="sentimentFilter" (click)="toggleSentimentFilter()">
                    {{ sentimentFilter || 'All Sentiments' }}
                  </button>
                </div>
              </div>
              @if (filteredFeedbacks.length === 0) {
                <div class="empty-msg"><mat-icon>feedback</mat-icon><p>No feedback received yet.</p></div>
              } @else {
                <div class="feedback-list">
                  @for (f of filteredFeedbacks; track f.id) {
                    <div class="feedback-row">
                      <div class="avatar-circle">{{ f.patientName?.charAt(0) }}</div>
                      <div class="feedback-row__info">
                        <div class="row-top">
                          <span class="patient-name">{{ f.patientName }}</span>
                          <div class="stars">
                            @for (s of [1,2,3,4,5]; track s) {
                              <mat-icon class="star-icon" [class.filled]="s <= f.rating">{{ s <= f.rating ? 'star' : 'star_border' }}</mat-icon>
                            }
                          </div>
                          <span class="sentiment-badge" [class]="'sentiment-' + f.sentiment.toLowerCase()">{{ f.sentiment }}</span>
                          <span class="date">{{ f.createdAt | date:'mediumDate' }}</span>
                        </div>
                        @if (f.tags.length > 0) {
                          <div class="feedback-tags">
                            @for (t of f.tags; track t) { <span class="mini-tag">{{ t }}</span> }
                          </div>
                        }
                        <p class="comment">{{ f.comment }}</p>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="section-card"><div class="empty-msg"><mat-icon>feedback</mat-icon><p>No feedback data available.</p></div></div>
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
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; color: #fff; }
    .accent-green .stat-icon { background: #1b7a5a; }
    .accent-blue .stat-icon { background: #1b3a7b; }
    .accent-teal .stat-icon { background: #00897b; }
    .accent-red .stat-icon { background: #c62828; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 26px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 12px; color: #888; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .section-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 20px; }
    .section-title mat-icon { color: #1b7a5a; }
    .dist-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .dist-label { width: 40px; font-size: 13px; font-weight: 600; color: #555; }
    .dist-bar-bg { flex: 1; height: 12px; background: #e0e0e0; border-radius: 6px; overflow: hidden; }
    .dist-bar-fill { height: 100%; background: linear-gradient(90deg, #f4a825, #ff8f00); border-radius: 6px; transition: width 0.4s ease; }
    .dist-count { width: 28px; font-size: 13px; color: #888; text-align: right; }
    .sentiment-chart { margin-bottom: 16px; }
    .sentiment-bar { display: flex; height: 24px; border-radius: 12px; overflow: hidden; background: #e0e0e0; }
    .s-pos { background: #4caf50; }
    .s-neu { background: #ff9800; }
    .s-neg { background: #f44336; }
    .sentiment-legend { display: flex; gap: 20px; margin-top: 12px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #555; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-pos { background: #4caf50; }
    .dot-neu { background: #ff9800; }
    .dot-neg { background: #f44336; }
    .sub-label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 8px; display: block; margin-top: 16px; }
    .tag-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .kw-tag { padding: 4px 12px; border-radius: 12px; background: #f3e5f5; color: #7b1fa2; font-size: 12px; font-weight: 600; }
    .reviews-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .filter-row { display: flex; gap: 8px; }
    .filter-btn { padding: 6px 16px; border-radius: 20px; border: 2px solid #e0e0e0; background: #fff; color: #555; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-btn:hover { border-color: #1b7a5a; color: #1b7a5a; }
    .filter-btn.active { background: #1b7a5a; color: #fff; border-color: #1b7a5a; }
    .feedback-list { display: flex; flex-direction: column; gap: 12px; }
    .feedback-row { display: flex; gap: 14px; padding: 16px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e8e8e8; }
    .feedback-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .avatar-circle { width: 42px; height: 42px; border-radius: 50%; background: #1b3a7b; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .feedback-row__info { flex: 1; }
    .row-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
    .patient-name { font-weight: 600; color: #1a1a2e; font-size: 14px; }
    .stars { display: flex; gap: 2px; }
    .star-icon { font-size: 16px; width: 16px; height: 16px; color: #ccc; }
    .star-icon.filled { color: #f4a825; }
    .sentiment-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .sentiment-positive { background: #e8f5e9; color: #2e7d32; }
    .sentiment-neutral { background: #fff3e0; color: #e65100; }
    .sentiment-negative { background: #ffebee; color: #c62828; }
    .date { font-size: 12px; color: #888; }
    .feedback-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
    .mini-tag { padding: 2px 10px; border-radius: 12px; background: #e3f2fd; color: #1565c0; font-size: 11px; font-weight: 600; }
    .comment { font-size: 14px; color: #555; line-height: 1.5; margin: 0; }
    .empty-msg { text-align: center; padding: 40px; color: #aaa; }
    .empty-msg mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .empty-msg p { margin: 0; }

    @media (max-width: 1024px) { .dashboard-main { margin-left: 220px; } .charts-row { grid-template-columns: 1fr; } }
    @media (max-width: 768px) {
      .dashboard-main { margin-left: 0; }
      .dashboard-content { padding: 72px 16px 24px; }
      .stats-row { grid-template-columns: 1fr 1fr; }
      .feedback-row { flex-direction: column; }
      .filter-row { flex-wrap: wrap; }
    }
    @media (max-width: 480px) {
      .stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DoctorFeedbackComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/doctor/dashboard' },
    { label: 'Feedback', icon: 'rate_review', route: '/doctor/feedback' },
    { label: 'Chat', icon: 'chat', route: '/doctor/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/doctor/video-call' },
    { label: 'Profile', icon: 'person', route: '/doctor/profile' },
  ];

  summary: DoctorRatingSummary | null = null;
  filteredFeedbacks: Feedback[] = [];
  sortBy = 'latest';
  sentimentFilter = '';

  constructor(public authService: AuthService, private feedbackService: FeedbackService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.feedbackService.getDoctorViewFeedback().subscribe({
      next: (res) => {
        if (res.success) { this.summary = res.data; this.applyFilters(); }
        this.cdr.detectChanges();
      }
    });
  }

  getDistPercent(star: number): number {
    if (!this.summary || this.summary.totalReviews === 0) return 0;
    return ((this.summary.ratingDistribution[star] || 0) / this.summary.totalReviews) * 100;
  }

  applySortBy(sort: string): void { this.sortBy = sort; this.applyFilters(); }

  toggleSentimentFilter(): void {
    const cycle = ['', 'Positive', 'Neutral', 'Negative'];
    const idx = cycle.indexOf(this.sentimentFilter);
    this.sentimentFilter = cycle[(idx + 1) % cycle.length];
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.summary) return;
    let list = [...this.summary.feedbacks];
    if (this.sentimentFilter) list = list.filter(f => f.sentiment === this.sentimentFilter);
    if (this.sortBy === 'highest') list.sort((a, b) => b.rating - a.rating);
    else if (this.sortBy === 'lowest') list.sort((a, b) => a.rating - b.rating);
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.filteredFeedbacks = list;
  }
}
