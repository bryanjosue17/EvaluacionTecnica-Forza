import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from './toast.service';
import { LoadingService } from './loading.service';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const loader = inject(LoadingService);
  return next(req).pipe(
    catchError(async (err: HttpErrorResponse) => {
      await loader.hide();
      let msg = 'Ha ocurrido un error';
      if (err.status === 0) msg = 'Sin conexión al servidor';
      else if (err.status === 401) msg = 'No autorizado';
      else if (err.status === 404) msg = 'No encontrado';
      else if (typeof err.error === 'string') msg = err.error;
      else if (err.error?.message) msg = err.error.message;
      await toast.show(msg, 'danger');
      throw err;
    })
  ) as any;
};
