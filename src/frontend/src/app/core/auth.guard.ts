import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};

export function roleGuard(roles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();
    if (!user || !roles.includes(user.role)) {
      router.navigateByUrl('/marketplace');
      return false;
    }
    return true;
  };
}
