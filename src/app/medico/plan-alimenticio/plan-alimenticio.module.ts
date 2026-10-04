import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MedicoHeaderComponent } from '../../components/medico-header/medico-header.component';
import { PlanAlimenticioPageRoutingModule } from './plan-alimenticio-routing.module';
import { PlanAlimenticioPage } from './plan-alimenticio.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MedicoHeaderComponent, PlanAlimenticioPageRoutingModule],
  declarations: [PlanAlimenticioPage]
})
export class PlanAlimenticioPageModule { }

