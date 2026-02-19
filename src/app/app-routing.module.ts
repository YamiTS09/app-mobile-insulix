import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MedicoHeaderComponent } from './components/medico-header/medico-header.component';
import { PerfilComponent } from './components/menu/perfil/perfil.component';
import { ConfiguracionComponent } from './components/menu/configuracion/configuracion.component';
import { NosotrosComponent } from './components/menu/nosotros/nosotros.component';
import { AcercadeComponent } from './components/menu/acercade/acercade.component';
import { DetallePacienteComponent } from './components/detalle-paciente/detalle-paciente.component';
const routes: Routes = [
  {
    path: 'inicio-sesion',
    loadChildren: () => import('./login/Inicio-sesión/inicio-sesion.module').then(m => m.InicioSesionPageModule)
  },
  {
    path: '',
    redirectTo: 'inicio-sesion',
    pathMatch: 'full'
  },
  {
    path: 'tabs-medico',
    loadChildren: () => import('./medico/tabs-medico/tabs-medico.module').then(m => m.TabsMedicoPageModule)
  },
  {
    path: 'tab-pacientes',
    loadChildren: () => import('./medico/tabs/tab-pacientes/tab-pacientes.module').then(m => m.TabPacientesPageModule)
  },
  {
    path: 'tab-catalogo',
    loadChildren: () => import('./medico/tabs/tab-catalogo/tab-catalogo.module').then(m => m.TabCatalogoPageModule)
  },
  {
    path: 'tab-reportes',
    loadChildren: () => import('./medico/tabs/tab-reportes/tab-reportes.module').then(m => m.TabReportesPageModule)
  },
  {
    path: 'registro-medico',
    loadChildren: () => import('./login/registro-medico/registro-medico.module').then(m => m.RegistroMedicoPageModule)
  },
  {
    path: 'reestablecer-contrasenia',
    loadChildren: () => import('./login/reestablecer-contrasenia/reestablecer-contrasenia.module').then(m => m.ReestablecerContraseniaPageModule)
  },
  // tabs-routing.module.ts o app-routing.module.ts
{
  path: 'detalle-paciente/:id',
  component: DetallePacienteComponent
},
  // Menú personalizado
  { path: 'perfil', component: PerfilComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'acercade', component: AcercadeComponent },
  {
    path: 'tabs-paciente',
    loadChildren: () => import('./paciente/tabs-paciente/tabs-paciente.module').then( m => m.TabsPacientePageModule)
  },
  {
    path: 'tab-monitoreo',
    loadChildren: () => import('./paciente/tabs/tab-monitoreo/tab-monitoreo.module').then( m => m.TabMonitoreoPageModule)
  },
  {
    path: 'tab-bienestar',
    loadChildren: () => import('./paciente/tabs/tab-bienestar/tab-bienestar.module').then( m => m.TabBienestarPageModule)
  },
  {
    path: 'tab-historial',
    loadChildren: () => import('./paciente/tabs/tab-historial/tab-historial.module').then( m => m.TabHistorialPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
