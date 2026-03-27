import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PerfilComponent implements OnInit {

  usuarioLogueado: any = null;
  editando: boolean = false;

  constructor(
    private toastCtrl: ToastController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.cargarPerfilCompleto();
  }

  cargarPerfilCompleto() {
    const session = localStorage.getItem('userProfile') || localStorage.getItem('user_session');
    if (session) {
      this.usuarioLogueado = JSON.parse(session);

      // Si tenemos UID y rol, obtenemos la información extra
      const role = this.usuarioLogueado?.role?.toUpperCase();
      if (this.usuarioLogueado?.uid && (role === 'MEDICO' || role === 'PACIENTE')) {
        const route = role === 'MEDICO' ? 'medico' : 'paciente';
        
        this.http.get(`${environment.apiUrl}/${route}/${this.usuarioLogueado.uid}`).subscribe({
          next: (datosCompletos: any) => {
            // Unir datos básicos del JWT con los datos extendidos (ej. especialidad, telefono)
            this.usuarioLogueado = { ...this.usuarioLogueado, ...datosCompletos };
            // Actualizar la sesión en local storage para que otras partes lo usen si lo necesitan
            localStorage.setItem('userProfile', JSON.stringify(this.usuarioLogueado));
          },
          error: (err) => console.error('Error cargando datos completos del perfil:', err)
        });
      }
    }
  }

  toggleEdicion() {
    this.editando = !this.editando;
  }

  async guardarCambios() {
    // 1. Actualizar la sesión actual
    localStorage.setItem('user_session', JSON.stringify(this.usuarioLogueado));

    // 2. Si es paciente, actualizarlo también en la lista global de pacientes del médico
    if (this.usuarioLogueado.role === 'paciente') {
      const pacientesLocales = localStorage.getItem('insulix_pacientes');
      if (pacientesLocales) {
        let pacientes = JSON.parse(pacientesLocales);
        const index = pacientes.findIndex((p: any) => p.usuario === this.usuarioLogueado.usuario);
        
        if (index !== -1) {
          pacientes[index] = { ...pacientes[index], ...this.usuarioLogueado };
          localStorage.setItem('insulix_pacientes', JSON.stringify(pacientes));
        }
      }
    }

    this.editando = false;
    
    const toast = await this.toastCtrl.create({
      message: 'Perfil actualizado correctamente',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}