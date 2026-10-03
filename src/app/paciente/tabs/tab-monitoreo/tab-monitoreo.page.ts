import { Component, OnInit } from '@angular/core';
import { GlucoseReading, ReportesService } from '../../../services/reportes.service';
import { SessionService } from '../../../services/session.service';

type GlucoseStatus = 'Bajo' | 'Objetivo' | 'Alto';
type FeedbackType = 'status' | 'success' | 'error';

interface LatestMeasurementView {
  value: number;
  status: GlucoseStatus;
  dateLabel: string;
  originLabel: string;
}

@Component({
  selector: 'app-tab-monitoreo',
  templateUrl: './tab-monitoreo.page.html',
  styleUrls: ['./tab-monitoreo.page.scss'],
  standalone: false
})
export class TabMonitoreoPage implements OnInit {
  nombre = 'Paciente';
  latestMeasurement: LatestMeasurementView | null = null;
  latestMeasurementLoading = true;
  latestMeasurementMessage = 'Aún no hay lecturas registradas';
  manualFormOpen = false;
  manualGlucoseValue: number | null = null;
  savingManualReading = false;
  manualEntryError = '';
  manualEntrySuccess = '';
  simulatingReading = false;
  simulationMessage = '';
  simulationMessageType: FeedbackType = 'status';

  private patientId = '';

  constructor(
    private reportesService: ReportesService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  ionViewWillEnter(): void {
    if (!this.patientId) this.cargarDatosUsuario();
    this.loadLatestMeasurement();
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

  simulateReading(): void {
    if (this.simulatingReading || this.savingManualReading || this.manualFormOpen) return;

    if (!this.patientId) {
      this.simulationMessageType = 'error';
      this.simulationMessage = 'No fue posible identificar al paciente.';
      return;
    }

    this.simulatingReading = true;
    this.simulationMessageType = 'status';
    this.simulationMessage = 'Generando lectura de prueba…';
    this.manualEntrySuccess = '';

    this.reportesService.agregarLecturaSimulada().subscribe({
      next: (reading) => {
        this.updateLatestMeasurement(reading);
        this.simulatingReading = false;
        this.simulationMessageType = 'success';
        this.simulationMessage = 'Lectura de prueba guardada.';
      },
      error: (error) => {
        console.error('Error guardando la lectura simulada de glucosa', error);
        this.simulatingReading = false;
        this.simulationMessageType = 'error';
        this.simulationMessage = error.error?.message || 'No fue posible guardar la lectura de prueba. Inténtalo nuevamente.';
      }
    });
  }

  toggleManualForm(): void {
    if (this.simulatingReading || this.savingManualReading) return;

    if (this.manualFormOpen) {
      this.manualFormOpen = false;
      return;
    }

    this.manualEntryError = '';
    this.manualEntrySuccess = '';
    this.simulationMessage = '';
    this.manualFormOpen = true;
  }

  closeManualForm(): void {
    if (this.savingManualReading) return;
    this.manualFormOpen = false;
    this.manualGlucoseValue = null;
    this.manualEntryError = '';
  }

  saveManualReading(): void {
    if (this.savingManualReading || this.simulatingReading) return;

    const value = Number(this.manualGlucoseValue);
    if (this.manualGlucoseValue === null || !Number.isFinite(value) || value < 20 || value > 600) {
      this.manualEntryError = 'Escribe un valor entre 20 y 600 mg/dL.';
      return;
    }

    this.savingManualReading = true;
    this.manualEntryError = '';
    this.manualEntrySuccess = '';

    this.reportesService.agregarLecturaGlucosa({ valor_mgdl: value }).subscribe({
      next: (reading) => {
        this.updateLatestMeasurement(reading);
        this.savingManualReading = false;
        this.manualFormOpen = false;
        this.manualGlucoseValue = null;
        this.manualEntrySuccess = `Lectura manual de ${value} mg/dL guardada correctamente.`;
      },
      error: (error) => {
        console.error('Error guardando la lectura manual de glucosa', error);
        this.savingManualReading = false;
        this.manualEntryError = error.error?.message || 'No fue posible guardar la lectura. Inténtalo nuevamente.';
      }
    });
  }

  private updateLatestMeasurement(reading: GlucoseReading): void {
    const value = Number(reading.valor_mgdl);
    this.latestMeasurementLoading = false;
    this.latestMeasurement = {
      value,
      status: this.getGlucoseStatus(value),
      dateLabel: this.formatMeasurementDate(reading.fecha_hora),
      originLabel: this.getOriginLabel(reading.origen)
    };
  }

  private getOriginLabel(origin: GlucoseReading['origen']): string {
    switch (origin) {
      case 'PACIENTE': return 'Registro manual';
      case 'MEDICO': return 'Registrada por tu médico';
      case 'SENSOR': return 'Lectura del sensor';
      case 'SIMULADOR': return 'Lectura simulada';
      default: return '';
    }
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
