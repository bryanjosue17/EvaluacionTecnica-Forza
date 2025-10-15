import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgIf, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
  <div style="display:flex; justify-content:center; padding:24px">
    <mat-card appearance="outlined" style="max-width:420px; width:100%;">
      <mat-card-header>
        <mat-card-title>Crear cuenta</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()" style="display:flex; flex-direction:column; gap:12px;">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="email" name="email" type="email" required>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [(ngModel)]="password" name="password" [type]="show?'text':'password'" required minlength="6">
            <button mat-icon-button matSuffix type="button" (click)="show=!show">
              <mat-icon>{{ show ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>
          <div *ngIf="error" style="color:#d32f2f; font-size:.9rem">{{ error }}</div>
          <button mat-raised-button color="primary" type="submit" [disabled]="loading">
            {{ loading ? 'Creando...' : 'Crear cuenta' }}
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  </div>
  `
})
export class RegisterComponent {
  email=''; password=''; show=false; loading=false; error='';
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit(){
    if(!this.email || !this.password) return;
    this.loading = true; this.error = '';
    this.auth.register(this.email, this.password).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/login']); },
      error: () => { this.loading = false; this.error = 'No se pudo registrar'; }
    });
  }
}
