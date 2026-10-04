import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DietasService, CatalogDish, MealCategory, WeeklyMealPlan } from '../../services/dietas.service';

@Component({
  selector: 'app-plan-alimenticio',
  templateUrl: './plan-alimenticio.page.html',
  styleUrls: ['./plan-alimenticio.page.scss'],
  standalone: false
})
export class PlanAlimenticioPage implements OnInit {
  pacienteId = '';
  pacienteNombre = 'Paciente';
  fechaInicio = this.obtenerLunesISO(new Date());
  fechaFin = this.sumarDias(this.fechaInicio, 6);
  plan: WeeklyMealPlan | null = null;
  catalogo: CatalogDish[] = [];
  cargando = false;
  guardando = false;
  errorMessage = '';
  successMessage = '';
  selectorPlatillosAbierto = false;
  busquedaPlatillo = '';
  readonly tiposComida: MealCategory[] = ['Desayuno', 'Comida', 'Cena', 'Colación'];

  @ViewChild('selectorPlatillo') private selectorPlatillo?: ElementRef<HTMLButtonElement>;
  @ViewChild('busquedaInput') private busquedaInput?: ElementRef<HTMLInputElement>;

  nuevaComida: {
    catalogo_platillo_id: string;
    fecha: string;
    tipo_comida: MealCategory;
    hora: string;
    comentario: string;
  } = {
    catalogo_platillo_id: '',
    fecha: this.fechaInicio,
    tipo_comida: 'Desayuno',
    hora: '08:00',
    comentario: ''
  };

  private dietasService = inject(DietasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  get platilloSeleccionado(): CatalogDish | undefined {
    return this.catalogo.find(item => item.catalogo_platillo_id === this.nuevaComida.catalogo_platillo_id);
  }

  get platillosFiltrados(): CatalogDish[] {
    const search = this.normalizarBusqueda(this.busquedaPlatillo.trim());
    return search ? this.catalogo.filter(item =>
      this.normalizarBusqueda(`${item.nombre} ${item.descripcion || ''}`).includes(search)
    ) : this.catalogo;
  }

  alternarSelectorPlatillos() {
    if (this.guardando || !this.catalogo.length) return;
    this.selectorPlatillosAbierto = !this.selectorPlatillosAbierto;
    if (this.selectorPlatillosAbierto) {
      this.busquedaPlatillo = '';
      setTimeout(() => this.busquedaInput?.nativeElement.focus());
    }
  }

  seleccionarPlatillo(item: CatalogDish) {
    if (this.guardando) return;
    this.nuevaComida.catalogo_platillo_id = item.catalogo_platillo_id;
    this.cerrarSelectorPlatillos();
  }

  cerrarSelectorPlatillos() {
    this.selectorPlatillosAbierto = false;
    this.selectorPlatillo?.nativeElement.focus();
  }

  identificarPlatillo(_index: number, item: CatalogDish): string {
    return item.catalogo_platillo_id;
  }

  private normalizarBusqueda(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-MX');
  }

  ngOnInit() {
    this.pacienteId = this.route.snapshot.paramMap.get('id') || '';
    this.obtenerNombrePaciente();
    if (!this.pacienteId) {
      this.errorMessage = 'No se identificó al paciente.';
      return;
    }
    this.cargarCatalogo();
    this.cargarPlan();
  }

  alCambiarSemana(value: string) {
    if (!value) return;
    this.fechaInicio = this.obtenerLunesISO(this.fechaComoLocal(value));
    this.fechaFin = this.sumarDias(this.fechaInicio, 6);
    this.nuevaComida.fecha = this.fechaInicio;
  }

  cargarPlan() {
    this.selectorPlatillosAbierto = false;
    this.cargando = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.dietasService.getWeeklyPlan(this.pacienteId, this.fechaInicio).subscribe({
      next: plan => {
        this.plan = plan;
        this.fechaFin = plan?.fecha_fin || this.sumarDias(this.fechaInicio, 6);
        this.nuevaComida.fecha = this.fechaInicio;
        this.cargando = false;
      },
      error: error => {
        this.cargando = false;
        this.errorMessage = error?.error?.message || 'No se pudo consultar el plan semanal.';
      }
    });
  }

  cargarCatalogo() {
    this.dietasService.getDietasCatalogo().subscribe({
      next: catalogo => this.catalogo = catalogo,
      error: error => this.errorMessage = error?.error?.message || 'No se pudo cargar el catálogo de platillos.'
    });
  }

  async crearPlan() {
    if (this.guardando) return;
    this.guardando = true;
    this.errorMessage = '';
    this.dietasService.createWeeklyPlan({ paciente_id: this.pacienteId, fecha_inicio: this.fechaInicio }).subscribe({
      next: plan => {
        this.plan = plan;
        this.fechaFin = plan.fecha_fin;
        this.guardando = false;
        this.successMessage = 'Se creó el borrador del plan semanal.';
      },
      error: error => {
        this.guardando = false;
        this.errorMessage = error?.error?.message || 'No se pudo crear el plan semanal.';
        if (error?.status === 409) this.cargarPlan();
      }
    });
  }

  agregarComida() {
    if (!this.plan || this.plan.estado !== 'BORRADOR' || this.guardando) return;
    if (!this.nuevaComida.catalogo_platillo_id || !this.nuevaComida.fecha || !this.nuevaComida.hora) {
      this.errorMessage = 'Elige un platillo, una fecha y una hora.';
      return;
    }

    this.guardando = true;
    this.errorMessage = '';
    this.dietasService.addDishToPlan(this.plan.plan_id, {
      ...this.nuevaComida,
      comentario: this.nuevaComida.comentario.trim() || null
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.nuevaComida.catalogo_platillo_id = '';
        this.nuevaComida.comentario = '';
        this.successMessage = 'El platillo se agregó al plan.';
        this.cargarPlan();
      },
      error: error => {
        this.guardando = false;
        this.errorMessage = error?.error?.message || 'No se pudo agregar el platillo.';
      }
    });
  }

