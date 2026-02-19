import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabBienestarPageRoutingModule } from './tab-bienestar-routing.module';

import { TabBienestarPage } from './tab-bienestar.page';
import { PacienteHeaderComponent } from '../../../components/paciente-header/paciente-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabBienestarPageRoutingModule,
    PacienteHeaderComponent
  ],
  declarations: [TabBienestarPage]
})
export class TabBienestarPageModule {}
