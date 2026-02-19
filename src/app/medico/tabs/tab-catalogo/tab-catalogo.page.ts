import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router'; // Asegúrate de tener esta importación
import { AddCatalogComponent } from '../../modals/add-catalog/add-catalog.component';

@Component({
  selector: 'app-tab-catalogo',
  templateUrl: './tab-catalogo.page.html',
  styleUrls: ['./tab-catalogo.page.scss'],
  standalone: false
})
export class TabCatalogoPage implements OnInit {

  searchTerm: string = '';
  segmentValue: 'dieta' | 'ejercicio' = 'dieta';
  filtroComida: string = 'Desayuno';

  dietas: any[] = [];
  ejercicios: any[] = [];
  itemsFiltrados: any[] = [];
  
  // 1. DECLARAR LA VARIABLE (Esto quita el primer error)
  pacienteEnSeleccion: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.cargarDatos();
    
    // Escuchar parámetros de la URL para saber si estamos asignando algo
    this.route.queryParams.subscribe(params => {
      if (params['segmento']) {
        this.segmentValue = params['segmento'];
      }
      this.pacienteEnSeleccion = params['asignarAPaciente'] || null;
      this.filterItems();
    });
  }

  // 2. DECLARAR LA FUNCIÓN (Esto quita el segundo error)
  seleccionarItem(item: any) {
    const datosLocales = localStorage.getItem('insulix_pacientes');
    if (datosLocales && this.pacienteEnSeleccion) {
      let pacientes = JSON.parse(datosLocales);
      const index = pacientes.findIndex((p: any) => p.usuario === this.pacienteEnSeleccion);

      if (index !== -1) {
        // Asignamos el objeto según el segmento actual
        if (this.segmentValue === 'dieta') {
          pacientes[index].dietaAsignada = item;
        } else {
          pacientes[index].ejercicioAsignado = item;
        }

        // Guardamos la lista actualizada
        localStorage.setItem('insulix_pacientes', JSON.stringify(pacientes));
        
        // Regresamos al detalle del paciente
        this.navCtrl.navigateBack(['/detalle-paciente', this.pacienteEnSeleccion]);
      }
    }
  }

  // Los demás métodos (cargarDatos, filterItems, openAddModal, eliminarItem, etc.)
  // deben ir aquí abajo, siempre DENTRO de la llave final de la clase.

  cargarDatos() {
    const d = localStorage.getItem('insulix_dietas');
    const e = localStorage.getItem('insulix_ejercicios');
    this.dietas = d ? JSON.parse(d) : [];
    this.ejercicios = e ? JSON.parse(e) : [];
    this.filterItems();
  }

  guardarDatos() {
    localStorage.setItem('insulix_dietas', JSON.stringify(this.dietas));
    localStorage.setItem('insulix_ejercicios', JSON.stringify(this.ejercicios));
  }

  filterItems() {
    const search = this.searchTerm.toLowerCase();
    if (this.segmentValue === 'dieta') {
      this.itemsFiltrados = this.dietas.filter(item => {
        const matchesSearch = item.platillo?.toLowerCase().includes(search) || 
                             item.nombre?.toLowerCase().includes(search);
        const matchesType = item.tipo === this.filtroComida;
        return matchesSearch && matchesType;
      });
    } else {
      this.itemsFiltrados = this.ejercicios.filter(item => 
        item.nombre?.toLowerCase().includes(search)
      );
    }
  }

  async openAddModal(itemParaEditar?: any) {
    const modal = await this.modalCtrl.create({
      component: AddCatalogComponent,
      componentProps: { type: this.segmentValue, itemAEditar: itemParaEditar }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      if (itemParaEditar) {
        const list = this.segmentValue === 'dieta' ? this.dietas : this.ejercicios;
        const index = list.findIndex(i => i.id === data.id);
        if (index !== -1) list[index] = data;
      } else {
        data.id = Date.now();
        data.pacientes = 0;
        this.segmentValue === 'dieta' ? this.dietas.push(data) : this.ejercicios.push(data);
      }
      this.guardarDatos();
      this.filterItems();
    }
  }

  setFiltroComida(filtro: string) {
    this.filtroComida = filtro;
    this.filterItems();
  }

  async eliminarItem(item: any) {
    const confirmacion = confirm(`¿Deseas eliminar "${item.nombre || item.tipo}"?`);
    if (confirmacion) {
      if (this.segmentValue === 'dieta') {
        this.dietas = this.dietas.filter(d => d.id !== item.id);
      } else {
        this.ejercicios = this.ejercicios.filter(e => e.id !== item.id);
      }
      this.guardarDatos();
      this.filterItems();
    }
  }
}