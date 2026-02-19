import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabPacientesPageRoutingModule } from './tab-pacientes-routing.module';

import { TabPacientesPage } from './tab-pacientes.page';
import { MedicoHeaderComponent } from 'src/app/components/medico-header/medico-header.component';

import { AgregarPacienteComponent } from '../../modals/agregar-paciente/agregar-paciente.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabPacientesPageRoutingModule,
    MedicoHeaderComponent
  ],
  declarations: [TabPacientesPage, AgregarPacienteComponent]
})
export class TabPacientesPageModule { }
