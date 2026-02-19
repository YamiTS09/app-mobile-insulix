import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabHistorialPageRoutingModule } from './tab-historial-routing.module';

import { TabHistorialPage } from './tab-historial.page';
import { PacienteHeaderComponent } from '../../../components/paciente-header/paciente-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabHistorialPageRoutingModule,
    PacienteHeaderComponent
  ],
  declarations: [TabHistorialPage]
})
export class TabHistorialPageModule {}
