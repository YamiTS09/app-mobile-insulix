import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export type GlucoseMeasurementState = 'idle' | 'waitingSensor' | 'reading' | 'success';

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

  get isReading(): boolean {
    return this.state === 'reading';
  }

  get isSuccess(): boolean {
    return this.state === 'success';
  }

  get isBusy(): boolean {
    return this.state !== 'idle';
  }

  get ariaLabel(): string {
    switch (this.state) {
      case 'waitingSensor': return 'Esperando que acerques el teléfono al sensor';
      case 'reading': return 'Leyendo glucosa. Mantén el teléfono cerca del sensor';
      case 'success': return 'Medición lista y guardada correctamente';
      default: return 'Medir glucosa';
    }
  }

  get helpText(): string {
    switch (this.state) {
      case 'waitingSensor': return 'Esperando lectura';
      case 'reading': return 'Mantén el teléfono cerca del sensor';
      case 'success': return 'Lectura guardada correctamente';
      default: return 'Presiona para comenzar';
    }
  }

  startMeasurement(): void {
    if (!this.isBusy) this.measureRequested.emit();
  }
}
