import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__top">
          <div class="footer__brand">
            <mat-icon class="footer__logo">local_hospital</mat-icon>
            <div>
              <h3>MedBook</h3>
              <p>Your Health, Our Priority</p>
            </div>
          </div>
          <div class="footer__links">
            <div class="footer__col">
              <h4>Platform</h4>
              <span>Find Doctors</span>
              <span>Book Appointments</span>
              <span>Video Consultation</span>
            </div>
            <div class="footer__col">
              <h4>Support</h4>
              <span>Help Center</span>
              <span>Contact Us</span>
              <span>Privacy Policy</span>
            </div>
            <div class="footer__col">
              <h4>Connect</h4>
              <div class="footer__socials">
                <div class="social-icon"><mat-icon>mail</mat-icon></div>
                <div class="social-icon"><mat-icon>language</mat-icon></div>
                <div class="social-icon"><mat-icon>phone</mat-icon></div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer__divider"></div>
        <div class="footer__bottom">
          <span>&copy; {{ currentYear }} MedBook. All rights reserved.</span>
          <span class="footer__made">Made with <mat-icon class="heart-icon">favorite</mat-icon> for better healthcare</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #0d1b4a 0%, #1a1a2e 100%);
      color: rgba(255, 255, 255, 0.8);
      padding: 28px 32px 18px;
      margin-top: auto;
      flex-shrink: 0;
    }
    .footer__inner {
      max-width: 1100px;
      margin: 0 auto;
    }
    .footer__top {
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }
    .footer__brand {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex-shrink: 0;
    }
    .footer__logo {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #7c8cf8;
      margin-top: 2px;
    }
    .footer__brand h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1px;
    }
    .footer__brand p {
      margin: 2px 0 0;
      font-size: 13px;
      opacity: 0.6;
    }
    .footer__links {
      display: flex;
      gap: 48px;
    }
    .footer__col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .footer__col h4 {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 600;
      color: #7c8cf8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .footer__col span {
      font-size: 13px;
      cursor: pointer;
      transition: color 0.2s;
    }
    .footer__col span:hover {
      color: #fff;
    }
    .footer__socials {
      display: flex;
      gap: 8px;
    }
    .social-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    .social-icon:hover {
      background: rgba(124, 140, 248, 0.25);
    }
    .social-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .footer__divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 20px 0 12px;
    }
    .footer__bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      opacity: 0.6;
    }
    .footer__made {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .heart-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #e53935;
    }

    /* Tablet */
    @media (max-width: 768px) {
      .footer { padding: 32px 20px 20px; }
      .footer__top { flex-direction: column; gap: 28px; }
      .footer__links { gap: 32px; }
    }
    /* Mobile */
    @media (max-width: 480px) {
      .footer__links { flex-direction: column; gap: 20px; }
      .footer__bottom { flex-direction: column; gap: 8px; text-align: center; }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
