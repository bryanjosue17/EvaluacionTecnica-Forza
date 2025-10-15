import { Component, OnInit } from '@angular/core';
import { CatalogService, Product } from '../../core/catalog.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    NgFor, NgIf, FormsModule, RouterLink, CurrencyPipe,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatCardModule
  ],
  template: `
  <div style="display:flex; gap:12px; align-items:center; margin-bottom:16px;">
    <mat-form-field appearance="outline" style="flex:1;">
      <mat-label>Buscar productos</mat-label>
      <input matInput [(ngModel)]="q" (keyup.enter)="load()">
      <button mat-icon-button matSuffix (click)="load()" aria-label="Buscar"><mat-icon>search</mat-icon></button>
    </mat-form-field>
    <button mat-stroked-button (click)="load()">Buscar</button>
  </div>

  <div class="card-grid">
    <mat-card appearance="outlined" *ngFor="let p of items">
      <mat-card-header>
        <mat-card-title>{{p.name}}</mat-card-title>
        <mat-card-subtitle>{{p.price | currency:'GTQ'}}</mat-card-subtitle>
      </mat-card-header>
      <img mat-card-image *ngIf="p.imageUrl" [src]="p.imageUrl" alt="{{p.name}}">
      <mat-card-content><p>{{p.description || 'Sin descripción'}}</p></mat-card-content>
      <mat-card-actions><a mat-button color="primary" [routerLink]="['/products', p.id]">Ver detalle</a></mat-card-actions>
    </mat-card>
  </div>

  <div style="display:flex; gap:12px; align-items:center; justify-content:center; margin-top:16px;">
    <button mat-stroked-button (click)="prev()" [disabled]="page<=1">Anterior</button>
    <span>Página {{page}}</span>
    <button mat-stroked-button (click)="next()" [disabled]="page*size >= total">Siguiente</button>
  </div>
  `
})
export class ProductsComponent implements OnInit {
  items: Product[] = []; total=0; page=1; size=12; q='';
  constructor(private catalog: CatalogService) {}
  ngOnInit(){ this.load(); }
  load(){ this.catalog.list(this.q, this.page, this.size).subscribe(r=>{ this.items=r.items; this.total=r.total; }); }
  prev(){ this.page--; this.load(); }
  next(){ this.page++; this.load(); }
}
