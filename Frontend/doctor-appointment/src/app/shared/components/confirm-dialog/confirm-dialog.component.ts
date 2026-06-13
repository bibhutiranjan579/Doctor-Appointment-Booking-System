import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-dialog__icon" [class]="'confirm-dialog__icon--' + type">
        <mat-icon>{{ type === 'danger' ? 'warning' : 'info' }}</mat-icon>
      </div>
      <h3 class="confirm-dialog__title">{{ title }}</h3>
      <p class="confirm-dialog__message">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <button mat-button (click)="dialogRef.close(false)">Cancel</button>
        <button mat-raised-button [color]="type === 'danger' ? 'warn' : 'primary'" (click)="dialogRef.close(true)">
          {{ confirmText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 24px;
      text-align: center;
      min-width: 340px;
    }
    .confirm-dialog__icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .confirm-dialog__icon--danger {
      background: #ffebee;
      color: #c62828;
    }
    .confirm-dialog__icon--info {
      background: #e3f2fd;
      color: #1565c0;
    }
    .confirm-dialog__icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .confirm-dialog__title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 600;
    }
    .confirm-dialog__message {
      margin: 0 0 24px;
      color: #666;
      font-size: 14px;
    }
    .confirm-dialog__actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() type: 'danger' | 'info' = 'danger';

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
}
