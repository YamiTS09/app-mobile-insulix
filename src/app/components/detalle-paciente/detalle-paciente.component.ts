import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { ActividadService } from '../../services/actividad.service';

@Component({
  selector: 'app-detalle-paciente',
  templateUrl: './detalle-paciente.component.html',
  styleUrls: ['./detalle-paciente.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DetallePacienteComponent implements OnInit {
  
  paciente: any = null;

  private actividadService = inject(ActividadService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const usuarioId = this.route.snapshot.paramMap.get('id');
    if (usuarioId) {
      this.cargarDatosPaciente(usuarioId);
    }
  }

  // Cargar datos del paciente y sus asignaciones de la API
  cargarDatosPaciente(id: string) {
    const datosLocales = localStorage.getItem('insulix_pacientes');
    if (datosLocales) {
      const listaPacientes = JSON.parse(datosLocales);
      this.paciente = listaPacientes.find((p: any) => p.usuario === id);
    }
    
    if (this.paciente) {
      // Pedir actividades
      this.actividadService.getAsignaciones(id).subscribe({
        next: (asignaciones: any[]) => {
          if (asignaciones.length > 0) {
            const a = asignaciones[asignaciones.length - 1]; // Toma la más reciente
            this.paciente.ejercicioAsignado = {
              ...a.actividad_id,
              nombre: a.actividad_id?.nombre_ejercicio,
              duracion: a.actividad_id?.duracion_min + ' min',
              descripcion: a.actividad_id?.intensidad,
              asignacion_id: a._id
            };
          } else {
            this.paciente.ejercicioAsignado = null;
          }
        },
        error: (e: any) => console.error('Error obteniendo actividades del paciente', e)
      });
    }
  }

  irAlCatalogo(categoria: 'dieta' | 'ejercicio') {
    if (categoria === 'dieta') {
      this.router.navigate(['/plan-alimenticio', this.paciente.usuario]);
      return;
    }
    this.router.navigate(['/tabs-medico/tab-catalogo'], {
      queryParams: { 
        segmento: categoria,
        asignarAPaciente: this.paciente.usuario 
      }
    });
  }

  async quitarActividad() {
    if (this.paciente.ejercicioAsignado && this.paciente.ejercicioAsignado.asignacion_id) {
       this.actividadService.deleteAsignacion(this.paciente.ejercicioAsignado.asignacion_id).subscribe({
          next: () => this.paciente.ejercicioAsignado = null,
          error: (e: any) => console.error('Error al quitar actividad', e)
       });
    } else {
       this.paciente.ejercicioAsignado = null;
    }
  }
  
}
