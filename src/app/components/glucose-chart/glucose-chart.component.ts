import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { GlucoseMeasurement, GlucoseStatus } from '../../models/glucose-measurement.interface';
import { GlucoseReading, ReportesService } from '../../services/reportes.service';
import { SessionService } from '../../services/session.service';

type GlucosePeriod = 'day' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-glucose-chart',
  templateUrl: './glucose-chart.component.html',
  styleUrls: ['./glucose-chart.component.scss'],
  standalone: true,
  imports: [IonicModule, NgApexchartsModule]
})
export class GlucoseChartComponent implements OnInit, OnDestroy {
  @Input() showLatestCard = true;

  all: GlucoseMeasurement[] = [];
  visible: GlucoseMeasurement[] = [];
  selectedPeriod: GlucosePeriod = 'day';
  loading = true;
  errorMessage = '';
  private historyRequest?: Subscription;

  chartOptions: any = {
    series: [{ name: 'Glucosa', data: [] }],
    chart: {
      type: 'line', height: 400, fontFamily: 'Arial, sans-serif', background: '#fff',
      animations: { enabled: true, easing: 'easeinout', speed: 450 },
      toolbar: { show: false },
      zoom: { enabled: false },
      selection: { enabled: false }
    },
    colors: ['#173f5f'],
    stroke: { curve: 'straight', width: 4 },
    markers: { size: 6, strokeWidth: 2, strokeColors: '#fff', hover: { size: 9 } },
    dataLabels: { enabled: false },
    title: { text: 'Mediciones registradas', align: 'center', style: { fontSize: '21px', fontWeight: 700 } },
    xaxis: {
      type: 'category', title: { text: 'Fecha y hora', style: { fontSize: '17px' } },
      labels: { rotate: -45, style: { fontSize: '14px' } }
    },
    yaxis: {
      min: 0, max: 400, tickAmount: 8,
      title: { text: 'Glucosa (mg/dL)', style: { fontSize: '17px' } },
      labels: { style: { fontSize: '14px' } }
    },
    grid: { borderColor: '#d8dee6', strokeDashArray: 3 },
    annotations: { yaxis: [
      { y: 0, y2: 70, fillColor: '#f5c542', opacity: 0.2, borderColor: 'transparent' },
      { y: 70, y2: 180, fillColor: '#48a868', opacity: 0.18, borderColor: '#238636' },
      { y: 180, y2: 400, fillColor: '#e5534b', opacity: 0.16, borderColor: '#d93025' }
    ]},
    tooltip: {
      enabled: true, shared: false, intersect: true, followCursor: false,
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const value = series[seriesIndex][dataPointIndex];
        const hour = w.globals.categoryLabels[dataPointIndex] ?? '';
        const color = this.getStatusColor(value);
        return `<div class="glucose-tooltip" style="border-color:${color}">
          <div><b>Fecha:</b> ${hour}</div><div><b>Glucosa:</b> ${value} mg/dL</div>
          <div style="color:${color}"><b>Estado:</b> ${this.getGlucoseStatus(value)}</div></div>`;
      }
    }
  };

  constructor(
    private reportesService: ReportesService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.historyRequest?.unsubscribe();
  }

  selectPeriod(value: unknown): void {
    if (!this.isGlucosePeriod(value) || value === this.selectedPeriod) return;
    this.selectedPeriod = value;
    this.loadHistory();
  }

  private loadHistory(): void {
    const user = this.sessionService.getValidUser();
    if (!user || user.role !== 'PACIENTE') {
      this.loading = false;
      this.errorMessage = 'No fue posible identificar al paciente';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.all = [];
    this.visible = [];
    this.updateSeries();
    this.historyRequest?.unsubscribe();

    const { startDate, endDate } = this.getSelectedDateRange();
    this.historyRequest = this.reportesService.getHistorialGlucosa(
      user.uid,
      startDate.toISOString(),
      endDate.toISOString()
    ).subscribe({
      next: (readings) => {
        this.setMeasurements(readings);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error consultando el historial para la gráfica', error);
        this.all = [];
        this.visible = [];
        this.updateSeries();
        this.loading = false;
        this.errorMessage = 'No fue posible cargar las mediciones de glucosa';
      }
    });
  }

  private setMeasurements(readings: GlucoseReading[]): void {
    this.all = readings
      .map(reading => ({
        date: new Date(reading.fecha_hora),
        value: Number(reading.valor_mgdl)
      }))
      .filter(item => !Number.isNaN(item.date.getTime()) && Number.isFinite(item.value))
      .sort((first, second) => first.date.getTime() - second.date.getTime())
      .map(item => ({
        hour: this.formatDateLabel(item.date),
        value: item.value,
        status: this.getGlucoseStatus(item.value)
      }));
    this.visible = [...this.all];
    this.updateSeries();
  }

  private updateSeries(): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: 'Glucosa',
        data: this.visible.map(({ hour: x, value: y }) => ({ x, y }))
      }]
    };
  }

  private getSelectedDateRange(): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date(endDate);

    switch (this.selectedPeriod) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }

  private isGlucosePeriod(value: unknown): value is GlucosePeriod {
    return value === 'day' || value === 'week' || value === 'month' || value === 'year';
  }

  private formatDateLabel(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  get last(): GlucoseMeasurement | undefined {
    return this.visible[this.visible.length - 1];
  }

  getGlucoseStatus(value: number): GlucoseStatus {
    if (value < 70) return 'Bajo';
    if (value < 180) return 'Objetivo';
    return 'Alto';
  }

  getStatusColor(value: number): string {
    return { Bajo: '#d6a900', Objetivo: '#238636', Alto: '#d93025' }[this.getGlucoseStatus(value)];
  }

}
