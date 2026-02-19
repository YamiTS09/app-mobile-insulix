import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabBienestarPage } from './tab-bienestar.page';

const routes: Routes = [
  {
    path: '',
    component: TabBienestarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabBienestarPageRoutingModule {}
