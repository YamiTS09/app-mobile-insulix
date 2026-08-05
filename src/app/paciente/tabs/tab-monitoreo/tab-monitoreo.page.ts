import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GlucoseMeasurementState } from '../../../components/glucose-measure-button/glucose-measure-button.component';
import { GlucoseReading, ReportesService } from '../../../services/reportes.service';
import { SessionService } from '../../../services/session.service';

type GlucoseStatus = 'Bajo' | 'Objetivo' | 'Alto';

interface LatestMeasurementView {
  value: number;
  status: GlucoseStatus;
  dateLabel: string;
}

@Component({
  selector: 'app-tab-monitoreo',
  templateUrl: './tab-monitoreo.page.html',
  styleUrls: ['./tab-monitoreo.page.scss'],
  standalone: false
})
export class TabMonitoreoPage implements OnInit, OnDestroy {

  nombre = 'Paciente';
  measurementState: GlucoseMeasurementState = 'idle';
  latestMeasurement: LatestMeasurementView | null = null;
  latestMeasurementLoading = true;
  latestMeasurementMessage = 'Aún no hay lecturas registradas';

  private patientId = '';
  private sensorDetectionTimer?: ReturnType<typeof setTimeout>;
  private readingTimer?: ReturnType<typeof setTimeout>;
  private successTimer?: ReturnType<typeof setTimeout>;
  private measurementRequest?: Subscription;

  constructor(
    private reportesService: ReportesService,
    private sessionService: SessionService,
    private toastController: ToastController
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  ionViewWillEnter(): void {
    if (!this.patientId) this.cargarDatosUsuario();
    this.loadLatestMeasurement();
  }

  ionViewDidLeave(): void {
    this.resetMeasurement();
  }

  ngOnDestroy(): void {
    this.resetMeasurement();
  }

  cargarDatosUsuario(): void {
    const user = this.sessionService.getValidUser();
    if (user) {
      this.patientId = user.uid;
      if (typeof user['nombre'] === 'string' && user['nombre']) this.nombre = user['nombre'];
    }
  }

  loadLatestMeasurement(): void {
    if (!this.patientId) {
      this.latestMeasurementLoading = false;
      this.latestMeasurementMessage = 'No fue posible identificar al paciente';
      return;
    }

    this.latestMeasurementLoading = true;
    this.reportesService.getCurrentGlucose(this.patientId).subscribe({
      next: ({ medicion }) => {
        this.latestMeasurementLoading = false;

        if (!medicion) {
          this.latestMeasurement = null;
          this.latestMeasurementMessage = 'Aún no hay lecturas registradas';
          return;
        }

        this.updateLatestMeasurement(medicion);
      },
      error: (error) => {
        console.error('Error consultando la última lectura de glucosa', error);
        this.latestMeasurementLoading = false;
        this.latestMeasurement = null;
        this.latestMeasurementMessage = 'No fue posible consultar la última lectura';
      }
    });
  }

  startGlucoseMeasurement(): void {
    if (this.measurementState !== 'idle') return;
    if (!this.patientId) {
      void this.showMeasurementError('No fue posible identificar al paciente');
      return;
    }

    this.measurementState = 'waitingSensor';
    this.simulateSensorDetection();
  }

  private simulateSensorDetection(): void {
    this.sensorDetectionTimer = setTimeout(() => {
      this.startSimulatedReading();
    }, 2000);
  }

  private startSimulatedReading(): void {
    if (this.measurementState !== 'waitingSensor') return;
    this.measurementState = 'reading';

    // TODO: Sustituir esta simulación por la detección real del sensor NFC.
    try {
      if (typeof navigator !== 'undefined') navigator.vibrate?.(80);
    } catch {
      // La vibración es una mejora opcional y no debe interrumpir la lectura.
    }

    this.readingTimer = setTimeout(() => {
      this.completeSimulatedMeasurement();
    }, 3000);
  }

  private completeSimulatedMeasurement(): void {
    if (this.measurementState !== 'reading' || this.measurementRequest) return;

    this.measurementRequest = this.reportesService.agregarLecturaSimulada().subscribe({
      next: (reading) => {
        this.measurementRequest = undefined;
        this.updateLatestMeasurement(reading);
        this.measurementState = 'success';
        this.successTimer = setTimeout(() => this.resetMeasurement(), 1500);
      },
      error: (error) => {
        console.error('Error guardando la lectura simulada de glucosa', error);
        this.measurementRequest = undefined;
        this.resetMeasurement();
        void this.showMeasurementError('No fue posible guardar la lectura. Inténtalo nuevamente.');
      }
    });
  }

  private updateLatestMeasurement(reading: GlucoseReading): void {
    const value = Number(reading.valor_mgdl);
    this.latestMeasurementLoading = false;
    this.latestMeasurement = {
      value,
      status: this.getGlucoseStatus(value),
      dateLabel: this.formatMeasurementDate(reading.fecha_hora)
    };
  }

  private resetMeasurement(): void {
    this.clearMeasurementTimers();
    this.measurementRequest?.unsubscribe();
    this.measurementRequest = undefined;
    this.measurementState = 'idle';
  }

  private clearMeasurementTimers(): void {
    if (this.sensorDetectionTimer) clearTimeout(this.sensorDetectionTimer);
    if (this.readingTimer) clearTimeout(this.readingTimer);
    if (this.successTimer) clearTimeout(this.successTimer);
    this.sensorDetectionTimer = undefined;
    this.readingTimer = undefined;
    this.successTimer = undefined;
  }

  private async showMeasurementError(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  private getGlucoseStatus(value: number): GlucoseStatus {
    if (value < 70) return 'Bajo';
    if (value < 180) return 'Objetivo';
    return 'Alto';
  }

  private formatMeasurementDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    const today = new Date();
    const isToday = date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
    const day = isToday
      ? 'Hoy'
      : new Intl.DateTimeFormat('es-MX', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }).format(date);
    const time = new Intl.DateTimeFormat('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);

    return `${day}, ${time}`;
  }
}
