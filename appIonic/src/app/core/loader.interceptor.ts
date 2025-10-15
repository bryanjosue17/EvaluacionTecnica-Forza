import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  // Evita loader en health/ping o endpoints muy rápidos
  private readonly skip = [/\/health$/i, /\/ping$/i];

  constructor(private loader: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const omit = this.skip.some(rx => rx.test(req.url));

    if (!omit) this.loader.show();

    return next.handle(req).pipe(
      finalize(() => {
        if (!omit) this.loader.hide();
      })
    );
  }
}
