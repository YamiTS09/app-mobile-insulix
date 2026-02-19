import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-inicio-sesion',
  templateUrl: 'inicio-sesion.page.html',
  styleUrls: ['inicio-sesion.page.scss'],
  standalone: false,
})
export class InicioSesionPage {

  loginData = {
    usuario: '',
    password: ''
  };

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  async login() {
    const { usuario, password } = this.loginData;

    if (!usuario || !password) {
      this.presentToast('Por favor, rellena todos los campos', 'warning');
      return;
    }

    // 1. Intentar buscar en Médicos (puedes crear una llave 'insulix_medicos' en el registro)
    const medicosRaw = localStorage.getItem('insulix_medicos');
    const medicos = medicosRaw ? JSON.parse(medicosRaw) : [];
    
    // 2. Intentar buscar en Pacientes (la que ya usamos)
    const pacientesRaw = localStorage.getItem('insulix_pacientes');
    const pacientes = pacientesRaw ? JSON.parse(pacientesRaw) : [];

    // BUSCAR COINCIDENCIA
    const medicoEncontrado = medicos.find((m: any) => m.usuario === usuario && m.password === password);
    const pacienteEncontrado = pacientes.find((p: any) => p.usuario === usuario && p.password === password);

    if (medicoEncontrado) {
      // Guardar sesión activa del médico
      localStorage.setItem('user_session', JSON.stringify({ ...medicoEncontrado, role: 'medico' }));
      this.navCtrl.navigateRoot('/tabs-medico/tab-pacientes'); // Redirigir a panel médico
    } 
    else if (pacienteEncontrado) {
      // Guardar sesión activa del paciente
      localStorage.setItem('user_session', JSON.stringify({ ...pacienteEncontrado, role: 'paciente' }));
      this.navCtrl.navigateRoot('/tabs-paciente/tab-monitoreo'); // Redirigir a panel paciente (debes crear esta ruta)
    } 
    else {
      this.presentToast('Usuario o contraseña incorrectos', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}