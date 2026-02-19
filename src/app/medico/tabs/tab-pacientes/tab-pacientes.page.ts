import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgregarPacienteComponent } from '../../modals/agregar-paciente/agregar-paciente.component';

@Component({
  selector: 'app-tab-pacientes',
  templateUrl: './tab-pacientes.page.html',
  styleUrls: ['./tab-pacientes.page.scss'],
  standalone: false
})
export class TabPacientesPage implements OnInit {
  searchTerm: string = '';
  filtroActivo: string = 'todos';
  pacientes: any[] = [];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    const datosLocales = localStorage.getItem('insulix_pacientes');
    this.pacientes = datosLocales ? JSON.parse(datosLocales) : [];
  }

  guardarEnLocal() {
    localStorage.setItem('insulix_pacientes', JSON.stringify(this.pacientes));
  }

  async openAddPatientModal(pacienteParaEditar?: any) {
    const modal = await this.modalCtrl.create({
      component: AgregarPacienteComponent,
      cssClass: 'add-patient-modal',
      componentProps: {
        // Al igual que en catálogo, pasamos el item para editar
        itemAEditar: pacienteParaEditar 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data) {
      if (pacienteParaEditar) {
        // LÓGICA DE EDICIÓN (Busca por usuario, que es tu ID único)
        const index = this.pacientes.findIndex(p => p.usuario === data.usuario);
        if (index !== -1) {
          this.pacientes[index] = data;
        }
      } else {
        // LÓGICA DE CREACIÓN
        // Si no tiene imagen, el modal ya le asigna una por defecto
        this.pacientes.unshift(data);
      }
      
      this.guardarEnLocal();
    }
  }

  get pacientesFiltrados() {
    return this.pacientes.filter(p => {
      const cumpleFiltro = this.filtroActivo === 'todos' || p.estado === this.filtroActivo;
      const cumpleBusqueda = p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      return cumpleFiltro && cumpleBusqueda;
    });
  }

  setFiltro(tipo: string) {
    this.filtroActivo = tipo;
  }

  getColor(estado: string) {
    switch (estado) {
      case 'alto': return '#e60000';
      case 'normal': return '#00d638';
      case 'bajo': return '#e69500';
      default: return '#ccc';
    }
  }

  async eliminarPaciente(paciente: any) {
  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar a ${paciente.nombre}?`);
  
  if (confirmacion) {
    // Filtramos el arreglo para quitar el paciente seleccionado
    this.pacientes = this.pacientes.filter(p => p.usuario !== paciente.usuario);
    
    // Guardamos la lista actualizada en LocalStorage
    this.guardarEnLocal();
    
    // Si usas una lista filtrada aparte, recuerda refrescarla
    // this.filterItems(); 
  }
}
}