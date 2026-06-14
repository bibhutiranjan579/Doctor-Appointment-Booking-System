import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/models';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatIconModule, MatButtonToggleModule,
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
    <div class="register-wrapper">
      <div class="register-page">
        <!-- Left side: Illustration -->
        <div class="register-left" [class]="'register-left--' + registerData.role.toLowerCase()">
          <div class="register-left__content" @fadeSlideIn>
            <div class="logo-box">
              <mat-icon class="hero-icon">local_hospital</mat-icon>
            </div>
          <h1>MedBook</h1>
          <p class="subtitle">Join our healthcare platform today</p>
          <div class="features">
            <div class="feature-item">
              <mat-icon>verified_user</mat-icon>
              <span>Secure & Private</span>
            </div>
            <div class="feature-item">
              <mat-icon>speed</mat-icon>
              <span>Fast Appointments</span>
            </div>
            <div class="feature-item">
              <mat-icon>support_agent</mat-icon>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Form -->
      <div class="register-right">
        <div class="register-form-wrapper" @fadeSlideIn>
          <div class="form-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <!-- Role Tabs -->
          <div class="role-selector">
            <mat-button-toggle-group [(ngModel)]="registerData.role" name="role" class="role-toggle-group">
              <mat-button-toggle value="Admin" class="role-toggle role-toggle--admin">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin</span>
              </mat-button-toggle>
              <mat-button-toggle value="Patient" class="role-toggle role-toggle--patient">
                <mat-icon>person</mat-icon>
                <span>Patient</span>
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <form (ngSubmit)="onRegister()" class="register-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput [(ngModel)]="registerData.name" name="name" required placeholder="John Doe">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput type="email" [(ngModel)]="registerData.email" name="email" required placeholder="you@example.com">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPassword ? 'text' : 'password'" [(ngModel)]="registerData.password" name="password" required placeholder="Min. 8 characters" (ngModelChange)="checkPasswordStrength()">
              <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint *ngIf="registerData.password && passwordStrength !== 'strong'">{{ passwordHint }}</mat-hint>
            </mat-form-field>

            <!-- Password Strength Indicator -->
            @if (registerData.password) {
              <div class="password-strength">
                <div class="strength-bars">
                  <div class="strength-bar" [class.active]="passwordScore >= 1" [class.weak]="passwordScore === 1" [class.medium]="passwordScore >= 2" [class.strong]="passwordScore >= 4"></div>
                  <div class="strength-bar" [class.active]="passwordScore >= 2" [class.medium]="passwordScore >= 2" [class.strong]="passwordScore >= 4"></div>
                  <div class="strength-bar" [class.active]="passwordScore >= 3" [class.medium]="passwordScore >= 3" [class.strong]="passwordScore >= 4"></div>
                  <div class="strength-bar" [class.active]="passwordScore >= 4" [class.strong]="passwordScore >= 4"></div>
                </div>
                <span class="strength-label" [class]="'strength-' + passwordStrength">{{ passwordStrength | titlecase }}</span>
              </div>
            }

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mobile Number</mat-label>
              <mat-icon matPrefix>phone</mat-icon>
              <input matInput type="tel" [(ngModel)]="registerData.phoneNumber" name="phoneNumber" placeholder="+91 9876543210">
            </mat-form-field>

            @if (registerData.role !== 'Admin') {
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Age</mat-label>
                  <mat-icon matPrefix>cake</mat-icon>
                  <input matInput type="number" [(ngModel)]="registerData.age" name="age" placeholder="25">
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Gender</mat-label>
                  <mat-icon matPrefix>wc</mat-icon>
                  <mat-select [(ngModel)]="registerData.gender" name="gender">
                    <mat-option value="Male">Male</mat-option>
                    <mat-option value="Female">Female</mat-option>
                    <mat-option value="Other">Other</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            }

            @if (errorMessage) {
              <div class="error-banner">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <button
              mat-raised-button
              type="submit"
              class="register-btn full-width"
              [class]="'register-btn--' + registerData.role.toLowerCase()"
              [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                <span>Creating account...</span>
              } @else {
                <mat-icon>person_add</mat-icon>
                <span>Create Account</span>
              }
            </button>
          </form>

          <div class="register-footer">
            <p>Already have an account? <a routerLink="/auth/login" class="link" [class]="'link--' + registerData.role.toLowerCase()">Sign in</a></p>
          </div>
        </div>
      </div>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .register-wrapper {
      display: flex;
      flex-direction: column;
    }
    .register-page {
      display: flex;
      min-height: 100vh;
      overflow: hidden;
    }
    .register-left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.5s ease;
    }
    .register-left--patient { background: linear-gradient(135deg, #2d1b69 0%, #5b3a9e 50%, #aa00ff 100%); }
    .register-left--admin { background: linear-gradient(135deg, #0d1b4a 0%, #1b3a7b 50%, #2962ff 100%); }
    .register-left__content {
      text-align: center;
      color: #fff;
      padding: 40px;
    }
    .hero-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.95; }
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
    .register-left__content h1 { font-size: 42px; font-weight: 800; margin: 0; letter-spacing: 2px; }
    .subtitle { font-size: 16px; opacity: 0.85; margin: 8px 0 40px; }
    .features { display: flex; flex-direction: column; gap: 16px; align-items: center; }
    .feature-item {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.12);
      padding: 12px 24px; border-radius: 30px;
      backdrop-filter: blur(10px); font-size: 14px;
    }

    .register-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fc;
      padding: 40px;
    }
    .register-form-wrapper { width: 100%; max-width: 460px; }
    .form-header { margin-bottom: 24px; }
    .form-header h2 { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
    .form-header p { color: #888; margin: 0; font-size: 14px; }

    .role-selector { margin-bottom: 24px; }
    :host ::ng-deep .role-toggle-group {
      width: 100%; display: flex; border-radius: 12px !important; overflow: hidden;
      border: 2px solid #e0e0e0 !important;
    }
    :host ::ng-deep .role-toggle {
      flex: 1; display: flex; align-items: center; justify-content: center;
      gap: 6px; padding: 12px 0 !important; font-weight: 600; transition: all 0.3s ease;
    }
    :host ::ng-deep .role-toggle .mat-button-toggle-button {
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    :host ::ng-deep .mat-button-toggle-checked.role-toggle--admin { background: #1b3a7b !important; color: #fff !important; }
    :host ::ng-deep .mat-button-toggle-checked.role-toggle--patient { background: #5b3a9e !important; color: #fff !important; }

    .register-form { display: flex; flex-direction: column; }
    .full-width { width: 100%; }
    .form-row { display: flex; gap: 16px; }
    .half-width { flex: 1; }
    :host ::ng-deep .mat-mdc-text-field-wrapper { border-radius: 10px !important; }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: #ffebee; color: #c62828;
      padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px;
    }

    .register-btn {
      height: 48px; font-size: 16px; font-weight: 600; border-radius: 10px !important;
      color: #fff !important; border: none; transition: all 0.3s ease;
    }
    :host ::ng-deep .register-btn .mdc-button__label {
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .register-btn--admin { background: #1b3a7b !important; }
    .register-btn--admin:hover { background: #0d1b4a !important; }
    .register-btn--patient { background: #5b3a9e !important; }
    .register-btn--patient:hover { background: #2d1b69 !important; }
    .register-btn:disabled { opacity: 0.7; }
    .btn-spinner { display: inline-block; }
    :host ::ng-deep .btn-spinner circle { stroke: #fff !important; }

    .register-footer { text-align: center; margin-top: 24px; color: #888; font-size: 14px; }
    .link { font-weight: 600; text-decoration: none; }
    .link--admin { color: #1b3a7b; }
    .link--patient { color: #5b3a9e; }
    .link:hover { text-decoration: underline; }

    .password-strength {
      display: flex; align-items: center; gap: 12px; margin: -8px 0 12px;
    }
    .strength-bars {
      display: flex; gap: 4px; flex: 1;
    }
    .strength-bar {
      height: 4px; flex: 1; border-radius: 2px; background: #e0e0e0; transition: all 0.3s;
    }
    .strength-bar.active.weak { background: #f44336; }
    .strength-bar.active.medium { background: #ff9800; }
    .strength-bar.active.strong { background: #4caf50; }
    .strength-label { font-size: 12px; font-weight: 600; min-width: 60px; }
    .strength-weak { color: #f44336; }
    .strength-medium { color: #ff9800; }
    .strength-strong { color: #4caf50; }

    @media (max-width: 900px) {
      .register-left { display: none; }
      .register-right { flex: none; width: 100%; }
    }
    @media (max-width: 480px) {
      .register-right { padding: 24px 16px; }
      .register-form-wrapper { max-width: 100%; }
      .form-header h2 { font-size: 22px; }
      .form-row { flex-direction: column; gap: 0; }
      .half-width { width: 100%; }
      .register-btn { height: 44px; font-size: 14px; }
    }
    :host ::ng-deep app-footer .footer { margin-top: 0; }
  `]
})
export class RegisterComponent {
  registerData: RegisterRequest = { name: '', email: '', password: '', role: 'Patient' };
  loading = false;
  showPassword = false;
  errorMessage = '';
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  passwordScore = 0;
  passwordHint = '';

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  checkPasswordStrength(): void {
    const p = this.registerData.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    this.passwordScore = score;
    if (score <= 2) { this.passwordStrength = 'weak'; this.passwordHint = 'Add uppercase, numbers & special chars'; }
    else if (score <= 3) { this.passwordStrength = 'medium'; this.passwordHint = 'Almost there! Add more variety'; }
    else { this.passwordStrength = 'strong'; this.passwordHint = ''; }
  }

  onRegister(): void {
    this.errorMessage = '';
    if (this.passwordScore < 4) {
      this.errorMessage = 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character.';
      return;
    }
    this.loading = true;
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
          if (res.data.role === 'Admin') this.router.navigate(['/admin/dashboard']);
          else this.router.navigate(['/patient/dashboard']);
        } else {
          this.errorMessage = res.message || 'Registration failed. Please check your details and try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || err.error?.errors?.join(', ') || err.error?.title || '';
        if (err.status === 400) {
          this.errorMessage = msg || 'Invalid details. Password must have 8+ chars with uppercase, lowercase, number, and special character.';
        } else if (err.status === 409) {
          this.errorMessage = msg || 'An account with this email already exists.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = msg || 'Registration failed. Please try again.';
        }
      }
    });
  }
}
