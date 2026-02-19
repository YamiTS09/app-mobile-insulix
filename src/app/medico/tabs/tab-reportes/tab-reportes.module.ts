import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabReportesPageRoutingModule } from './tab-reportes-routing.module';

import { TabReportesPage } from './tab-reportes.page';
import { MedicoHeaderComponent } from 'src/app/components/medico-header/medico-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabReportesPageRoutingModule,
    MedicoHeaderComponent
  ],
  declarations: [TabReportesPage]
})
export class TabReportesPageModule {}
