import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPacientePage } from './tabs-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPacientePage,
    children: [
      {
        path: 'tab-monitoreo',
        loadChildren: () => import('../tabs/tab-monitoreo/tab-monitoreo.module').then( m => m.TabMonitoreoPageModule)
      },
      {
        path: 'tab-bienestar',
        loadChildren: () => import('../tabs/tab-bienestar/tab-bienestar.module').then( m => m.TabBienestarPageModule)
      },
      {
        path: 'tab-historial',
        loadChildren: () => import('../tabs/tab-historial/tab-historial.module').then( m => m.TabHistorialPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs-paciente/tab-monitoreo',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPacientePageRoutingModule {}
