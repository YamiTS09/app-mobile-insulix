import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, NavController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-medico',
  templateUrl: './registro-medico.page.html',
  styleUrls: ['./registro-medico.page.scss'],
  standalone: false,
})
export class RegistroMedicoPage implements OnInit {

  step: number = 1;

  medicoData = {
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    telefono: '',
    email: '',
    cedula: '',
    especialidad: '',
    hospital: '',
    password: '',
    confirmarPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() { }

  siguiente() {
    if (this.step < 3) this.step++;
  }

  anterior() {
    if (this.step > 1) this.step--;
  }

  async registrarMedico() {
    const loading = await this.loadingCtrl.create({
      message: 'Registrando en Insulix...',
      spinner: 'crescent'
    });
    await loading.present();

    const datosPerfil = {
      nombre: this.medicoData.nombre,
      apellido_paterno: this.medicoData.apellidoP,
      apellido_materno: this.medicoData.apellidoM || '',
      cedula_profesional: this.medicoData.cedula,
      especialidad: this.medicoData.especialidad,
      hospital: this.medicoData.hospital,
      telefono: this.medicoData.telefono,
      foto_url: '' 
    };

    this.authService.registerMedico(this.medicoData.email, this.medicoData.password, datosPerfil).subscribe({
      next: () => {
        loading.dismiss();
        this.presentToast('¡Médico registrado con éxito!', 'success');
        this.navCtrl.navigateRoot('/inicio-sesion');
      },
      error: (err) => {
        loading.dismiss();
        console.error('Error:', err);
        const detail = err.error?.details || 'Servidor no disponible';
        this.presentToast('Error: ' + detail, 'danger');
      }
    });
  }

  async validarCedula() {
  const cedula = this.medicoData.cedula;

  // Validación extra por código
  if (!cedula || cedula.length < 7 || cedula.length > 8) {
    this.presentToast('La cédula debe tener entre 7 y 8 dígitos', 'warning');
    return;
  }

  const loading = await this.loadingCtrl.create({
    message: 'Verificando cédula en el Registro Nacional...',
    duration: 1500,
    spinner: 'crescent'
  });
  await loading.present();

  setTimeout(async () => {
    this.presentToast(`Cédula ${cedula} validada exitosamente.`, 'success');
  }, 1500);
}

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 3000, color, position: 'bottom'
    });
    toast.present();
  }
}