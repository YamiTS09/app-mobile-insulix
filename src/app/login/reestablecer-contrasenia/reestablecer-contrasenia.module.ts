import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReestablecerContraseniaPageRoutingModule } from './reestablecer-contrasenia-routing.module';

import { ReestablecerContraseniaPage } from './reestablecer-contrasenia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReestablecerContraseniaPageRoutingModule
  ],
  declarations: [ReestablecerContraseniaPage]
})
export class ReestablecerContraseniaPageModule {}
