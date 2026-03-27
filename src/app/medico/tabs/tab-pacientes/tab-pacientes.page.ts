import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { AgregarPacienteComponent } from '../../modals/agregar-paciente/agregar-paciente.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
  usuarioLogueado: any;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertController: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    const session = localStorage.getItem('userProfile');
    if (session) {
      this.usuarioLogueado = JSON.parse(session);
    }
    this.cargarPacientes();
  }

  cargarPacientes() {
    if (!this.usuarioLogueado || !this.usuarioLogueado.uid) return;
    
    this.http.get(`${environment.apiUrl}/paciente?medico_id=${this.usuarioLogueado.uid}`).subscribe({
      next: (res: any) => {
        this.pacientes = res.map((p: any) => {
          const g = Number(p.glucosa_base);
          let estadoCalculado = 'normal';
          if (g > 180) estadoCalculado = 'alto';
          else if (g < 70) estadoCalculado = 'bajo';
          
          p.estado = estadoCalculado;
          // Asseguramos la compatibilidad del routerLink anterior
          p.usuario = p.paciente_id;
          p.glucosa = p.glucosa_base;
          return p;
        });
        localStorage.setItem('insulix_pacientes', JSON.stringify(this.pacientes));
      },
      error: (err) => console.error('Error cargando pacientes:', err)
    });
  }

  async openAddPatientModal(pacienteParaEditar?: any) {
    const modal = await this.modalCtrl.create({
      component: AgregarPacienteComponent,
      cssClass: 'add-patient-modal',
      componentProps: {
        itemAEditar: pacienteParaEditar 
      }
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

      if (pacienteParaEditar) {
        // LÓGICA DE EDICIÓN: PUT Request
        this.http.put(`${environment.apiUrl}/paciente/${pacienteParaEditar.paciente_id}`, data).subscribe({
          next: () => {
            loading.dismiss();
            this.mostrarMensaje('Paciente actualizado con éxito');
            this.cargarPacientes();
          },
          error: (err) => {
            loading.dismiss();
            this.mostrarMensaje('Error al actualizar paciente', 'danger');
          }
        });
      } else {
        // LÓGICA DE CREACIÓN: POST Request
        const payload = {
          ...data,
          medico_id: this.usuarioLogueado.uid
        };
        this.http.post(`${environment.apiUrl}/paciente`, payload).subscribe({
          next: () => {
            loading.dismiss();
            this.mostrarMensaje('Paciente agregado a tu lista');
            this.cargarPacientes();
          },
          error: (err) => {
            loading.dismiss();
            this.mostrarMensaje('Error al guardar el paciente', 'danger');
          }
        });
      }
    }
  }

  async mostrarMensaje(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    toast.present();
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
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      cssClass: 'light-alert',
      message: `¿Estás seguro de que deseas eliminar este registro? `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.http.delete(`${environment.apiUrl}/paciente/${paciente.paciente_id}`).subscribe({
              next: () => {
                this.mostrarMensaje('Paciente eliminado con éxito');
                this.cargarPacientes();
              },
              error: (err) => this.mostrarMensaje('Error al eliminar paciente', 'danger')
            });
          }
        }
      ]
    });

    await alert.present();
  }
}