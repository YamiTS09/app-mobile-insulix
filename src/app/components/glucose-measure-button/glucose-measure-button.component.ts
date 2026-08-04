import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export type GlucoseMeasurementState = 'idle' | 'waitingSensor';

@Component({
  selector: 'app-glucose-measure-button',
  templateUrl: './glucose-measure-button.component.html',
  styleUrls: ['./glucose-measure-button.component.scss'],
  imports: [IonicModule],
  standalone: true
})
export class GlucoseMeasureButtonComponent {
  @Input() state: GlucoseMeasurementState = 'idle';
  @Output() measureRequested = new EventEmitter<void>();

  get isWaiting(): boolean {
    return this.state === 'waitingSensor';
  }

  startMeasurement(): void {
    if (!this.isWaiting) this.measureRequested.emit();
  }
}
