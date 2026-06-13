import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <span class="logo" routerLink="/">🏥 Doctor Appointment</span>
      <span class="spacer"></span>

      @if (!authService.isLoggedIn) {
        <a mat-button routerLink="/auth/login">Login</a>
        <a mat-button routerLink="/auth/register">Register</a>
      }

      @if (authService.isLoggedIn) {
        @if (authService.userRole === 'Admin') {
          <a mat-button routerLink="/admin/manage-doctors">Doctors</a>
          <a mat-button routerLink="/admin/manage-hospitals">Hospitals</a>
          <a mat-button routerLink="/admin/view-appointments">Appointments</a>
        }
        @if (authService.userRole === 'Doctor') {
          <a mat-button routerLink="/doctor/dashboard">Dashboard</a>
          <a mat-button routerLink="/doctor/chat">Chat</a>
        }
        @if (authService.userRole === 'Patient') {
          <a mat-button routerLink="/patient/dashboard">Dashboard</a>
          <a mat-button routerLink="/patient/search-doctors">Find Doctors</a>
          <a mat-button routerLink="/patient/chat">Chat</a>
        }

        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <div style="padding: 0 16px; font-weight: 500;">{{ authService.currentUser?.name }}</div>
          <div style="padding: 0 16px 8px; font-size: 12px; color: gray;">{{ authService.currentUser?.role }}</div>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>exit_to_app</mat-icon> Logout
          </button>
        </mat-menu>
      }
    </mat-toolbar>
  `,
  styles: [`
    .navbar { position: sticky; top: 0; z-index: 1000; }
    .logo { cursor: pointer; font-weight: bold; font-size: 18px; }
    .spacer { flex: 1 1 auto; }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}
