import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge--' + statusClass">{{ text }}</span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge--pending {
      background: #fff3e0;
      color: #e65100;
    }
    .badge--approved {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge--rejected {
      background: #ffebee;
      color: #c62828;
    }
    .badge--completed {
      background: #e3f2fd;
      color: #1565c0;
    }
    .badge--default {
      background: #f5f5f5;
      color: #616161;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status: number | string = 0;

  private statusMap: Record<number, { text: string; class: string }> = {
    0: { text: 'Pending', class: 'pending' },
    1: { text: 'Approved', class: 'approved' },
    2: { text: 'Rejected', class: 'rejected' },
    3: { text: 'Completed', class: 'completed' },
  };

  get text(): string {
    if (typeof this.status === 'string') return this.status;
    return this.statusMap[this.status]?.text || 'Unknown';
  }

  get statusClass(): string {
    if (typeof this.status === 'string') return this.status.toLowerCase();
    return this.statusMap[this.status]?.class || 'default';
  }
}
