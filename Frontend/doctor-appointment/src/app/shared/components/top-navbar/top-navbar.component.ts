import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule],
  template: `
    <mat-toolbar class="top-navbar" [class]="'top-navbar--' + theme">
      <span class="page-title">{{ title }}</span>
      <span class="spacer"></span>

      <button mat-icon-button class="nav-btn" [matBadge]="notificationCount > 0 ? notificationCount : null" matBadgeColor="warn" matBadgeSize="small">
        <mat-icon>notifications</mat-icon>
      </button>

      <button mat-icon-button class="nav-btn" [matMenuTriggerFor]="profileMenu">
        <div class="avatar">{{ userInitial }}</div>
      </button>
      <mat-menu #profileMenu="matMenu">
        <div class="profile-info">
          <strong>{{ userName }}</strong>
          <span class="profile-role">{{ userRole }}</span>
        </div>
        <button mat-menu-item (click)="logoutClicked.emit()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .top-navbar {
      position: fixed;
      top: 0;
      left: 260px;
      right: 0;
      z-index: 1000;
      height: 64px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .spacer { flex: 1; }
    .nav-btn {
      color: #555;
      margin-left: 4px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: #fff;
    }
    .top-navbar--admin .avatar { background: #1b3a7b; }
    .top-navbar--doctor .avatar { background: #1b7a5a; }
    .top-navbar--patient .avatar { background: #5b3a9e; }
    .profile-info {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid #eee;
    }
    .profile-role {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
    }

    /* Tablet */
    @media (max-width: 1024px) {
      .top-navbar {
        left: 220px;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .top-navbar {
        left: 0;
        padding-left: 64px;
        height: 56px;
      }
      .page-title {
        font-size: 16px;
      }
    }
  `]
})
export class TopNavbarComponent {
  @Input() title = 'Dashboard';
  @Input() theme: 'admin' | 'doctor' | 'patient' = 'admin';
  @Input() userName = '';
  @Input() userRole = '';
  @Input() notificationCount = 0;
  @Output() logoutClicked = new EventEmitter<void>();

  get userInitial(): string {
    return this.userName ? this.userName.charAt(0).toUpperCase() : '?';
  }
}
