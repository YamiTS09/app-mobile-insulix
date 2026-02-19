import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsMedicoPageRoutingModule } from './tabs-medico-routing.module';

import { TabsMedicoPage } from './tabs-medico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsMedicoPageRoutingModule
  ],
  declarations: [TabsMedicoPage]
})
export class TabsMedicoPageModule {}
