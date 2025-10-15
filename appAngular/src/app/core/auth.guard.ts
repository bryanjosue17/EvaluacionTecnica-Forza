import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snack = inject(SnackbarService);
  if (auth.isLogged()) return true;
  snack.info('Debes iniciar sesión');
  router.navigate(['/login']);
  return false;
};
