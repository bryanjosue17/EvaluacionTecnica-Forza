import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { OrdersService } from '../../core/orders.service';
import { NgIf, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgIf, CurrencyPipe, MatButtonModule, MatCardModule],
  template: `
  <div class="app-container" *ngIf="loading">Cargando producto...</div>

  <div class="app-container" *ngIf="error">{{error}}</div>

  <div class="app-container" *ngIf="!loading && !error && p">
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{p.name}}</mat-card-title>
        <mat-card-subtitle>{{p.price | currency:'GTQ'}}</mat-card-subtitle>
      </mat-card-header>
      <img mat-card-image *ngIf="p.imageUrl" [src]="p.imageUrl" alt="{{p.name}}">
      <mat-card-content>
        <p>{{p.description || 'Sin descripción'}}</p>
        <p *ngIf="stock!=null"><strong>Stock:</strong> {{stock}}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="add()" [disabled]="adding">Agregar al carrito</button>
      </mat-card-actions>
    </mat-card>
  </div>
  `
})
export class ProductDetailComponent implements OnInit {
  p: any; stock: number | null = null;
  loading = true; adding = false; error = '';

  constructor(
    private route: ActivatedRoute,
    private catalog: CatalogService,
    private orders: OrdersService
  ) {}

  ngOnInit(){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = 'Producto inválido'; this.loading = false; return; }

    this.catalog.get(id).subscribe({
      next: x => { this.p = x; this.loading = false; },
      error: _ => { this.error = 'No se encontró el producto'; this.loading = false; }
    });

    this.catalog.stock(id).subscribe({
      next: s => this.stock = s.stock,
      error: _ => this.stock = null
    });
  }
add() {
  if (!this.p) return;
  this.adding = true;

  this.orders.addToCart({
    productId: this.p.id,
    qty: 1,
    unitPrice: this.p.price,  // requerido por tu Program.cs
    name: this.p.name         // opcional, pero útil
  }).subscribe({
    next: _ => this.adding = false,
    error: _ => this.adding = false
  });
}

}
