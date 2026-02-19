import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabReportesPage } from './tab-reportes.page';

const routes: Routes = [
  {
    path: '',
    component: TabReportesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabReportesPageRoutingModule {}
