import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { DietasService } from '../../services/dietas.service';
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

  private dietasService = inject(DietasService);
  private actividadService = inject(ActividadService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController
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
      // Pedir dietas
      this.dietasService.getAsignaciones(id).subscribe({
        next: (asignaciones: any[]) => {
          this.paciente.dietasAsignadas = asignaciones.map((a: any) => ({
            ...a.dieta_id,
            nombre: a.dieta_id?.nombre_platillo,
            tipo: a.dieta_id?.categoria,
            asignacion_id: a._id
          }));
        },
        error: (e: any) => console.error('Error obteniendo dietas del paciente', e)
      });

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
    this.router.navigate(['/tabs-medico/tab-catalogo'], {
      queryParams: { 
        segmento: categoria,
        asignarAPaciente: this.paciente.usuario 
      }
    });
  }

  async quitarDieta(index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar dieta',
      message: '¿Estás seguro de quitar esta dieta del plan?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
             const dieta = this.paciente.dietasAsignadas[index];
             if (dieta.asignacion_id) {
                this.dietasService.deleteAsignacion(dieta.asignacion_id).subscribe({
                   next: () => this.paciente.dietasAsignadas.splice(index, 1),
                   error: (e: any) => console.error('Error al quitar dieta', e)
                });
             } else {
                this.paciente.dietasAsignadas.splice(index, 1);
             }
          }
        }
      ]
    });
    await alert.present();
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