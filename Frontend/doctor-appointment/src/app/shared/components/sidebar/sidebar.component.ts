import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <!-- Mobile backdrop -->
    <div class="sidebar-backdrop" [class.active]="mobileOpen" (click)="closeMobile()"></div>

    <!-- Mobile hamburger button -->
    <button class="mobile-toggle" (click)="toggleMobile()" [class]="'mobile-toggle--' + theme">
      <mat-icon>{{ mobileOpen ? 'close' : 'menu' }}</mat-icon>
    </button>

    <aside class="sidebar" [class]="'sidebar--' + theme" [class.sidebar--open]="mobileOpen">
      <div class="sidebar__brand">
        <mat-icon class="sidebar__brand-icon">local_hospital</mat-icon>
        <span class="sidebar__brand-text">MedBook</span>
      </div>
      <nav>
        <mat-nav-list>
          @for (item of items; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link" (click)="closeMobile()">
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
    .mobile-toggle {
      display: none;
      position: fixed;
      top: 14px;
      left: 16px;
      z-index: 1100;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      color: #fff;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .mobile-toggle--admin { background: #1b3a7b; }
    .mobile-toggle--doctor { background: #1b7a5a; }
    .mobile-toggle--patient { background: #5b3a9e; }

    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .sidebar-backdrop.active {
      display: block;
      opacity: 1;
    }

    .sidebar {
      width: 260px;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      z-index: 1001;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      overflow-y: auto;
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

    /* Tablet */
    @media (max-width: 1024px) {
      .sidebar {
        width: 220px;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .mobile-toggle {
        display: flex;
      }
      .sidebar {
        transform: translateX(-100%);
        width: 280px;
        box-shadow: 4px 0 24px rgba(0,0,0,0.3);
      }
      .sidebar--open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() items: SidebarItem[] = [];
  @Input() theme: 'admin' | 'doctor' | 'patient' = 'admin';
  @Output() logoutClicked = new EventEmitter<void>();

  mobileOpen = false;

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  onLogout(): void {
    this.logoutClicked.emit();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.mobileOpen = false;
    }
  }
}
