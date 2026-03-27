import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-monitoreo',
  templateUrl: './tab-monitoreo.page.html',
  styleUrls: ['./tab-monitoreo.page.scss'],
  standalone: false
})
export class TabMonitoreoPage implements OnInit {

  nombre: string = 'Sandra'; // Placeholder or fetch from local storage
  glucosa: number = 120;
  estado: 'Alto' | 'Normal' | 'Bajo' = 'Alto'; // Simulating 'Alto' state
  tendencia: 'subiendo' | 'estable' | 'bajando' = 'subiendo';

  constructor() { }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const session = localStorage.getItem('userProfile') || localStorage.getItem('user_session');
    if (session) {
      const user = JSON.parse(session);
      // If the user has a name in the session, use it. Otherwise keep 'Sandra' as requested mockup.
      if (user.nombre) {
        this.nombre = user.nombre;
      }
    }
  }

}
