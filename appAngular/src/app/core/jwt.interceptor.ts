import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SnackbarService } from './snackbar.service';
import { LoadingService } from './loading.service';
import { finalize } from 'rxjs/operators';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(SnackbarService);
  const loader = inject(LoadingService);
  const token = localStorage.getItem('token');
  if (token) req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  loader.show();
  return next(req).pipe(finalize(() => loader.hide()));
};
