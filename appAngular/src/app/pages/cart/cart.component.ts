// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { OrdersService, CartItemDto } from '../../core/orders.service';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf, MatButtonModule, RouterLink],
  template: `
    <h2>Carrito</h2>

    <ul>
      <li *ngFor="let i of items">
        {{ i.name ?? ('Producto ' + i.productId) }} — Qty: {{ i.qty }}
        <!-- usa itemId, NO productId -->
        <button mat-button color="warn" (click)="remove(i)">Quitar</button>
      </li>
    </ul>

    <a mat-raised-button color="primary" routerLink="/checkout" *ngIf="items.length > 0">
      Ir a pagar
    </a>
  `
})
export class CartComponent implements OnInit {
  items: CartItemDto[] = [];
  constructor(private orders: OrdersService) {}

  ngOnInit(){ this.refresh(); }

  refresh(){
    this.orders.getCart().subscribe(cart => {
      // cart puede ser { items: [...] } — normaliza a arreglo con itemId
      const items = (cart as any).items ?? cart;
      this.items = (items ?? []).map((x: any) => ({
        ...x,
        itemId: x.itemId ?? x.Id ?? x.id   // <- por si el backend devolviera Id
      }));
    });
  }

  remove(i: CartItemDto){
    if (!i?.itemId && i) {
      console.warn('CartItem sin itemId:', i);
      return;
    }
    this.orders.removeFromCart(i.itemId!).subscribe(() => this.refresh());
  }
}
