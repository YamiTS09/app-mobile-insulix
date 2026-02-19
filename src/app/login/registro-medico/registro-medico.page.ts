import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-registro-medico',
  templateUrl: './registro-medico.page.html',
  styleUrls: ['./registro-medico.page.scss'],
  standalone: false,
})
export class RegistroMedicoPage implements OnInit {

  step: number = 1;

  // Objeto para capturar los datos del formulario
  medicoData = {
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    telefono: '',
    email: '',
    cedula: '',
    usuario: '',
    password: '',
    confirmarPassword: ''
  };

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) { }

  ngOnInit() { }

  siguiente() {
    this.step++;
  }

  anterior() {
    this.step--;
  }

  async registrarMedico() {
    const { usuario, password, confirmarPassword, nombre } = this.medicoData;

    // 1. Validaciones básicas
    if (!usuario || !password || !nombre) {
      this.presentToast('Por favor, completa los campos principales', 'warning');
      return;
    }

    if (password !== confirmarPassword) {
      this.presentToast('Las contraseñas no coinciden', 'danger');
      return;
    }

    // 2. Obtener lista actual de médicos o crear una vacía
    const medicosRaw = localStorage.getItem('insulix_medicos');
    const medicos = medicosRaw ? JSON.parse(medicosRaw) : [];

    // 3. Verificar si el usuario ya existe
    const existe = medicos.find((m: any) => m.usuario === usuario);
    if (existe) {
      this.presentToast('El nombre de usuario ya está en uso', 'warning');
      return;
    }

    // 4. Guardar nuevo médico
    medicos.push(this.medicoData);
    localStorage.setItem('insulix_medicos', JSON.stringify(medicos));

    // 5. Éxito y Redirección
    await this.presentToast('Cuenta médica creada con éxito', 'success');
    this.navCtrl.navigateRoot('/inicio-sesion');
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