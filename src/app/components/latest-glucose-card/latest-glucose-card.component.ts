import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-latest-glucose-card',
  templateUrl: './latest-glucose-card.component.html',
  styleUrls: ['./latest-glucose-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LatestGlucoseCardComponent {
  @Input() value: number | null = null;
  @Input() status = 'Objetivo';
  @Input() dateLabel = 'Hoy, 2:40 a. m.';
  @Input() originLabel = '';
  @Input() loading = false;

  get tone(): 'target' | 'low' | 'high' | 'neutral' {
    if (this.loading || this.value === null) return 'neutral';
    if (this.status === 'Bajo') return 'low';
    if (this.status === 'Alto') return 'high';
    return 'target';
  }

  get statusIcon(): string {
    switch (this.tone) {
      case 'target': return 'checkmark-circle';
      case 'low': return 'warning';
      case 'high': return 'alert-circle';
      default: return 'ellipse-outline';
    }
  }
}
