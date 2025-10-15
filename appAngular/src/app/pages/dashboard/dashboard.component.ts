import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { OrdersService } from '../../core/orders.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  template: `
  <div class="card-grid">
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title><mat-icon>inventory_2</mat-icon> Productos</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <h2 style="margin:0">{{totalProducts ?? '—'}}</h2>
        <p>Total en catálogo</p>
      </mat-card-content>
      <mat-card-actions>
        <a mat-stroked-button color="primary" routerLink="/products">Ver catálogo</a>
      </mat-card-actions>
    </mat-card>

    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title><mat-icon>shopping_cart</mat-icon> Carrito</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <h2 style="margin:0">{{cartCount ?? 0}}</h2>
        <p>Ítems en tu carrito</p>
      </mat-card-content>
      <mat-card-actions>
        <a mat-stroked-button color="primary" routerLink="/cart" *ngIf="auth.isLogged()">Ir al carrito</a>
        <a mat-stroked-button color="accent" routerLink="/login" *ngIf="!auth.isLogged()">Inicia sesión</a>
      </mat-card-actions>
    </mat-card>

    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title><mat-icon>person</mat-icon> Perfil</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="auth.isLogged(); else anon">
          <div><strong>{{me?.email}}</strong></div>
          <small>Desde: {{me?.createdAt | date}}</small>
        </div>
        <ng-template #anon><p>Estás navegando como invitado.</p></ng-template>
      </mat-card-content>
      <mat-card-actions>
        <a mat-stroked-button color="accent" routerLink="/login" *ngIf="!auth.isLogged()">Login</a>
      </mat-card-actions>
    </mat-card>
  </div>
  `
})
export class DashboardComponent implements OnInit {
  totalProducts?: number;
  cartCount?: number;
  me?: {id:number,email:string,createdAt:string};

  constructor(private catalog: CatalogService, private orders: OrdersService, public auth: AuthService) {}

ngOnInit() {
  this.catalog.list(undefined, 1, 1).subscribe(r => this.totalProducts = r.total);

  if (this.auth.isLogged()) {
    this.orders.getCart().subscribe(cart => {
      this.cartCount = Array.isArray((cart as any).items) ? (cart as any).items.length : 0;
    });
    this.auth.me().subscribe(m => this.me = m);
  } else {
    this.cartCount = 0;
  }
}

}
