import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { SidebarComponent, SidebarItem } from '../../shared/components/sidebar/sidebar.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatRadioModule,
    MatStepperModule, MatDividerModule,
    SidebarComponent, TopNavbarComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar [items]="sidebarItems" theme="patient" (logoutClicked)="authService.logout()"></app-sidebar>
      <div class="dashboard-main">
        <app-top-navbar title="Book Appointment" theme="patient" [userName]="authService.currentUser?.name || ''" userRole="Patient" (logoutClicked)="authService.logout()"></app-top-navbar>
        <div class="dashboard-content">
          <div class="booking-wrapper">
            <div class="booking-card">
              <div class="booking-card__header">
                <div class="doctor-info">
                  <div class="doctor-avatar">{{ doctorName?.charAt(0) || '?' }}</div>
                  <div>
                    <h3>Book with Dr. {{ doctorName }}</h3>
                    <span class="subtitle">Fill in the details below to schedule your appointment</span>
                  </div>
                </div>
              </div>

              <!-- Step Indicator -->
              <div class="step-indicator">
                <div class="step" [class.active]="step === 1" [class.done]="step > 1">
                  <div class="step-circle">@if (step > 1) { <mat-icon>check</mat-icon> } @else { 1 }</div>
                  <span>Appointment</span>
                </div>
                <div class="step-line" [class.active]="step > 1"></div>
                <div class="step" [class.active]="step === 2" [class.done]="step > 2">
                  <div class="step-circle">@if (step > 2) { <mat-icon>check</mat-icon> } @else { 2 }</div>
                  <span>Payment</span>
                </div>
                <div class="step-line" [class.active]="step > 2"></div>
                <div class="step" [class.active]="step === 3">
                  <div class="step-circle">3</div>
                  <span>Confirm</span>
                </div>
              </div>

              <!-- Step 1: Appointment Details -->
              @if (step === 1) {
                <form (ngSubmit)="goToStep(2)" class="booking-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Appointment Date</mat-label>
                    <mat-icon matPrefix>calendar_today</mat-icon>
                    <input matInput [matDatepicker]="picker" [(ngModel)]="appointmentDate" name="date" required [min]="minDate">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Preferred Time (HH:MM)</mat-label>
                    <mat-icon matPrefix>schedule</mat-icon>
                    <input matInput [(ngModel)]="appointmentTime" name="time" placeholder="14:30" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Consultation Fee (₹)</mat-label>
                    <mat-icon matPrefix>currency_rupee</mat-icon>
                    <input matInput type="number" [(ngModel)]="amount" name="amount" required min="1">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Symptoms / Notes</mat-label>
                    <mat-icon matPrefix>notes</mat-icon>
                    <textarea matInput [(ngModel)]="notes" name="notes" rows="3" placeholder="Describe your symptoms or reason for visit..."></textarea>
                  </mat-form-field>

                  <button mat-raised-button type="submit" class="submit-btn full-width"
                    [disabled]="!appointmentDate || !appointmentTime || !amount">
                    <span>Continue to Payment</span>
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </form>
              }

              <!-- Step 2: Payment -->
              @if (step === 2) {
                <form (ngSubmit)="goToStep(3)" class="booking-form">
                  <div class="payment-summary">
                    <span class="label">Amount to Pay</span>
                    <span class="amount">₹{{ amount }}</span>
                  </div>

                  <div class="payment-method-section">
                    <label class="section-label">Select Payment Method</label>
                    <mat-radio-group [(ngModel)]="paymentMethod" name="paymentMethod" class="payment-methods">
                      <mat-radio-button [value]="0" class="method-card">
                        <mat-icon>credit_card</mat-icon> Credit Card
                      </mat-radio-button>
                      <mat-radio-button [value]="1" class="method-card">
                        <mat-icon>credit_card</mat-icon> Debit Card
                      </mat-radio-button>
                      <mat-radio-button [value]="2" class="method-card">
                        <mat-icon>account_balance</mat-icon> UPI
                      </mat-radio-button>
                    </mat-radio-group>
                  </div>

                  <!-- Card Fields (Credit/Debit) -->
                  @if (paymentMethod === 0 || paymentMethod === 1) {
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Card Number</mat-label>
                      <mat-icon matPrefix>credit_card</mat-icon>
                      <input matInput [(ngModel)]="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456"
                        maxlength="19" required (input)="formatCardNumber()">
                    </mat-form-field>

                    <div class="row-2">
                      <mat-form-field appearance="outline">
                        <mat-label>Expiry (MM/YY)</mat-label>
                        <input matInput [(ngModel)]="expiryDate" name="expiry" placeholder="12/25" maxlength="5" required>
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>CVV</mat-label>
                        <input matInput [(ngModel)]="cvv" name="cvv" type="password" maxlength="4" required>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Card Holder Name</mat-label>
                      <mat-icon matPrefix>person</mat-icon>
                      <input matInput [(ngModel)]="cardHolderName" name="holderName" required>
                    </mat-form-field>
                  }

                  <!-- UPI Field -->
                  @if (paymentMethod === 2) {
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>UPI ID</mat-label>
                      <mat-icon matPrefix>account_balance</mat-icon>
                      <input matInput [(ngModel)]="upiId" name="upiId" placeholder="yourname@upi" required>
                    </mat-form-field>
                  }

                  <div class="btn-row">
                    <button mat-stroked-button type="button" (click)="goToStep(1)" class="back-btn">
                      <mat-icon>arrow_back</mat-icon> Back
                    </button>
                    <button mat-raised-button type="submit" class="submit-btn flex-1"
                      [disabled]="!isPaymentValid()">
                      <span>Review & Confirm</span>
                      <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              }

              <!-- Step 3: Confirm -->
              @if (step === 3) {
                <div class="confirm-section">
                  <div class="confirm-row">
                    <mat-icon>calendar_today</mat-icon>
                    <div><span class="label">Date & Time</span><span class="value">{{ appointmentDate | date:'mediumDate' }} at {{ appointmentTime }}</span></div>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="confirm-row">
                    <mat-icon>notes</mat-icon>
                    <div><span class="label">Notes</span><span class="value">{{ notes || 'None' }}</span></div>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="confirm-row">
                    <mat-icon>payment</mat-icon>
                    <div>
                      <span class="label">Payment</span>
                      <span class="value">₹{{ amount }} via {{ paymentMethodLabel }}</span>
                      <span class="value sub">{{ getPaymentDetail() }}</span>
                    </div>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="btn-row mt-16">
                    <button mat-stroked-button type="button" (click)="goToStep(2)" class="back-btn">
                      <mat-icon>arrow_back</mat-icon> Back
                    </button>
                    <button mat-raised-button class="submit-btn flex-1" (click)="onBook()" [disabled]="loading">
                      @if (loading) {
                        <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                        <span>Processing Payment...</span>
                      } @else {
                        <mat-icon>lock</mat-icon>
                        <span>Pay ₹{{ amount }} & Book</span>
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f0f2f5; }
    .dashboard-main { flex: 1; margin-left: 260px; }
    .dashboard-content { padding: 88px 32px 32px; }

    .booking-wrapper { display: flex; justify-content: center; }
    .booking-card {
      width: 100%; max-width: 600px; background: #fff; border-radius: 16px;
      padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .booking-card__header { margin-bottom: 20px; }
    .doctor-info { display: flex; gap: 16px; align-items: center; }
    .doctor-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #1b7a5a, #00c853);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 22px;
    }
    .doctor-info h3 { margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .subtitle { font-size: 13px; color: #888; }

    /* Step indicator */
    .step-indicator {
      display: flex; align-items: center; justify-content: center;
      gap: 0; margin-bottom: 28px; padding: 16px 0;
    }
    .step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-circle {
      width: 36px; height: 36px; border-radius: 50%; border: 2px solid #ddd;
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 14px; color: #999; background: #fff;
      transition: all 0.3s;
    }
    .step.active .step-circle { border-color: #5b3a9e; color: #5b3a9e; background: #f3eeff; }
    .step.done .step-circle { border-color: #00c853; background: #00c853; color: #fff; }
    .step.done .step-circle mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .step span:last-child { font-size: 12px; color: #999; font-weight: 500; }
    .step.active span:last-child { color: #5b3a9e; }
    .step.done span:last-child { color: #00c853; }
    .step-line { flex: 1; height: 2px; background: #ddd; max-width: 80px; margin: 0 8px; margin-bottom: 20px; }
    .step-line.active { background: #00c853; }

    .booking-form { display: flex; flex-direction: column; }
    .full-width { width: 100%; }
    :host ::ng-deep .mat-mdc-text-field-wrapper { border-radius: 10px !important; }

    /* Payment section */
    .payment-summary {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; background: #f3eeff; border-radius: 12px; margin-bottom: 20px;
    }
    .payment-summary .label { font-size: 14px; color: #666; }
    .payment-summary .amount { font-size: 24px; font-weight: 700; color: #5b3a9e; }

    .section-label { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px; display: block; }
    .payment-methods { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .method-card {
      flex: 1; min-width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px;
      transition: all 0.2s;
    }
    :host ::ng-deep .method-card.mat-mdc-radio-checked { border-color: #5b3a9e; background: #f9f5ff; }
    :host ::ng-deep .method-card .mdc-label { display: flex; align-items: center; gap: 6px; font-weight: 500; }

    .row-2 { display: flex; gap: 16px; }
    .row-2 mat-form-field { flex: 1; }

    /* Confirm section */
    .confirm-section { display: flex; flex-direction: column; gap: 12px; }
    .confirm-row { display: flex; gap: 16px; align-items: flex-start; padding: 8px 0; }
    .confirm-row mat-icon { color: #5b3a9e; margin-top: 2px; }
    .confirm-row div { display: flex; flex-direction: column; }
    .confirm-row .label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
    .confirm-row .value { font-size: 15px; font-weight: 500; color: #333; }
    .confirm-row .value.sub { font-size: 13px; color: #666; font-weight: 400; }

    /* Buttons */
    .submit-btn {
      height: 48px; font-size: 16px; font-weight: 600; border-radius: 10px !important;
      background: #5b3a9e !important; color: #fff !important;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .submit-btn:hover { background: #2d1b69 !important; }
    .submit-btn:disabled { opacity: 0.7; }
    .back-btn { height: 48px; border-radius: 10px !important; font-weight: 500; }
    .btn-row { display: flex; gap: 12px; margin-top: 8px; }
    .flex-1 { flex: 1; }
    .mt-16 { margin-top: 16px; }
    .btn-spinner { display: inline-block; }
    :host ::ng-deep .btn-spinner circle { stroke: #fff !important; }
    .payment-method-section { margin-bottom: 4px; }
  `]
})
export class BookAppointmentComponent implements OnInit {
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
    { label: 'Find Doctors', icon: 'search', route: '/patient/search-doctors' },
    { label: 'Feedback', icon: 'rate_review', route: '/patient/feedback' },
    { label: 'Chat', icon: 'chat', route: '/patient/chat' },
    { label: 'Video Call', icon: 'videocam', route: '/patient/video-call' },
    { label: 'Profile', icon: 'person', route: '/patient/profile' },
  ];

  step = 1;
  doctorId = '';
  doctorName = '';
  appointmentDate: Date | null = null;
  appointmentTime = '';
  notes = '';
  amount = 500;
  loading = false;
  minDate = new Date();

  // Payment fields
  paymentMethod: number = 0; // 0=CreditCard, 1=DebitCard, 2=UPI
  cardNumber = '';
  expiryDate = '';
  cvv = '';
  cardHolderName = '';
  upiId = '';

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.queryParams['doctorId'] || '';
    this.doctorName = this.route.snapshot.queryParams['doctorName'] || '';
  }

  get paymentMethodLabel(): string {
    return ['Credit Card', 'Debit Card', 'UPI'][this.paymentMethod] ?? '';
  }

  goToStep(s: number): void {
    this.step = s;
  }

  formatCardNumber(): void {
    const raw = this.cardNumber.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  isPaymentValid(): boolean {
    if (this.paymentMethod === 2) {
      return !!this.upiId && this.upiId.includes('@');
    }
    const digits = this.cardNumber.replace(/\s/g, '');
    return digits.length >= 13 && digits.length <= 16
      && /^\d{2}\/\d{2}$/.test(this.expiryDate)
      && this.cvv.length >= 3
      && !!this.cardHolderName;
  }

  getPaymentDetail(): string {
    if (this.paymentMethod === 2) return this.upiId;
    const digits = this.cardNumber.replace(/\s/g, '');
    return `**** **** **** ${digits.slice(-4)}`;
  }

  onBook(): void {
    if (!this.appointmentDate || !this.appointmentTime) return;
    const [hours, minutes] = this.appointmentTime.split(':').map(Number);
    const dateTime = new Date(this.appointmentDate);
    dateTime.setHours(hours, minutes, 0, 0);

    this.loading = true;
    this.appointmentService.create({
      doctorId: this.doctorId,
      appointmentDate: dateTime,
      notes: this.notes,
      paymentMethod: this.paymentMethod,
      amount: this.amount,
      paymentDetail: this.getPaymentDetail()
    }).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Payment successful! Appointment booked.', 'Close', { duration: 4000 });
        this.router.navigate(['/patient/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Booking failed', 'Close', { duration: 3000 });
      }
    });
  }
}
