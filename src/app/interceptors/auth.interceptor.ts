import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Si la petición es hacia /verify, dejamos pasar la petición tal como viene
  if (req.url.includes('/verify')) {
    return next(req);
  }

  // De lo contrario, inyectar el Custom JWT del backend almacenado
  const customToken = localStorage.getItem('access_token');
  if (customToken) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${customToken}` }
    });
    return next(cloned);
  }

  // Fallback al token de Firebase si no hay custom token
  const authService = inject(AuthService);
  return authService.getToken().pipe(
    take(1),
    switchMap(token => {
      if (token) {
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(cloned);
      }
      return next(req);
    })
  );
};