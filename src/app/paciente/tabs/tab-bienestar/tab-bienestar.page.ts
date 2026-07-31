import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DietasService } from '../../../services/dietas.service';
import { ActividadService } from '../../../services/actividad.service';

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
  readonly opcionesPeso = Array.from(
    { length: ((200 - 30) * 2) + 1 },
    (_, index) => 30 + (index * 0.5)
  );
  private weightScrollTimer?: ReturnType<typeof setTimeout>;
  
  // Variables para almacenar los datos asignados por el médico
  dietasAsignadas: any[] = [];
  ejercicioAsignado: any = null;
  usuarioLogueado: any = null;

  private dietasService = inject(DietasService);
  private actividadService = inject(ActividadService);

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
    }
  }

  cambiarSegmento(val: 'menu' | 'dieta' | 'ejercicio' | 'peso') {
    this.segmentoSeleccionado = val;

    if (val === 'peso') {
      setTimeout(() => this.centrarPesoSeleccionado());
    }
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
}
