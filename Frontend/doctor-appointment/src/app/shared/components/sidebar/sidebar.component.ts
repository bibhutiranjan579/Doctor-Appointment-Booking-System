import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <aside class="sidebar" [class]="'sidebar--' + theme">
      <div class="sidebar__brand">
        <mat-icon class="sidebar__brand-icon">local_hospital</mat-icon>
        <span class="sidebar__brand-text">MedBook</span>
      </div>
      <nav>
        <mat-nav-list>
          @for (item of items; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </nav>
      <div class="sidebar__footer">
        <mat-nav-list>
          <a mat-list-item (click)="onLogout()">
            <mat-icon matListItemIcon>logout</mat-icon>
            <span matListItemTitle>Logout</span>
          </a>
        </mat-nav-list>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      z-index: 1001;
      transition: all 0.3s ease;
    }
    .sidebar--admin {
      background: linear-gradient(180deg, #0d1b4a 0%, #1b3a7b 100%);
    }
    .sidebar--doctor {
      background: linear-gradient(180deg, #0a3d2e 0%, #1b7a5a 100%);
    }
    .sidebar--patient {
      background: linear-gradient(180deg, #2d1b69 0%, #5b3a9e 100%);
    }
    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .sidebar__brand-icon {
      color: #fff;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .sidebar__brand-text {
      color: #fff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    nav {
      flex: 1;
      padding-top: 8px;
    }
    .sidebar__footer {
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    :host ::ng-deep .mat-mdc-list-item {
      color: rgba(255,255,255,0.8) !important;
      margin: 4px 8px;
      border-radius: 8px !important;
      transition: all 0.2s ease;
    }
    :host ::ng-deep .mat-mdc-list-item:hover {
      background: rgba(255,255,255,0.12) !important;
      color: #fff !important;
    }
    :host ::ng-deep .active-link {
      background: rgba(255,255,255,0.18) !important;
      color: #fff !important;
    }
    :host ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text {
      color: inherit !important;
    }
    :host ::ng-deep .mat-icon {
      color: inherit !important;
    }
  `]
})
export class SidebarComponent {
  @Input() items: SidebarItem[] = [];
  @Input() theme: 'admin' | 'doctor' | 'patient' = 'admin';
  @Output() logoutClicked = new EventEmitter<void>();

  onLogout(): void {
    this.logoutClicked.emit();
  }
}