  async quitarComida(comida: any) {
    if (!this.plan || this.plan.estado !== 'BORRADOR') return;
    const confirm = await this.alertCtrl.create({
      header: 'Quitar platillo',
      message: `¿Quieres quitar “${comida.nombre_platillo}” de este plan?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Quitar', role: 'destructive', handler: () => {
          this.dietasService.removeDishFromPlan(this.plan!.plan_id, comida.detalle_id).subscribe({
            next: () => this.cargarPlan(),
            error: error => this.errorMessage = error?.error?.message || 'No se pudo quitar el platillo.'
          });
        } }
      ]
    });
    await confirm.present();
  }

  cambiarEstado(estado: 'BORRADOR' | 'PUBLICADO') {
    if (!this.plan || this.guardando) return;
    this.guardando = true;
    this.errorMessage = '';
    this.dietasService.setPlanStatus(this.plan.plan_id, estado).subscribe({
      next: plan => {
        this.plan = plan;
        this.guardando = false;
        this.successMessage = estado === 'PUBLICADO'
          ? 'El paciente ya puede consultar el plan.'
          : 'El plan volvió a borrador para editarlo.';
      },
      error: error => {
        this.guardando = false;
        this.errorMessage = error?.error?.message || 'No se pudo actualizar el estado del plan.';
      }
    });
  }

  async volver() {
    await this.router.navigate(['/detalle-paciente', this.pacienteId]);
  }

  formatearFecha(fecha: string): string {
    const date = this.fechaComoLocal(fecha);
    return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  }

  private obtenerLunesISO(date: Date): string {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = monday.getDay();
    monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
    return this.formatoFechaISO(monday);
  }

  private sumarDias(dateValue: string, days: number): string {
    const date = this.fechaComoLocal(dateValue);
    date.setDate(date.getDate() + days);
    return this.formatoFechaISO(date);
  }

  private formatoFechaISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fechaComoLocal(value: string | Date): Date {
    if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private obtenerNombrePaciente() {
    const raw = localStorage.getItem('insulix_pacientes');
    if (!raw) return;
    try {
      const paciente = JSON.parse(raw).find((item: any) => item.usuario === this.pacienteId);
      if (paciente) this.pacienteNombre = `${paciente.nombre || ''} ${paciente.apellido_paterno || ''}`.trim() || 'Paciente';
    } catch {
      this.pacienteNombre = 'Paciente';
    }
  }
}
