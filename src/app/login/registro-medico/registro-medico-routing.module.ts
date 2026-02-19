import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroMedicoPage } from './registro-medico.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroMedicoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroMedicoPageRoutingModule {}
