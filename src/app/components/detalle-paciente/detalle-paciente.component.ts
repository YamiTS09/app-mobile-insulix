import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, NavController, AlertController } from '@ionic/angular'; // Añadimos AlertController
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-paciente',
  templateUrl: './detalle-paciente.component.html',
  styleUrls: ['./detalle-paciente.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DetallePacienteComponent implements OnInit {
  
  paciente: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController // Inyectamos para confirmar eliminación
  ) { }

  ngOnInit() {
    const usuarioId = this.route.snapshot.paramMap.get('id');
    if (usuarioId) {
      this.cargarDatosPaciente(usuarioId);
    }
  }

  cargarDatosPaciente(id: string) {
    const datosLocales = localStorage.getItem('insulix_pacientes');
    if (datosLocales) {
      const listaPacientes = JSON.parse(datosLocales);
      this.paciente = listaPacientes.find((p: any) => p.usuario === id);
      
      // Inicializar dietas como arreglo si no existe
      if (this.paciente && !Array.isArray(this.paciente.dietasAsignadas)) {
        this.paciente.dietasAsignadas = this.paciente.dietaAsignada ? [this.paciente.dietaAsignada] : [];
      }
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
            this.paciente.dietasAsignadas.splice(index, 1);
            this.actualizarLocalStorage();
          }
        }
      ]
    });
    await alert.present();
  }

  async quitarActividad() {
    this.paciente.ejercicioAsignado = null;
    this.actualizarLocalStorage();
  }

  actualizarLocalStorage() {
    const datosLocales = localStorage.getItem('insulix_pacientes');
    if (datosLocales) {
      let listaPacientes = JSON.parse(datosLocales);
      const index = listaPacientes.findIndex((p: any) => p.usuario === this.paciente.usuario);
      if (index !== -1) {
        listaPacientes[index] = this.paciente;
        localStorage.setItem('insulix_pacientes', JSON.stringify(listaPacientes));
      }
    }
  }
  
}