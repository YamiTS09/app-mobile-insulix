import { Component } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';

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
    private navCtrl: NavController
  ) {
    // Cargamos datos al iniciar
    this.actualizarDatosMenu();
  }

  // 2. Método para refrescar los datos (Error TS2339 corregido)
  actualizarDatosMenu() {
    const session = localStorage.getItem('userProfile') || localStorage.getItem('user_session');
    if (session) {
      this.usuarioLogueado = JSON.parse(session);
    } else {
      this.usuarioLogueado = null;
    }
  }

  // 3. Método para salir (Error TS2339 corregido)
  cerrarSesion() {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('user_session');
    localStorage.removeItem('access_token');
    this.usuarioLogueado = null;
    this.menuCtrl.close(); // Cierra el menú lateral
    this.navCtrl.navigateRoot('/inicio-sesion');
  }
}
