import { Component, OnInit } from '@angular/core';
import { GlucoseMeasurementState } from '../../../components/glucose-measure-button/glucose-measure-button.component';
import { ReportesService } from '../../../services/reportes.service';
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
export class TabMonitoreoPage implements OnInit {

  nombre = 'Paciente';
  measurementState: GlucoseMeasurementState = 'idle';
  // Se activará desde el botón de gráfica que se agregará posteriormente.
  showGlucoseChart = false;
  latestMeasurement: LatestMeasurementView | null = null;
  latestMeasurementLoading = true;
  latestMeasurementMessage = 'Aún no hay lecturas registradas';
  private patientId = '';

  constructor(
    private reportesService: ReportesService,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  ionViewWillEnter(): void {
    if (!this.patientId) this.cargarDatosUsuario();
    this.loadLatestMeasurement();
  }

  cargarDatosUsuario() {
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

        const value = Number(medicion.valor_mgdl);
        this.latestMeasurement = {
          value,
          status: this.getGlucoseStatus(value),
          dateLabel: this.formatMeasurementDate(medicion.fecha_hora)
        };
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
    this.measurementState = 'waitingSensor';
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
