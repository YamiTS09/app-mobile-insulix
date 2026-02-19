import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-bienestar',
  templateUrl: './tab-bienestar.page.html',
  styleUrls: ['./tab-bienestar.page.scss'],
  standalone: false
})
export class TabBienestarPage implements OnInit {

  segmentoSeleccionado: 'dieta' | 'ejercicio' = 'dieta';
  fechaActual: string = '';
  
  // Variables para almacenar los datos asignados por el médico
  dietasAsignadas: any[] = [];
  ejercicioAsignado: any = null;
  usuarioLogueado: any = null;

  constructor() { }

  ngOnInit() {
    this.establecerFecha();
    this.cargarDatosAsignados();
  }

  establecerFecha() {
    const opciones: any = { weekday: 'long', day: 'numeric' };
    this.fechaActual = new Date().toLocaleDateString('es-ES', opciones).toUpperCase() + ' (HOY)';
  }

  cargarDatosAsignados() {
    // 1. Obtener la sesión activa y la lista de pacientes del médico
    const session = localStorage.getItem('user_session');
    const todosLosPacientes = localStorage.getItem('insulix_pacientes');

    if (session && todosLosPacientes) {
      this.usuarioLogueado = JSON.parse(session);
      const listaPacientes = JSON.parse(todosLosPacientes);

      // 2. Buscar al paciente logueado dentro de la lista que gestiona el médico
      const misDatos = listaPacientes.find((p: any) => p.usuario === this.usuarioLogueado.usuario);

      if (misDatos) {
        // 3. Sincronizar con lo que el médico asignó en el Detalle Paciente
        this.dietasAsignadas = misDatos.dietasAsignadas || [];
        this.ejercicioAsignado = misDatos.ejercicioAsignado || null;
      }
    }
  }

  cambiarSegmento(val: 'dieta' | 'ejercicio') {
    this.segmentoSeleccionado = val;
  }
}