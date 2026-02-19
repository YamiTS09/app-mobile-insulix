import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabMonitoreoPage } from './tab-monitoreo.page';

const routes: Routes = [
  {
    path: '',
    component: TabMonitoreoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabMonitoreoPageRoutingModule {}
