import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabMonitoreoPageRoutingModule } from './tab-monitoreo-routing.module';

import { TabMonitoreoPage } from './tab-monitoreo.page';
import { PacienteHeaderComponent } from '../../../components/paciente-header/paciente-header.component';
import { GlucoseChartComponent } from '../../../components/glucose-chart/glucose-chart.component';
import { LatestGlucoseCardComponent } from '../../../components/latest-glucose-card/latest-glucose-card.component';
import { GlucoseMeasureButtonComponent } from '../../../components/glucose-measure-button/glucose-measure-button.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabMonitoreoPageRoutingModule,
    PacienteHeaderComponent,
    GlucoseChartComponent,
    LatestGlucoseCardComponent,
    GlucoseMeasureButtonComponent
  ],
  declarations: [TabMonitoreoPage]
})
export class TabMonitoreoPageModule {}
