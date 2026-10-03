import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { EMPTY, Observable, Subscription, expand, reduce } from 'rxjs';
import { GlucoseStatus } from '../../models/glucose-measurement.interface';
import { GlucoseReading, ReportesService } from '../../services/reportes.service';
import { SessionService } from '../../services/session.service';

type GlucosePeriod = 'day' | 'week' | 'month' | 'year';
type GlucoseSource = 'real' | 'simulated';
type PointKind = 'reading' | 'daily-average' | 'monthly-average';

interface SourceReading {
  date: Date;
  value: number;
  origin: GlucoseReading['origen'];
  isSimulated: boolean;
}

interface ChartPoint {
  timestamp: number;
  value: number | null;
  dateLabel: string;
  readingCount: number;
  kind: PointKind;
  sourceLabel?: string;
}

@Component({
  selector: 'app-glucose-chart',
  templateUrl: './glucose-chart.component.html',
  styleUrls: ['./glucose-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgApexchartsModule]
})
export class GlucoseChartComponent implements OnInit, OnDestroy {
  @Input() showLatestCard = true;

  all: SourceReading[] = [];
  chartPoints: ChartPoint[] = [];
  visible: ChartPoint[] = [];
  selectedPoint: ChartPoint | null = null;
  selectedPeriod: GlucosePeriod = 'day';
  selectedSource: GlucoseSource = 'real';
  selectedDate = this.startOfDay(new Date());
  loading = true;
  hasLoaded = false;
  errorMessage = '';
  private historyRequest?: Subscription;
  private touchStart: { x: number; y: number } | null = null;

  chartOptions: any = {
    series: [{ name: 'Glucosa', data: [] }],
    chart: {
      type: 'line', height: 350, width: '100%', fontFamily: 'Arial, sans-serif', background: '#fff',
      animations: { enabled: false },
      toolbar: { show: false },
      zoom: { enabled: false },
      selection: { enabled: false },
      events: {
        dataPointSelection: (_event: unknown, _chart: unknown, options: { dataPointIndex: number }) => {
          this.selectChartPoint(options.dataPointIndex);
        }
      }
    },
    colors: ['#173f5f'],
    stroke: { curve: 'straight', width: 4, connectNullData: false },
    markers: { size: 7, strokeWidth: 2, strokeColors: '#fff', hover: { size: 7 } },
    dataLabels: { enabled: false },
    title: { text: '', align: 'center', style: { fontSize: '21px', fontWeight: 700 } },
    xaxis: {
      type: 'datetime', title: { text: '' },
      crosshairs: { show: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        showDuplicates: false,
        formatter: (value: string, timestamp: number) =>
          this.selectedPeriod === 'day' ? this.formatAxisLabel(timestamp) : String(value),
        style: { fontSize: '13px' }
      }
    },
    yaxis: {
      min: 0, max: 400, tickAmount: 8,
      title: { text: 'Glucosa (mg/dL)', style: { fontSize: '16px' } },
      labels: { style: { fontSize: '14px' } }
    },
    grid: { borderColor: '#d8dee6', strokeDashArray: 3 },
    annotations: { yaxis: [
      { y: 0, y2: 70, fillColor: '#f5c542', opacity: 0.2, borderColor: 'transparent' },
      { y: 70, y2: 180, fillColor: '#48a868', opacity: 0.18, borderColor: '#238636' },
      { y: 180, y2: 400, fillColor: '#e5534b', opacity: 0.16, borderColor: '#d93025' }
    ]},
    tooltip: { enabled: false, shared: false, intersect: true, followCursor: false }
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

  get selectedPeriodLabel(): string {
    if (this.selectedPeriod === 'day') {
      return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      }).format(this.selectedDate);
    }
    if (this.selectedPeriod === 'week') {
      const start = this.addDays(this.selectedDate, -6);
      const end = this.selectedDate;
      const crossesYear = start.getFullYear() !== end.getFullYear();
      const startText = this.formatShortDate(start, crossesYear);
      const endText = this.formatShortDate(end, true);
      return `${startText} – ${endText}`;
    }
    if (this.selectedPeriod === 'month') {
      return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(this.selectedDate);
    }
    return String(this.selectedDate.getFullYear());
  }

  get canNavigateNext(): boolean {
    const today = this.startOfDay(new Date());
    if (this.selectedPeriod === 'month') {
      return this.selectedDate.getFullYear() < today.getFullYear() ||
        (this.selectedDate.getFullYear() === today.getFullYear() && this.selectedDate.getMonth() < today.getMonth());
    }
    if (this.selectedPeriod === 'year') return this.selectedDate.getFullYear() < today.getFullYear();
    return this.selectedDate.getTime() < today.getTime();
  }

  selectPeriod(value: unknown): void {
    if (!this.isGlucosePeriod(value) || value === this.selectedPeriod) return;
    this.selectedPeriod = value;
    this.loadHistory();
  }

  selectSource(value: unknown): void {
    if (!this.isGlucoseSource(value) || value === this.selectedSource) return;
    this.selectedSource = value;
    this.selectedPoint = null;
    this.applySourceFilter();
  }

  navigatePeriod(direction: -1 | 1): void {
    if (direction > 0 && !this.canNavigateNext) return;
    const date = this.selectedDate;
    if (this.selectedPeriod === 'day' || this.selectedPeriod === 'week') {
      this.selectedDate = this.addDays(date, direction);
    } else if (this.selectedPeriod === 'month') {
      this.selectedDate = this.addMonthsClamped(date, direction);
    } else {
      this.selectedDate = this.addYearsClamped(date, direction);
    }
    this.loadHistory();
  }

  onChartTouchStart(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    if (touch) this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  onChartTouchEnd(event: TouchEvent): void {
    const start = this.touchStart;
    const touch = event.changedTouches[0];
    this.touchStart = null;
    if (!start || !touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) return;
    this.navigatePeriod(deltaX > 0 ? -1 : 1);
  }

  selectChartPoint(index: number): void {
    const point = this.chartPoints[index];
    if (point?.value !== null && point?.value !== undefined) this.selectedPoint = point;
  }

  closePointDetails(): void {
    this.selectedPoint = null;
  }

  private loadHistory(): void {
    const user = this.sessionService.getValidUser();
    if (!user || user.role !== 'PACIENTE') {
      this.loading = false;
      this.hasLoaded = true;
      this.errorMessage = 'No fue posible identificar al paciente.';
      this.selectedPoint = null;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.historyRequest?.unsubscribe();

    const { startDate, endDate } = this.getSelectedDateRange();
    this.historyRequest = this.loadAllHistory(user.uid, startDate, endDate).subscribe({
      next: readings => {
        this.setMeasurements(readings);
        this.selectedPoint = null;
        this.loading = false;
        this.hasLoaded = true;
      },
      error: error => {
        console.error('Error consultando el historial para la gráfica', error);
        this.selectedPoint = null;
        this.loading = false;
        this.hasLoaded = true;
        this.errorMessage = 'No fue posible cargar las mediciones de glucosa.';
      }
    });
  }

  private loadAllHistory(userId: string, startDate: Date, endDate: Date): Observable<GlucoseReading[]> {
    const limit = 5000;
    let offset = 0;
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    return this.reportesService.getHistorialGlucosa(userId, start, end, limit, offset).pipe(
      expand(page => {
        if (page.length < limit) return EMPTY;
        offset += page.length;
        return this.reportesService.getHistorialGlucosa(userId, start, end, limit, offset);
      }),
      reduce((allReadings, page) => allReadings.concat(page), [] as GlucoseReading[])
    );
  }

  private setMeasurements(readings: GlucoseReading[]): void {
    this.all = readings
      .map(reading => ({
        date: new Date(reading.fecha_hora),
        value: Number(reading.valor_mgdl),
        origin: reading.origen,
        isSimulated: reading.es_simulado === true || reading.origen === 'SIMULADOR'
      }))
      .filter(item => !Number.isNaN(item.date.getTime()) && Number.isFinite(item.value))
      .sort((first, second) => first.date.getTime() - second.date.getTime());
    this.applySourceFilter();
  }

  private applySourceFilter(): void {
    const sourceReadings = this.all.filter(item =>
      this.selectedSource === 'simulated' ? item.isSimulated : !item.isSimulated
    );
    const range = this.getSelectedDateRange();
    this.chartPoints = this.buildChartPoints(sourceReadings, range.startDate);
    this.visible = this.chartPoints.filter(point => point.value !== null);
    this.updateSeries();
  }

  private buildChartPoints(readings: SourceReading[], start: Date): ChartPoint[] {
    if (this.selectedPeriod === 'day') {
      return readings.map(reading => ({
        timestamp: reading.date.getTime(),
        value: reading.value,
        dateLabel: this.formatReadingDate(reading.date),
        readingCount: 1,
        kind: 'reading',
        sourceLabel: this.getOriginLabel(reading.origin)
      }));
    }

    if (this.selectedPeriod === 'week' || this.selectedPeriod === 'month') {
      const days: ChartPoint[] = [];
      const count = this.selectedPeriod === 'week' ? 7 : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      const firstDay = this.selectedPeriod === 'week' ? start : this.startOfDay(start);
      for (let index = 0; index < count; index++) {
        const date = this.addDays(firstDay, index);
        const dayReadings = readings.filter(reading => this.isSameDay(reading.date, date));
        days.push({
          timestamp: date.getTime(),
          value: this.average(dayReadings),
          dateLabel: this.formatLongDate(date),
          readingCount: dayReadings.length,
          kind: 'daily-average'
        });
      }
      return days;
    }

    const months: ChartPoint[] = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(start.getFullYear(), month, 1);
      const monthReadings = readings.filter(reading =>
        reading.date.getFullYear() === date.getFullYear() && reading.date.getMonth() === month
      );
      months.push({
        timestamp: date.getTime(),
        value: this.average(monthReadings),
        dateLabel: new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(date),
        readingCount: monthReadings.length,
        kind: 'monthly-average'
      });
    }
    return months;
  }

  private average(readings: SourceReading[]): number | null {
    if (readings.length === 0) return null;
    const mean = readings.reduce((sum, reading) => sum + reading.value, 0) / readings.length;
    return Math.round(mean * 10) / 10;
  }

  private updateSeries(): void {
    const isDayView = this.selectedPeriod === 'day';
    const { startDate, endDate } = this.getSelectedDateRange();
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: 'Glucosa',
        data: isDayView
          ? this.chartPoints.map(point => ({ x: point.timestamp, y: point.value }))
          : this.chartPoints.map(point => point.value)
      }],
      xaxis: {
        ...this.chartOptions.xaxis,
        type: isDayView ? 'datetime' : 'category',
        categories: isDayView ? [] : this.getAggregateAxisCategories(),
        min: isDayView ? startDate.getTime() : undefined,
        max: isDayView ? endDate.getTime() : undefined,
        tickAmount: isDayView ? 6 : undefined
      }
    };
  }

  private getAggregateAxisCategories(): string[] {
    const shortWeekdays = ['dom', 'lun', 'mar', 'mi\u00e9', 'jue', 'vie', 's\u00e1b'];
    const shortMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    return this.chartPoints.map(point => {
      const date = new Date(point.timestamp);
      if (this.selectedPeriod === 'week') return shortWeekdays[date.getDay()];
      if (this.selectedPeriod === 'year') return shortMonths[date.getMonth()];

      const finalDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const day = date.getDate();
      return day === 1 || day % 5 === 0 || day === finalDay ? String(day) : '';
    });
  }

  private getSelectedDateRange(): { startDate: Date; endDate: Date } {
    const anchor = this.startOfDay(this.selectedDate);
    if (this.selectedPeriod === 'day') {
      return { startDate: anchor, endDate: this.endOfDay(anchor) };
    }
    if (this.selectedPeriod === 'week') {
      return { startDate: this.addDays(anchor, -6), endDate: this.endOfDay(anchor) };
    }
    if (this.selectedPeriod === 'month') {
      const startDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      const endDate = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }
    return {
      startDate: new Date(anchor.getFullYear(), 0, 1),
      endDate: new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999)
    };
  }

  private formatAxisLabel(timestamp: number): string {
    if (!Number.isFinite(timestamp)) return '';
    const date = new Date(timestamp);
    if (this.selectedPeriod === 'day') {
      return String(date.getHours()).padStart(2, '0');
    }
    return '';
  }

  private formatReadingDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    }).format(date);
  }

  private formatLongDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  private formatShortDate(date: Date, includeYear: boolean): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric', month: 'short', ...(includeYear ? { year: 'numeric' } : {})
    }).format(date).replace('.', '');
  }

  private isGlucosePeriod(value: unknown): value is GlucosePeriod {
    return value === 'day' || value === 'week' || value === 'month' || value === 'year';
  }

  private isGlucoseSource(value: unknown): value is GlucoseSource {
    return value === 'real' || value === 'simulated';
  }

  private getOriginLabel(origin: GlucoseReading['origen']): string {
    const labels: Record<GlucoseReading['origen'], string> = {
      SENSOR: 'Lectura de sensor',
      MEDICO: 'Registrada por personal médico',
      PACIENTE: 'Registro manual',
      SIMULADOR: 'Lectura simulada'
    };
    return labels[origin] ?? 'Lectura de glucosa';
  }

  private isSameDay(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  private addMonthsClamped(date: Date, months: number): Date {
    const targetMonth = date.getMonth() + months;
    const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = (targetMonth % 12 + 12) % 12;
    const day = Math.min(date.getDate(), new Date(targetYear, normalizedMonth + 1, 0).getDate());
    return new Date(targetYear, normalizedMonth, day);
  }

  private addYearsClamped(date: Date, years: number): Date {
    const targetYear = date.getFullYear() + years;
    const day = Math.min(date.getDate(), new Date(targetYear, date.getMonth() + 1, 0).getDate());
    return new Date(targetYear, date.getMonth(), day);
  }

  get last(): ChartPoint | undefined {
    return this.visible[this.visible.length - 1];
  }

  getPointKindLabel(kind: PointKind): string {
    if (kind === 'reading') return 'Lectura individual';
    return kind === 'daily-average' ? 'Promedio del día' : 'Promedio del mes';
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
