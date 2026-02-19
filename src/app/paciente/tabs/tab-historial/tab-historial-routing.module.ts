import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabHistorialPage } from './tab-historial.page';

const routes: Routes = [
  {
    path: '',
    component: TabHistorialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabHistorialPageRoutingModule {}
