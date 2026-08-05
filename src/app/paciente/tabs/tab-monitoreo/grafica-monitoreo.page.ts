import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GlucoseChartComponent } from '../../../components/glucose-chart/glucose-chart.component';
import { PacienteHeaderComponent } from '../../../components/paciente-header/paciente-header.component';

@Component({
  selector: 'app-grafica-monitoreo',
  templateUrl: './grafica-monitoreo.page.html',
  styleUrls: ['./grafica-monitoreo.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
    PacienteHeaderComponent,
    GlucoseChartComponent
  ]
})
export class GraficaMonitoreoPage { }
