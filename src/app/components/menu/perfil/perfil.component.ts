import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular'; // Añadimos ToastController
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante añadir FormsModule

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule], // Añadimos FormsModule
})
export class PerfilComponent implements OnInit {

  usuarioLogueado: any = null;
  editando: boolean = false; // Controla el estado de edición

  constructor(private toastCtrl: ToastController) { }

  ngOnInit() {
    const session = localStorage.getItem('user_session');
    if (session) {
      this.usuarioLogueado = JSON.parse(session);
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