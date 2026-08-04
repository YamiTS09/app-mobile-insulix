import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-latest-glucose-card',
  templateUrl: './latest-glucose-card.component.html',
  styleUrls: ['./latest-glucose-card.component.scss'],
  standalone: true
})
export class LatestGlucoseCardComponent {
  @Input() value: number | null = null;
  @Input() status = 'Objetivo';
  @Input() dateLabel = 'Hoy, 2:40 a. m.';
  @Input() loading = false;

  get tone(): 'target' | 'low' | 'high' | 'neutral' {
    if (this.loading || this.value === null) return 'neutral';
    if (this.status === 'Bajo') return 'low';
    if (this.status === 'Alto') return 'high';
    return 'target';
  }
}
