import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabCatalogoPage } from './tab-catalogo.page';

const routes: Routes = [
  {
    path: '',
    component: TabCatalogoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabCatalogoPageRoutingModule {}
