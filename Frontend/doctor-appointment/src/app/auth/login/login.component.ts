import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/models';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatButtonToggleModule, MatIconModule, MatCheckboxModule,
    MatProgressSpinnerModule, MatSnackBarModule, FooterComponent
  ],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-page">
        <!-- Left side: Illustration -->
        <div class="login-left" [class]="'login-left--' + selectedRole.toLowerCase()">
          <div class="login-left__overlay">
            <div class="login-left__content" @fadeSlideIn>
              <div class="logo-box">
                <mat-icon class="login-left__hero-icon">local_hospital</mat-icon>
              </div>
              <h1>MedBook</h1>
              <p class="login-left__subtitle">Your Health, Our Priority</p>
              <div class="login-left__features">
                <div class="feature-item">
                  <mat-icon>calendar_today</mat-icon>
                  <span>Easy Appointment Booking</span>
                </div>
                <div class="feature-item">
                  <mat-icon>videocam</mat-icon>
                  <span>Video Consultations</span>
                </div>
                <div class="feature-item">
                  <mat-icon>chat</mat-icon>
                  <span>Instant Chat Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side: Login Form -->
        <div class="login-right">
          <div class="login-form-wrapper" @fadeSlideIn>
          <div class="login-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          <!-- Role Selection Tabs -->
          <div class="role-selector">
            <mat-button-toggle-group [(ngModel)]="selectedRole" name="role" aria-label="Select Role" class="role-toggle-group">
              <mat-button-toggle value="Admin" class="role-toggle role-toggle--admin">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin</span>
              </mat-button-toggle>
              <mat-button-toggle value="Doctor" class="role-toggle role-toggle--doctor">
                <mat-icon>medical_services</mat-icon>
                <span>Doctor</span>
              </mat-button-toggle>
              <mat-button-toggle value="Patient" class="role-toggle role-toggle--patient">
                <mat-icon>person</mat-icon>
                <span>Patient</span>
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onLogin()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" [(ngModel)]="loginData.email" name="email" required placeholder="you@example.com">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPassword ? 'text' : 'password'" [(ngModel)]="loginData.password" name="password" required placeholder="Enter your password">
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="form-options">
              <mat-checkbox [(ngModel)]="rememberMe" name="remember" color="primary">Remember me</mat-checkbox>
            </div>

            @if (errorMessage) {
              <div class="error-banner">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <button
              mat-raised-button
              type="submit"
              class="login-btn full-width"
              [class]="'login-btn--' + selectedRole.toLowerCase()"
              [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                <span>Signing in...</span>
              } @else {
                <mat-icon>login</mat-icon>
                <span>Sign In</span>
              }
            </button>
          </form>

          <div class="login-footer">
            <p>Don't have an account? <a routerLink="/auth/register" class="link" [class]="'link--' + selectedRole.toLowerCase()">Register here</a></p>
          </div>
          </div>
        </div>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .login-page {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Left Panel */
    .login-left {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.5s ease;
    }
    .login-left--admin {
      background: linear-gradient(135deg, #0d1b4a 0%, #1b3a7b 50%, #2962ff 100%);
    }
    .login-left--doctor {
      background: linear-gradient(135deg, #0a3d2e 0%, #1b7a5a 50%, #00c853 100%);
    }
    .login-left--patient {
      background: linear-gradient(135deg, #2d1b69 0%, #5b3a9e 50%, #aa00ff 100%);
    }
    .login-left__overlay {
      position: relative;
      z-index: 1;
    }
    .login-left__content {
      text-align: center;
      color: #fff;
      padding: 40px;
    }
    .logo-box {
      width: 90px;
      height: 90px;
      border-radius: 20px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .login-left__hero-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.95;
    }
    .login-left__content h1 {
      font-size: 42px;
      font-weight: 800;
      margin: 0;
      letter-spacing: 2px;
    }
    .login-left__subtitle {
      font-size: 16px;
      opacity: 0.85;
      margin: 8px 0 40px;
    }
    .login-left__features {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.12);
      padding: 12px 24px;
      border-radius: 30px;
      backdrop-filter: blur(10px);
      font-size: 14px;
    }

    /* Right Panel */
    .login-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fc;
      padding: 40px;
    }
    .login-form-wrapper {
      width: 100%;
      max-width: 420px;
    }
    .login-form-header {
      margin-bottom: 28px;
    }
    .login-form-header h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 4px;
    }
    .login-form-header p {
      color: #888;
      margin: 0;
      font-size: 14px;
    }

    /* Role Selector */
    .role-selector {
      margin-bottom: 28px;
    }
    :host ::ng-deep .role-toggle-group {
      width: 100%;
      display: flex;
      border-radius: 12px !important;
      overflow: hidden;
      border: 2px solid #e0e0e0 !important;
    }
    :host ::ng-deep .role-toggle {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 0 !important;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    :host ::ng-deep .role-toggle .mat-button-toggle-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    :host ::ng-deep .mat-button-toggle-checked.role-toggle--admin {
      background: #1b3a7b !important;
      color: #fff !important;
    }
    :host ::ng-deep .mat-button-toggle-checked.role-toggle--doctor {
      background: #1b7a5a !important;
      color: #fff !important;
    }
    :host ::ng-deep .mat-button-toggle-checked.role-toggle--patient {
      background: #5b3a9e !important;
      color: #fff !important;
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
    }
    .full-width { width: 100%; }
    :host ::ng-deep .mat-mdc-form-field {
      margin-bottom: 4px;
    }
    :host ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 10px !important;
    }
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    /* Error */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffebee;
      color: #c62828;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    /* Login Button */
    .login-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 10px !important;
      color: #fff !important;
      border: none;
      transition: all 0.3s ease;
    }
    :host ::ng-deep .login-btn .mdc-button__label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .login-btn--admin { background: #1b3a7b !important; }
    .login-btn--admin:hover { background: #0d1b4a !important; }
    .login-btn--doctor { background: #1b7a5a !important; }
    .login-btn--doctor:hover { background: #0a3d2e !important; }
    .login-btn--patient { background: #5b3a9e !important; }
    .login-btn--patient:hover { background: #2d1b69 !important; }
    .login-btn:disabled {
      opacity: 0.7;
    }
    .btn-spinner { display: inline-block; }
    :host ::ng-deep .btn-spinner circle {
      stroke: #fff !important;
    }

    /* Footer */
    .login-footer {
      text-align: center;
      margin-top: 24px;
      color: #888;
      font-size: 14px;
    }
    .link {
      font-weight: 600;
      text-decoration: none;
    }
    .link--admin { color: #1b3a7b; }
    .link--doctor { color: #1b7a5a; }
    .link--patient { color: #5b3a9e; }
    .link:hover { text-decoration: underline; }

    /* Responsive */
    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { flex: none; width: 100%; }
    }
    @media (max-width: 480px) {
      .login-right { padding: 24px 16px; }
      .login-form-wrapper { max-width: 100%; }
      .login-form-header h2 { font-size: 22px; }
      .login-btn { height: 44px; font-size: 14px; }
      :host ::ng-deep .role-toggle { padding: 10px 0 !important; font-size: 12px; }
    }
    :host ::ng-deep app-footer .footer { margin-top: 0; }
  `]
})
export class LoginComponent {
  loginData: LoginRequest = { email: '', password: '', role: 'Patient' };
  selectedRole = 'Patient';
  loading = false;
  showPassword = false;
  rememberMe = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  onLogin(): void {
    this.errorMessage = '';
    this.loading = true;
    this.loginData.role = this.selectedRole;
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const role = res.data.role;
          if (role === 'Admin') this.router.navigate(['/admin/dashboard']);
          else if (role === 'Doctor') this.router.navigate(['/doctor/dashboard']);
          else this.router.navigate(['/patient/dashboard']);
        } else {
          this.errorMessage = res.message || 'Invalid email or password. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || err.error?.title || '';
        if (err.status === 401) {
          this.errorMessage = msg || 'Invalid email or password. Please try again.';
        } else if (err.status === 400) {
          this.errorMessage = msg || 'Please fill in all required fields correctly.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = msg || 'Login failed. Please try again.';
        }
      }
    });
  }
}
