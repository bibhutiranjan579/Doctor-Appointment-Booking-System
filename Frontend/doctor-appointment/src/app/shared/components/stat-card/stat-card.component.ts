import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="stat-card" [style.borderLeft]="'4px solid ' + color">
      <div class="stat-card__content">
        <span class="stat-card__label">{{ label }}</span>
        <span class="stat-card__value" [class.loading]="loading">
          @if (loading) {
            <span class="skeleton"></span>
          } @else {
            {{ value }}
          }
        </span>
      </div>
      <div class="stat-card__icon" [style.background]="color + '15'" [style.color]="color">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: default;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    }
    .stat-card__content {
      display: flex;
      flex-direction: column;
    }
    .stat-card__label {
      font-size: 13px;
      color: #888;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card__value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-top: 4px;
      min-height: 36px;
      display: flex;
      align-items: center;
      transition: opacity 0.3s ease;
    }
    .stat-card__value.loading {
      opacity: 0.5;
    }
    .stat-card__icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-card__icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .skeleton {
      display: inline-block;
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      height: 32px;
      width: 60px;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 480px) {
      .stat-card { padding: 16px; }
      .stat-card__value { font-size: 22px; }
      .stat-card__label { font-size: 11px; }
      .stat-card__icon { width: 42px; height: 42px; }
      .stat-card__icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = 'info';
  @Input() color = '#1b3a7b';
  @Input() loading = false;
}
