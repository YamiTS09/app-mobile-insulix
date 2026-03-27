import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MedicoHeaderComponent } from './components/medico-header/medico-header.component';
import { PerfilComponent } from './components/menu/perfil/perfil.component';
import { ConfiguracionComponent } from './components/menu/configuracion/configuracion.component';
import { NosotrosComponent } from './components/menu/nosotros/nosotros.component';
import { AcercadeComponent } from './components/menu/acercade/acercade.component';
import { DetallePacienteComponent } from './components/detalle-paciente/detalle-paciente.component';

// Importamos el guard que acabas de crear
import { authGuard } from './guards/auth-guard';

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
    path: 'registro-medico',
    loadChildren: () => import('./login/registro-medico/registro-medico.module').then(m => m.RegistroMedicoPageModule)
  },
  {
    path: 'reestablecer-contrasenia',
    loadChildren: () => import('./login/reestablecer-contrasenia/reestablecer-contrasenia.module').then(m => m.ReestablecerContraseniaPageModule)
  },

  // --- RUTAS PROTEGIDAS PARA MÉDICOS ---
  {
    path: 'tabs-medico',
    canActivate: [authGuard],
    loadChildren: () => import('./medico/tabs-medico/tabs-medico.module').then(m => m.TabsMedicoPageModule)
  },
  {
    path: 'tab-pacientes',
    canActivate: [authGuard],
    loadChildren: () => import('./medico/tabs/tab-pacientes/tab-pacientes.module').then(m => m.TabPacientesPageModule)
  },
  {
    path: 'tab-catalogo',
    canActivate: [authGuard],
    loadChildren: () => import('./medico/tabs/tab-catalogo/tab-catalogo.module').then(m => m.TabCatalogoPageModule)
  },
  {
    path: 'tab-reportes',
    canActivate: [authGuard],
    loadChildren: () => import('./medico/tabs/tab-reportes/tab-reportes.module').then(m => m.TabReportesPageModule)
  },
  {
    path: 'detalle-paciente/:id',
    canActivate: [authGuard],
    component: DetallePacienteComponent
  },

  // --- RUTAS PROTEGIDAS PARA PACIENTES ---
  {
    path: 'tabs-paciente',
    canActivate: [authGuard],
    loadChildren: () => import('./paciente/tabs-paciente/tabs-paciente.module').then( m => m.TabsPacientePageModule)
  },
  {
    path: 'tab-monitoreo',
    canActivate: [authGuard],
    loadChildren: () => import('./paciente/tabs/tab-monitoreo/tab-monitoreo.module').then( m => m.TabMonitoreoPageModule)
  },
  {
    path: 'tab-bienestar',
    canActivate: [authGuard],
    loadChildren: () => import('./paciente/tabs/tab-bienestar/tab-bienestar.module').then( m => m.TabBienestarPageModule)
  },
  {
    path: 'tab-historial',
    canActivate: [authGuard],
    loadChildren: () => import('./paciente/tabs/tab-historial/tab-historial.module').then( m => m.TabHistorialPageModule)
  },

  // --- COMPONENTES DE MENÚ (TAMBIÉN PROTEGIDOS) ---
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [authGuard] },
  { path: 'nosotros', component: NosotrosComponent, canActivate: [authGuard] },
  { path: 'acercade', component: AcercadeComponent, canActivate: [authGuard] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }