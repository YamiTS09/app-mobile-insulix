import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabMonitoreoPageRoutingModule } from './tab-monitoreo-routing.module';

import { TabMonitoreoPage } from './tab-monitoreo.page';
import { PacienteHeaderComponent } from '../../../components/paciente-header/paciente-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabMonitoreoPageRoutingModule,
    PacienteHeaderComponent
  ],
  declarations: [TabMonitoreoPage]
})
export class TabMonitoreoPageModule {}
