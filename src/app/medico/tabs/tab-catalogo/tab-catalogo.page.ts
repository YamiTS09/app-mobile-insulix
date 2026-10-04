import { Component, OnInit, inject } from '@angular/core';
import { ModalController, NavController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AddCatalogComponent } from '../../modals/add-catalog/add-catalog.component';
import { DietasService, CatalogDish } from 'src/app/services/dietas.service';
import { ActividadService } from 'src/app/services/actividad.service';
import { CatalogDraftService } from 'src/app/services/catalog-draft.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-tab-catalogo',
  templateUrl: './tab-catalogo.page.html',
  styleUrls: ['./tab-catalogo.page.scss'],
  standalone: false
})
export class TabCatalogoPage implements OnInit {
  searchTerm = '';
  segmentValue: 'dieta' | 'ejercicio' = 'dieta';
  filtroComida = '';
  dietas: any[] = [];
  ejercicios: any[] = [];
  itemsFiltrados: any[] = [];
  pacienteEnSeleccion: string | null = null;

  private dietasService = inject(DietasService);
  private actividadService = inject(ActividadService);
  private drafts = inject(CatalogDraftService);
  private session = inject(SessionService);

  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['segmento'] === 'dieta' || params['segmento'] === 'ejercicio') {
        this.segmentValue = params['segmento'];
      }
      this.pacienteEnSeleccion = params['asignarAPaciente'] || null;
      this.filterItems();
    });
    this.cargarDatos();
  }

  async seleccionarItem(item: any) {
    if (!this.pacienteEnSeleccion) return;
    if (this.segmentValue === 'dieta') {
      await this.navCtrl.navigateForward(['/plan-alimenticio', this.pacienteEnSeleccion]);
      return;
    }

    const asignacion = {
      paciente_id: this.pacienteEnSeleccion,
      notas_medicas: 'Asignado desde el catálogo',
      fecha: new Date().toISOString(),
      actividad_id: item.id
    };
    this.actividadService.asignarActividad(asignacion).subscribe({
      next: () => this.navCtrl.navigateBack(['/detalle-paciente', this.pacienteEnSeleccion]),
      error: error => this.mostrarError(error?.error?.message || 'No fue posible asignar la actividad.')
    });
  }

  cargarDatos() {
    this.dietasService.getDietasCatalogo().subscribe({
      next: (res: CatalogDish[]) => {
        this.dietas = res.map(d => ({
          ...d,
          id: d.catalogo_platillo_id,
          nombre: d.nombre,
          tipo: d.categoria_sugerida || '',
          pacientes: d.pacientes_asignados || 0
        }));
        this.filterItems();
      },
      error: error => this.mostrarError(error?.error?.message || 'No fue posible cargar el catálogo de platillos.')
    });

    this.actividadService.getActividadesCatalogo().subscribe({
      next: res => {
        this.ejercicios = res.map(e => ({
          ...e,
          id: e._id || e.id,
          nombre: e.nombre_ejercicio || e.nombre,
          duracion: e.duracion_min + ' min' || e.duracion,
          descripcion: e.intensidad || e.descripcion
        }));
        this.filterItems();
      },
      error: error => console.error('Error cargando actividades', error)
    });
  }

  filterItems() {
    const search = this.searchTerm.trim().toLocaleLowerCase();
    if (this.segmentValue === 'dieta') {
      this.itemsFiltrados = this.dietas.filter(item => {
        const searchable = `${item.nombre || ''} ${item.descripcion || ''}`.toLocaleLowerCase();
        const matchesSearch = !search || searchable.includes(search);
        const matchesType = !this.filtroComida || item.categoria_sugerida === this.filtroComida;
        return matchesSearch && matchesType;
      });
    } else {
      this.itemsFiltrados = this.ejercicios.filter(item =>
        item.nombre?.toLocaleLowerCase().includes(search)
      );
    }
  }

  async openAddModal(itemParaEditar?: any) {
    const type = this.segmentValue;
    const userId = this.session.getValidUser()?.uid;
    const itemId = itemParaEditar?.catalogo_platillo_id || itemParaEditar?.id;
    const draftKey = userId ? this.drafts.keyFor(userId, type, itemId) : null;
    let saveBeforeClose = () => {};
    const modal = await this.modalCtrl.create({
      component: AddCatalogComponent,
      componentProps: {
        type,
        itemAEditar: itemParaEditar,
        draftKey,
        registerDraftSaver: (save: () => void) => { saveBeforeClose = save; }
      },
      canDismiss: async () => { saveBeforeClose(); return true; },
      breakpoints: type === 'dieta' ? [0, 0.85, 1] : undefined,
      initialBreakpoint: type === 'dieta' ? 0.85 : undefined,
      handle: type === 'dieta'
    });
    await modal.present();
    const { data: submittedDraft, role } = await modal.onDidDismiss();
    if (role !== 'save' || !submittedDraft) {
      if (draftKey && this.drafts.get(draftKey)) {
        const toast = await this.toastCtrl.create({
          message: 'Borrador conservado. Puedes continuar al abrir este formulario.',
          duration: 3500,
          position: 'bottom',
          buttons: [{ text: 'Aceptar', role: 'cancel' }]
        });
        await toast.present();
      }
      return;
    }
    const data = submittedDraft.values;

    const loading = await this.loadingCtrl.create({ message: 'Guardando…', spinner: 'crescent' });
    await loading.present();
    try {
      if (type === 'dieta') {
        await this.guardarPlatillo(data, itemId);
      } else {
        const payload = {
          nombre_ejercicio: data.nombre,
          duracion_min: parseInt(data.duracion, 10) || 30,
          intensidad: data.descripcion || 'Media'
        };
        if (itemParaEditar) {
          await firstValueFrom(this.actividadService.updateActividadCatalogo(itemId, payload));
        } else {
          await firstValueFrom(this.actividadService.createActividadCatalogo(payload));
        }
      }
      if (draftKey) this.drafts.discard(draftKey, submittedDraft.draftRevision);
      await loading.dismiss();
      this.cargarDatos();
    } catch (error: any) {
      await loading.dismiss();
      const message = error?.error?.message || 'No fue posible guardar los cambios.';
      await this.mostrarError(draftKey
        ? `${message} Tu borrador está conservado; abre el formulario para continuar.`
        : message);
    }
  }

  private async guardarPlatillo(data: any, id?: string) {
    let imagenUrl = data.imagen_url || null;
    if (data.imagen_file instanceof File) {
      const uploadResult = await firstValueFrom(this.dietasService.uploadCatalogImage(data.imagen_file));
      imagenUrl = uploadResult.imagen_url;
    }

    const payload: Partial<CatalogDish> = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      imagen_url: imagenUrl,
      categoria_sugerida: data.categoria_sugerida || null,
      porcion_cantidad: Number(data.porcion_cantidad),
      porcion_unidad: data.porcion_unidad,
      calorias_kcal: Number(data.calorias_kcal),
      carbohidratos_g: this.optionalNumber(data.carbohidratos_g),
      proteinas_g: this.optionalNumber(data.proteinas_g),
      grasas_g: this.optionalNumber(data.grasas_g),
      azucares_g: this.optionalNumber(data.azucares_g),
      fibra_g: this.optionalNumber(data.fibra_g),
      colesterol_mg: this.optionalNumber(data.colesterol_mg),
      bebida_nombre: data.bebida_nombre?.trim() || null,
      bebida_cantidad_ml: this.optionalNumber(data.bebida_cantidad_ml),
      bebida_notas: data.bebida_notas?.trim() || null
    };

    if (id) await firstValueFrom(this.dietasService.updateDietaCatalogo(id, payload));
    else await firstValueFrom(this.dietasService.createDietaCatalogo(payload));
  }

  private optionalNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  setFiltroComida(filtro: string) {
    this.filtroComida = filtro;
    this.filterItems();
  }

  async eliminarItem(item: any) {
    const confirmacion = await this.alertCtrl.create({
      header: 'Eliminar platillo',
      message: `¿Quieres quitar “${item.nombre || item.tipo}” del catálogo? Los planes ya publicados conservarán sus datos.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.dietasService.deleteDietaCatalogo(item.id).subscribe({
          next: () => this.cargarDatos(),
          error: error => this.mostrarError(error?.error?.message || 'No fue posible eliminar el platillo.')
        }) }
      ]
    });
    await confirmacion.present();
  }

  private async mostrarError(message: string) {
    const alert = await this.alertCtrl.create({ header: 'Aviso', message, buttons: ['Aceptar'] });
    await alert.present();
  }
}
