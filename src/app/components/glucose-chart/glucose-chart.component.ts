import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GlucoseMeasurement, GlucoseStatus } from '../../models/glucose-measurement.interface';
import { GlucoseSimulationService } from '../../services/glucose-simulation.service';

@Component({
  selector: 'app-glucose-chart',
  templateUrl: './glucose-chart.component.html',
  styleUrls: ['./glucose-chart.component.scss'],
  standalone: true,
  imports: [NgApexchartsModule]
})
export class GlucoseChartComponent implements OnInit {
  all: GlucoseMeasurement[] = [];
  visible: GlucoseMeasurement[] = [];

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
    title: { text: 'Glucosa de las últimas 24 horas', align: 'center', style: { fontSize: '21px', fontWeight: 700 } },
    xaxis: {
      type: 'category', title: { text: 'Hora del día', style: { fontSize: '17px' } },
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
          <div><b>Hora:</b> ${hour}</div><div><b>Glucosa:</b> ${value} mg/dL</div>
          <div style="color:${color}"><b>Estado:</b> ${this.getGlucoseStatus(value)}</div></div>`;
      }
    }
  };

  constructor(private service: GlucoseSimulationService) {}

  ngOnInit(): void {
    this.service.getMeasurements().subscribe(data => {
      this.all = data.map(item => ({ ...item, status: this.getGlucoseStatus(item.value) }));
      this.visible = [...this.all];
      this.chartOptions = {
        ...this.chartOptions,
        series: [{
          name: 'Glucosa',
          data: this.visible.map(({ hour: x, value: y }) => ({ x, y }))
        }]
      };
    });
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
