import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-historial',
  templateUrl: './tab-historial.page.html',
  styleUrls: ['./tab-historial.page.scss'],
  standalone: false
})
export class TabHistorialPage implements OnInit {
  searchTerm: string = '';
  filtroActivo: string = 'todos';
  historialAlertas: any[] = [];

  constructor() { }

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
  const datosLocales = localStorage.getItem('insulix_pacientes');
  const pacientes = datosLocales ? JSON.parse(datosLocales) : [];
  
  const opcionesFecha: any = { day: 'numeric', month: 'long', year: 'numeric' };
  
  this.historialAlertas = pacientes.map((p: any) => ({
    ...p,
    fecha: new Date().toLocaleDateString('es-ES', opcionesFecha),
    // Simulamos una hora, en un caso real esto vendría de la base de datos de alertas
    hora: p.horaAlerta || '9:15 am' 
  }));
}
  get historialFiltrado() {
    return this.historialAlertas.filter(h => {
      const cumpleFiltro = this.filtroActivo === 'todos' || h.estado === this.filtroActivo;
      const cumpleBusqueda = h.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      return cumpleFiltro && cumpleBusqueda;
    });
  }

  getColor(estado: string) {
    switch (estado) {
      case 'alto': return '#e60000';
      case 'normal': return '#00d638';
      case 'bajo': return '#e69500';
      default: return '#ccc';
    }
  }

}
