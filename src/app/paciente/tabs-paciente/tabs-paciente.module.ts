import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPacientePageRoutingModule } from './tabs-paciente-routing.module';

import { TabsPacientePage } from './tabs-paciente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPacientePageRoutingModule
  ],
  declarations: [TabsPacientePage]
})
export class TabsPacientePageModule {}
