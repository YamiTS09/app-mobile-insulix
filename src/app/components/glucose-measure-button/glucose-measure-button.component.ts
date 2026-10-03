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
  @Input() disabled = false;
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
      case 'waitingSensor': return 'Preparando una lectura simulada';
      case 'reading': return 'Guardando una lectura simulada';
      case 'success': return 'Lectura simulada guardada correctamente';
      default: return 'Simular lectura de glucosa';
    }
  }

  get helpText(): string {
    if (this.disabled && !this.isBusy) return 'Cierra el registro manual para iniciar una prueba';

    switch (this.state) {
      case 'waitingSensor': return 'Preparando lectura de prueba';
      case 'reading': return 'Guardando lectura de prueba';
      case 'success': return 'Lectura de prueba guardada';
      default: return 'Genera un dato de prueba';
    }
  }

  startMeasurement(): void {
    if (!this.isBusy && !this.disabled) this.measureRequested.emit();
  }
}
