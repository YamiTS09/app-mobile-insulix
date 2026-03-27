
import { inject, Injectable, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, getIdToken } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment'; // Importamos tu config

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private injector = inject(EnvironmentInjector);
  
  // Estado del usuario en tiempo real
  user$ = user(this.auth);

  /**
   * Registro de médico conectado a Firebase + API Docker
   */
  registerMedico(email: string, pass: string, datosMedico: any) {
    return runInInjectionContext(this.injector, () => {
      return from(createUserWithEmailAndPassword(this.auth, email, pass)).pipe(
        switchMap(result => {
          // Usamos la URL del environment (Asegúrate que sea tu IP local)
          const url = `${environment.apiUrl}/medico/signup`; 
          
          const payload = {
            uid: result.user.uid,
            email: email,
            ...datosMedico
          };

          return this.http.post(url, payload);
        })
      );
    });
  }

  /**
   * Login unificado
   */
  login(email: string, pass: string) {
    return from(signInWithEmailAndPassword(this.auth, email, pass)).pipe(
      // Opcional: Podrías hacer un GET al perfil del médico aquí
      tap(res => {
        console.log('Login exitoso en Firebase para móvil:', res.user.uid);
      })
    );
  }

  /**
   * Cerrar sesión y limpiar rastros
   */
  logout() {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        localStorage.removeItem('userProfile'); // Si decides guardar el perfil local
      })
    );
  }

  /**
   * Obtener Token para enviar en las cabeceras (Headers) de futuras peticiones
   */
  getToken(): Observable<string | null> {
    return this.user$.pipe(
      take(1),
      switchMap(async (user) => user ? await getIdToken(user) : null)
    );
  }
}