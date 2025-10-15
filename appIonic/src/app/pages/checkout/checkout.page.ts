import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OrdersService, CartItemDto } from '../../core/orders.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonItem,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonButton,
    IonButtons,
    IonIcon,
    NgFor,
    NgIf,
    CurrencyPipe
  ],
  template: `<ion-header>
    <ion-toolbar color="light">
      <ion-buttons slot="start">
        <ion-button fill="clear" (click)="openMenu()">
          <ion-icon name="menu-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Finalizar Compra</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-card *ngIf="!loading; else loadingTemplate">
      <ion-card-header>
        <ion-card-title>Resumen del Pedido</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          <ion-item *ngFor="let item of items">
            <ion-label>
              <h3>{{ item.name }}</h3>
              <p>Cantidad: {{ item.qty }} x {{ item.unitPrice | currency:'GTQ' }}</p>
              <p><strong>Subtotal: {{ (item.qty * item.unitPrice) | currency:'GTQ' }}</strong></p>
            </ion-label>
          </ion-item>
        </ion-list>

        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <h3>Total:</h3>
            </ion-col>
            <ion-col size="6" class="ion-text-end">
              <h3>{{ total | currency:'GTQ' }}</h3>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    </ion-card>

    <ng-template #loadingTemplate>
      <div class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando resumen...</p>
      </div>
    </ng-template>

    <ion-card>
      <ion-card-header>
        <ion-card-title>Información de Pago</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <p>Para esta demo, el pago se simula.</p>
        <p>En un entorno real, aquí irían los campos de tarjeta de crédito, dirección de envío, etc.</p>
      </ion-card-content>
    </ion-card>

    <ion-button
      expand="block"
      color="success"
      (click)="pay()"
      [disabled]="busy || loading"
      size="large"
    >
      <ion-spinner *ngIf="busy" name="crescent" slot="start"></ion-spinner>
      {{ busy ? 'Procesando Pago...' : 'Confirmar y Pagar' }}
    </ion-button>
  </ion-content>
  `,
})
export class CheckoutPage implements OnInit {
  private orders = inject(OrdersService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private menu = inject(MenuController);

  items: CartItemDto[] = [];
  total = 0;
  loading = true;
  busy = false;

  constructor() {
    // Icons are registered globally in main.ts
  }

  ngOnInit() {
    if (!this.auth.isLogged()) {
      this.router.navigate(['/login']);
      return;
    }

    this.orders.getCart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.items = (c.items ?? []).map((x: any) => ({ ...x, itemId: x.itemId ?? x.Id }));
          this.total = c.total ?? this.items.reduce((a, it) => a + it.unitPrice * it.qty, 0);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.show('Error al cargar el carrito', 'danger');
        }
      });
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

  async pay() {
    if (this.busy || this.loading) return;
    this.busy = true;

    try {
      const res: any = await firstValueFrom(this.orders.checkoutFromCart());

      if (res?.orderId || res?.order?.header?.Id || res?.order?.id) {
        const id = res.orderId ?? res.order?.header?.Id ?? res.order?.id;
        await this.toast.show('¡Orden creada exitosamente!', 'success');
        this.router.navigate(['/order', id]);
      } else {
        await this.toast.show('Checkout encolado. Se sincronizará al reconectar.', 'warning');
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      await this.toast.show('Error al procesar el pago', 'danger');
    } finally {
      this.busy = false;
    }
  }
}
