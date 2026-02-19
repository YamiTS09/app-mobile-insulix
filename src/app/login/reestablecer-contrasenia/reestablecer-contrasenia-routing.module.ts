import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReestablecerContraseniaPage } from './reestablecer-contrasenia.page';

const routes: Routes = [
  {
    path: '',
    component: ReestablecerContraseniaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReestablecerContraseniaPageRoutingModule {}
