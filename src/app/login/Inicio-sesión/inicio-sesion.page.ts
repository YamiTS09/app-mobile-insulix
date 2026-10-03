import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { switchMap } from 'rxjs';
import { SessionService } from '../../services/session.service';
@Component({
  selector: 'app-inicio-sesion',
  templateUrl: 'inicio-sesion.page.html',
  styleUrls: ['inicio-sesion.page.scss'],
  standalone: false,
})
export class InicioSesionPage {
  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private sessionService: SessionService
  ) {}

  async login() {
    // Aunque el botón esté deshabilitado, es buena práctica re-confirmar
    if (!this.loginData.email || !this.loginData.password) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Accediendo a Insulix...',
      spinner: 'crescent',
      cssClass: 'white-custom-loading'
    });
    await loading.present();

    this.authService.login(this.loginData.email, this.loginData.password).pipe(
      switchMap((res: any) => {
        return this.authService.getToken(); 
      }),
      switchMap((firebaseToken) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${firebaseToken}`
        });
        return this.http.get(`${environment.authUrl}/verify`, { headers });
      })
    ).subscribe({
      next: (response: any) => {
        loading.dismiss();

        if (response.valid && response.access_token) {
          const user = this.sessionService.saveSession(response.access_token, response.user);

          if (!user) {
            this.presentToast('La sesión recibida no tiene un rol válido', 'danger');
            return;
          }

          this.navCtrl.navigateRoot(this.sessionService.getHomeRoute(user.role));
        } else {
          this.presentToast('No se pudo validar al usuario', 'danger');
        }
      },
      error: (err) => {
        loading.dismiss();
        console.error('Error:', err);
        // Manejo de errores específicos de Firebase
        let mensaje = 'Correo o contraseña incorrectos';
        if (err.code === 'auth/network-request-failed') mensaje = 'Error de conexión con el servidor';
        
        this.presentToast(mensaje, 'danger');
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
