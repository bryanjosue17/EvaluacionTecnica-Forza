import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  constructor(private sb: MatSnackBar) {}
  ok(msg:string){ this.sb.open(msg, 'OK', { duration: 2500 }); }
  info(msg:string){ this.sb.open(msg, 'OK', { duration: 2500 }); }
  err(msg:string){ this.sb.open(msg, 'Cerrar', { duration: 4000 }); }
}
