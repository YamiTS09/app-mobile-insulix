import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MedicoHeaderComponent } from './medico-header/medico-header.component';
import { PerfilComponent } from './menu/perfil/perfil.component';
import { ConfiguracionComponent } from './menu/configuracion/configuracion.component';
import { NosotrosComponent } from './menu/nosotros/nosotros.component';
import { AcercadeComponent } from './menu/acercade/acercade.component';
import { DetallePacienteComponent } from './detalle-paciente/detalle-paciente.component';
import { PacienteHeaderComponent } from './paciente-header/paciente-header.component';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicModule,
    MedicoHeaderComponent ,
    PerfilComponent,
    ConfiguracionComponent,
    NosotrosComponent,
    AcercadeComponent,
    DetallePacienteComponent,
    PacienteHeaderComponent
  ],
 
})
export class ComponentsModule { }