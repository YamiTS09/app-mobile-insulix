import { Component, OnInit, inject } from '@angular/core';
import { ModalController, NavController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AddCatalogComponent } from '../../modals/add-catalog/add-catalog.component';
import { DietasService } from 'src/app/services/dietas.service';
import { ActividadService } from 'src/app/services/actividad.service';

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
  
  pacienteEnSeleccion: string | null = null;

  private dietasService = inject(DietasService);
  private actividadService = inject(ActividadService);

  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
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

  seleccionarItem(item: any) {
    if (this.pacienteEnSeleccion) {
      const asignacion = {
        paciente_id: this.pacienteEnSeleccion,
        fecha_asignacion: new Date().toISOString(),
        dieta_id: item.id, // el id mapeado es el _id de mongo
        actividad_id: item.id, // igual
        notas_medicas: 'Asignado desde el catálogo',
        fecha: new Date().toISOString() // por si el back lo requiere para actividad
      };

      if (this.segmentValue === 'dieta') {
        this.dietasService.asignarDieta(asignacion).subscribe({
          next: () => this.navCtrl.navigateBack(['/detalle-paciente', this.pacienteEnSeleccion]),
          error: (err) => console.error('Error asignando dieta', err)
        });
      } else {
        this.actividadService.asignarActividad(asignacion).subscribe({
          next: () => this.navCtrl.navigateBack(['/detalle-paciente', this.pacienteEnSeleccion]),
          error: (err) => console.error('Error asignando actividad', err)
        });
      }
    }
  }

  cargarDatos() {
    this.dietasService.getDietasCatalogo().subscribe({
      next: (res) => {
        this.dietas = res.map(d => ({
          ...d,
          id: d._id || d.id,
          nombre: d.nombre_platillo || d.nombre,
          tipo: d.categoria || d.tipo
        }));
        this.filterItems();
      },
      error: (err) => console.error('Error cargando dietas', err)
    });

    this.actividadService.getActividadesCatalogo().subscribe({
      next: (res) => {
        this.ejercicios = res.map(e => ({
          ...e,
          id: e._id || e.id,
          nombre: e.nombre_ejercicio || e.nombre,
          duracion: e.duracion_min + ' min' || e.duracion,
          descripcion: e.intensidad || e.descripcion
        }));
        this.filterItems();
      },
      error: (err) => console.error('Error cargando actividades', err)
    });
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
      const loading = await this.loadingCtrl.create({
        message: 'Guardando...',
        spinner: 'crescent',
        cssClass: 'white-custom-loading'
      });
      await loading.present();

      if (itemParaEditar) {
        // Edit pattern
        const id = itemParaEditar.id;
        if (this.segmentValue === 'dieta') {
          const payload = {
            nombre_platillo: data.nombre,
            categoria: data.tipo,
            platillo: data.platillo,
            bebida: data.bebida
          };
          this.dietasService.updateDietaCatalogo(id, payload).subscribe({
            next: () => { loading.dismiss(); this.cargarDatos(); },
            error: () => loading.dismiss()
          });
        } else {
          const payload = {
            nombre_ejercicio: data.nombre,
            duracion_min: parseInt(data.duracion),
            intensidad: data.descripcion
          };
          this.actividadService.updateActividadCatalogo(id, payload).subscribe({
            next: () => { loading.dismiss(); this.cargarDatos(); },
            error: () => loading.dismiss()
          });
        }
      } else {
        // Create pattern
        if (this.segmentValue === 'dieta') {
          const payload = {
            nombre_platillo: data.nombre,
            categoria: data.tipo,
            platillo: data.platillo,
            bebida: data.bebida
          };
          this.dietasService.createDietaCatalogo(payload).subscribe({
            next: () => { loading.dismiss(); this.cargarDatos(); },
            error: () => loading.dismiss()
          });
        } else {
          const payload = {
            nombre_ejercicio: data.nombre,
            duracion_min: parseInt(data.duracion) || 30,
            intensidad: data.descripcion || 'Media'
          };
          this.actividadService.createActividadCatalogo(payload).subscribe({
            next: () => { loading.dismiss(); this.cargarDatos(); },
            error: () => loading.dismiss()
          });
        }
      }
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
        this.dietasService.deleteDietaCatalogo(item.id).subscribe(() => this.cargarDatos());
      } else {
        this.actividadService.deleteActividadCatalogo(item.id).subscribe(() => this.cargarDatos());
      }
    }
  }
}