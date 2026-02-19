import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsMedicoPage } from './tabs-medico.page';

const routes: Routes = [
  {
    path: '',
    component: TabsMedicoPage,
    children: [
      {
        path: 'tab-pacientes',
        loadChildren: () => import('../tabs/tab-pacientes/tab-pacientes.module').then( m => m.TabPacientesPageModule)
      },
      {
        path: 'tab-catalogo',
        loadChildren: () => import('../tabs/tab-catalogo/tab-catalogo.module').then( m => m.TabCatalogoPageModule)
      },
      {
        path: 'tab-reportes',
        loadChildren: () => import('../tabs/tab-reportes/tab-reportes.module').then( m => m.TabReportesPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-medico/tab-pacientes',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsMedicoPageRoutingModule {}
