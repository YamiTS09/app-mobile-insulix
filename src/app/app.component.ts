import { Component } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  // 1. Declaramos la variable que usará el HTML (Error TS2339 corregido)
  usuarioLogueado: any = null;

  constructor(
    private menuCtrl: MenuController,
    private navCtrl: NavController,
    private authService: AuthService,
    private sessionService: SessionService
  ) {
    // Cargamos datos al iniciar
    this.actualizarDatosMenu();
  }

  // 2. Método para refrescar los datos (Error TS2339 corregido)
  actualizarDatosMenu() {
    this.usuarioLogueado = this.sessionService.getValidUser();
  }

  // 3. Método para salir (Error TS2339 corregido)
  cerrarSesion() {
    this.sessionService.clearSession();
    this.usuarioLogueado = null;
    this.menuCtrl.close(); // Cierra el menú lateral
    this.authService.logout().subscribe({
      next: () => this.navCtrl.navigateRoot('/inicio-sesion'),
      error: () => this.navCtrl.navigateRoot('/inicio-sesion')
    });
  }
}
