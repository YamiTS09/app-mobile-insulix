import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DietasService } from '../../../services/dietas.service';
import { ActividadService } from '../../../services/actividad.service';
import { WeightMeasurement, WeightService } from '../../../services/weight.service';

@Component({
  selector: 'app-tab-bienestar',
  templateUrl: './tab-bienestar.page.html',
  styleUrls: ['./tab-bienestar.page.scss'],
  standalone: false
})
export class TabBienestarPage implements OnInit, OnDestroy {

  @ViewChild('weightWheel') weightWheel?: ElementRef<HTMLElement>;

  segmentoSeleccionado: 'menu' | 'dieta' | 'ejercicio' | 'peso' = 'menu';
  fechaActual: string = '';
  pesoSeleccionado = 70;
  pesoActual: WeightMeasurement | null = null;
  pesoCargado = false;
  pesoCargando = false;
  guardandoPeso = false;
  selectorFechaAbierto = false;
  mensajePeso = '';
  errorPeso = '';
  fechaMedicion = this.obtenerFechaLocalActual();
  fechaMaxima = this.fechaMedicion;
  readonly opcionesPeso = Array.from(
    { length: ((200 - 30) * 2) + 1 },
    (_, index) => 30 + (index * 0.5)
  );
  private weightScrollTimer?: ReturnType<typeof setTimeout>;
  
  // Variables para almacenar los datos asignados por el médico
  dietasAsignadas: any[] = [];
  ejercicioAsignado: any = null;
  usuarioLogueado: any = null;
  pacienteId = '';

  private dietasService = inject(DietasService);
  private actividadService = inject(ActividadService);
  private weightService = inject(WeightService);

  constructor() { }

  ngOnInit() {
    this.establecerFecha();
    this.cargarDatosAsignados();
  }

  ngOnDestroy() {
    if (this.weightScrollTimer) {
      clearTimeout(this.weightScrollTimer);
    }
  }

  establecerFecha() {
    const opciones: any = { weekday: 'long', day: 'numeric' };
    this.fechaActual = new Date().toLocaleDateString('es-ES', opciones).toUpperCase() + ' (HOY)';
  }

  cargarDatosAsignados() {
    const session = localStorage.getItem('userProfile') || localStorage.getItem('user_session');
    
    if (session) {
      this.usuarioLogueado = JSON.parse(session);
      const pacienteId = this.usuarioLogueado.usuario_id || this.usuarioLogueado.usuario || this.usuarioLogueado.uid;
      this.pacienteId = pacienteId;

      // Obtener dietas de la API
      this.dietasService.getAsignaciones(pacienteId).subscribe({
        next: (asignaciones: any[]) => {
          this.dietasAsignadas = asignaciones.map((a: any) => ({
            ...a.dieta_id,
            nombre: a.dieta_id?.nombre_platillo,
            tipo: a.dieta_id?.categoria
          }));
        },
        error: (e: any) => console.error('Error cargando dietas del paciente', e)
      });

      // Obtener ejercicio de la API
      this.actividadService.getAsignaciones(pacienteId).subscribe({
        next: (asignaciones: any[]) => {
          if (asignaciones.length > 0) {
            const a = asignaciones[asignaciones.length - 1]; // Toma la más reciente
            this.ejercicioAsignado = {
              ...a.actividad_id,
              nombre: a.actividad_id?.nombre_ejercicio,
              duracion: a.actividad_id?.duracion_min + ' min',
              descripcion: a.actividad_id?.intensidad
            };
          } else {
            this.ejercicioAsignado = null;
          }
        },
        error: (e: any) => console.error('Error cargando actividad del paciente', e)
      });

      this.cargarPesoActual();
    }
  }

  cambiarSegmento(val: 'menu' | 'dieta' | 'ejercicio' | 'peso') {
    this.segmentoSeleccionado = val;

    if (val === 'peso') {
      this.fechaMedicion = this.obtenerFechaLocalActual();
      this.fechaMaxima = this.fechaMedicion;
      this.selectorFechaAbierto = false;
      this.mensajePeso = '';
      this.errorPeso = '';
      this.cargarPesoActual(true);
    }
  }

  cargarPesoActual(centrarRueda = false) {
    if (!this.pacienteId || this.pesoCargando) {
      if (centrarRueda) setTimeout(() => this.centrarPesoSeleccionado());
      return;
    }

    this.pesoCargando = true;
    this.weightService.getCurrentWeight(this.pacienteId).subscribe({
      next: ({ medicion }) => {
        this.pesoActual = medicion;
        this.pesoCargado = true;

        if (medicion) {
          const value = Number(medicion.valor_kg);
          this.pesoSeleccionado = Math.round(value * 2) / 2;
        } else {
          this.pesoSeleccionado = 70;
        }

        this.pesoCargando = false;
        if (centrarRueda || this.segmentoSeleccionado === 'peso') {
          setTimeout(() => this.centrarPesoSeleccionado());
        }
      },
      error: (error) => {
        console.error('Error cargando el peso actual', error);
        this.pesoActual = null;
        this.pesoCargado = true;
        this.pesoCargando = false;
        this.errorPeso = 'No fue posible consultar tu peso. Intenta nuevamente.';
        if (centrarRueda) setTimeout(() => this.centrarPesoSeleccionado());
      }
    });
  }

  guardarPeso() {
    if (!this.pacienteId || this.guardandoPeso) return;

    const measuredAt = new Date(this.fechaMedicion);
    if (Number.isNaN(measuredAt.getTime()) || measuredAt.getTime() > Date.now()) {
      this.errorPeso = 'Selecciona una fecha y hora válidas.';
      return;
    }

    this.guardandoPeso = true;
    this.errorPeso = '';
    this.mensajePeso = '';

    this.weightService.saveWeight(
      this.pacienteId,
      this.pesoSeleccionado,
      measuredAt.toISOString()
    ).subscribe({
      next: () => {
        this.guardandoPeso = false;
        this.mensajePeso = 'Tu peso se guardó correctamente.';
        this.selectorFechaAbierto = false;
        this.cargarPesoActual();
      },
      error: (error) => {
        console.error('Error guardando el peso', error);
        this.guardandoPeso = false;
        this.errorPeso = error.error?.message || 'No fue posible guardar el peso.';
      }
    });
  }

  alternarSelectorFecha() {
    this.fechaMaxima = this.obtenerFechaLocalActual();
    this.selectorFechaAbierto = !this.selectorFechaAbierto;
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(fecha));
  }

  alDesplazarPeso(event: Event) {
    const wheel = event.target as HTMLElement;

    if (this.weightScrollTimer) {
      clearTimeout(this.weightScrollTimer);
    }

    this.weightScrollTimer = setTimeout(() => {
      const itemHeight = 54;
      const index = Math.round(wheel.scrollTop / itemHeight);
      const value = this.opcionesPeso[index];

      if (value !== undefined) {
        this.pesoSeleccionado = value;
      }
    }, 80);
  }

  seleccionarPeso(peso: number) {
    this.pesoSeleccionado = peso;
    this.centrarPesoSeleccionado('smooth');
  }

  identificarPeso(_index: number, peso: number) {
    return peso;
  }

  private centrarPesoSeleccionado(behavior: ScrollBehavior = 'auto') {
    const wheel = this.weightWheel?.nativeElement;

    if (!wheel) {
      return;
    }

    const index = Math.round((this.pesoSeleccionado - 30) * 2);
    wheel.scrollTo({
      top: index * 54,
      behavior
    });
  }

  private obtenerFechaLocalActual(): string {
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  }
}
