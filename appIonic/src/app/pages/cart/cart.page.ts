import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSpinner,
  IonAlert,
  AlertController,
  IonButtons,
} from '@ionic/angular/standalone';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { OrdersService, CartItemDto } from '../../core/orders.service';
import { AuthService } from '../../core/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonSpinner,
    IonAlert,
    IonButtons,
    NgFor,
    NgIf,
    CurrencyPipe,
    RouterLink
  ],
  template: `<ion-header>
    <ion-toolbar color="light">
      <ion-buttons slot="start">
        <ion-button fill="clear" (click)="openMenu()">
          <ion-icon name="menu-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Mi Carrito</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-grid *ngIf="items.length; else empty">
      <ion-row>
        <ion-col size="12" *ngFor="let i of items">
          <ion-card>
            <ion-card-content>
              <ion-grid>
                <ion-row>
                  <ion-col size="8">
                    <h3>{{ i.name ?? ('Producto ' + i.productId) }}</h3>
                    <p>Precio unitario: {{ i.unitPrice | currency:'GTQ' }}</p>
                    <p>Subtotal: {{ (i.unitPrice * i.qty) | currency:'GTQ' }}</p>
                  </ion-col>
                  <ion-col size="4" class="ion-text-end">
                    <div class="qty-controls">
                      <ion-button size="small" fill="outline" (click)="dec(i)" [disabled]="busy">
                        <ion-icon name="remove"></ion-icon>
                      </ion-button>
                      <span class="qty">{{ i.qty }}</span>
                      <ion-button size="small" fill="outline" (click)="inc(i)" [disabled]="busy">
                        <ion-icon name="add"></ion-icon>
                      </ion-button>
                    </div>
                    <ion-button color="danger" fill="clear" size="small" (click)="confirmRemove(i)" [disabled]="busy">
                      <ion-icon name="trash"></ion-icon>
                    </ion-button>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-grid>

    <ng-template #empty>
      <div class="empty-cart">
        <ion-icon name="basket" size="large" color="medium"></ion-icon>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega algunos productos para comenzar</p>
        <ion-button routerLink="/products" color="primary">
          Ver Productos
        </ion-button>
      </div>
    </ng-template>

    <div class="cart-footer" *ngIf="items.length">
      <ion-card>
        <ion-card-content>
          <h3>Total: {{ total | currency:'GTQ' }}</h3>
          <ion-button expand="block" color="warning" fill="outline" (click)="confirmClear()" [disabled]="busy">
            <ion-icon name="trash" slot="start"></ion-icon>
            Vaciar Carrito
          </ion-button>
          <ion-button expand="block" color="primary" routerLink="/checkout" [disabled]="busy">
            <ion-icon name="basket" slot="start"></ion-icon>
            Proceder al Pago
          </ion-button>
        </ion-card-content>
      </ion-card>
    </div>
  </ion-content>
  `,
  styles: [`
    .qty-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .qty {
      margin: 0 8px;
      font-weight: bold;
    }
    .empty-cart {
      text-align: center;
      padding: 40px 20px;
    }
    .empty-cart ion-icon {
      margin-bottom: 16px;
    }
    .cart-footer {
      margin-top: 20px;
    }
  `]
})
export class CartPage implements OnInit {
  items: CartItemDto[] = [];
  total = 0;
  busy = false;

  private orders = inject(OrdersService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private destroyRef = inject(DestroyRef);
  private menu = inject(MenuController);

  constructor() {
    // Icons are registered globally in main.ts
  }

  ngOnInit() {
    if (!this.auth.isLogged()) { 
      this.router.navigate(['/login']); 
      return; 
    }

    const load = () =>
      this.orders.getCart()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(c => {
          this.items = (c.items ?? []).map((x: any) => ({ ...x, itemId: x.itemId ?? x.Id }));
          this.total = c.total ?? this.items.reduce((a, it) => a + it.unitPrice * it.qty, 0);
        });

    load();

    this.orders.cartChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => load());
  }

  async openMenu() {
    try {
      await customElements.whenDefined('ion-menu');
      await this.menu.enable(true, 'main-menu');
      await this.menu.open('main-menu');
    } catch (e) {
      console.warn('openMenu() error', e);
    }
  }

  inc(i: CartItemDto) {
    this.updateQty(i, i.qty + 1);
  }

  dec(i: CartItemDto) {
    if (i.qty > 1) {
      this.updateQty(i, i.qty - 1);
    }
  }

  private updateQty(i: CartItemDto, qty: number) {
    this.busy = true;
    this.orders.updateQty(i.itemId, qty).subscribe({ 
      complete: () => this.busy = false,
      error: () => this.busy = false
    });
  }

  confirmRemove(i: CartItemDto) {
    this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Quieres eliminar ${i.name} del carrito?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.remove(i) }
      ]
    }).then(alert => alert.present());
  }

  private remove(i: CartItemDto) {
    this.busy = true;
    this.orders.removeFromCart(i.itemId).subscribe({ 
      complete: () => this.busy = false,
      error: () => this.busy = false
    });
  }

  confirmClear() {
    this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Quieres vaciar todo el carrito?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Vaciar', role: 'destructive', handler: () => this.clear() }
      ]
    }).then(alert => alert.present());
  }

  private clear() {
    this.busy = true;
    this.orders.clearCart().subscribe({ 
      complete: () => this.busy = false,
      error: () => this.busy = false
    });
  }
}
