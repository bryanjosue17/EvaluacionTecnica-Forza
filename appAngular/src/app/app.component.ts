import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './core/auth.service';
import { LoadingService } from './core/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, NgIf,
    MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule,
    MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
<mat-sidenav-container style="height:100vh">
  <mat-sidenav mode="side" [opened]="true" style="width: 260px;">
    <div class="sidenav-header">
      <mat-icon>shopping_bag</mat-icon>
      <div>
        <div style="font-weight:600;">Ecom Dashboard</div>
      </div>
    </div>
    <mat-nav-list>
      <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
        <mat-icon matListItemIcon>space_dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>
      <a mat-list-item routerLink="/products" routerLinkActive="active">
        <mat-icon matListItemIcon>inventory_2</mat-icon>
        <span matListItemTitle>Productos</span>
      </a>
      <a mat-list-item routerLink="/cart" routerLinkActive="active" *ngIf="auth.isLogged()">
        <mat-icon matListItemIcon>shopping_cart</mat-icon>
        <span matListItemTitle>Carrito</span>
      </a>
      <a mat-list-item *ngIf="!auth.isLogged()" routerLink="/login" routerLinkActive="active">
        <mat-icon matListItemIcon>login</mat-icon>
        <span matListItemTitle>Login</span>
      </a>
      <a mat-list-item *ngIf="auth.isLogged()" (click)="logout()">
        <mat-icon matListItemIcon>logout</mat-icon>
        <span matListItemTitle>Logout</span>
      </a>
    </mat-nav-list>
  </mat-sidenav>

  <mat-sidenav-content>
    <mat-toolbar color="primary">
      <span class="toolbar-title">E-Commerce</span>
      <span style="flex:1 1 auto"></span>
      <a mat-button routerLink="/dashboard">Dashboard</a>
      <a mat-button routerLink="/products">Productos</a>
      <a mat-button routerLink="/cart" *ngIf="auth.isLogged()">Carrito</a>
      <a mat-button routerLink="/login" *ngIf="!auth.isLogged()">Login</a>
      <button mat-stroked-button color="accent" *ngIf="auth.isLogged()" (click)="logout()">Salir</button>
    </mat-toolbar>

    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  </mat-sidenav-content>
</mat-sidenav-container>

<div class="loading-backdrop" *ngIf="loading.isLoading()">
  <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
</div>
  `
})
export class AppComponent {
  drawer = signal(false);
  constructor(public auth: AuthService, public loading: LoadingService) {}
  logout(){ this.auth.logout(); }
}
