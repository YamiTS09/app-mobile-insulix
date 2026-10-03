import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService, UserRole } from '../services/session.service';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);
  const user = sessionService.getValidUser();

  if (!user) {
    return router.createUrlTree(['/inicio-sesion']);
  }

  const allowedRoles = (route.data?.['roles'] ?? []) as UserRole[];
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return router.parseUrl(sessionService.getHomeRoute(user.role));
  }

  return true;
};

export const publicOnlyGuard: CanActivateFn = () => {
  const router = inject(Router);
  const sessionService = inject(SessionService);
  const user = sessionService.getValidUser();

  return user
    ? router.parseUrl(sessionService.getHomeRoute(user.role))
    : true;
};
