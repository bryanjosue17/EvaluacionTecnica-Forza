import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonButtons, IonIcon
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CatalogService } from '../../core/catalog.service';
import { OrdersService } from '../../core/orders.service';
import { AuthService } from '../../core/auth.service';
import { NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import { menuOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonButtons, IonIcon, NgIf
  ],
  template: `
  <ion-header>
    <ion-toolbar color="light">
      <ion-buttons slot="start">
        <ion-button fill="clear" (click)="openMenu()">
          <ion-icon name="menu-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Dashboard</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-card>
      <ion-card-header><ion-card-title>Productos</ion-card-title></ion-card-header>
      <ion-card-content>
        <h2>{{ totalProducts ?? '—' }}</h2>
        <p>Total en catálogo</p>
        <ion-button (click)="go('/products')" fill="outline" color="primary">Ver catálogo</ion-button>
      </ion-card-content>
    </ion-card>

    <ion-card>
      <ion-card-header><ion-card-title>Carrito</ion-card-title></ion-card-header>
      <ion-card-content>
        <h2>{{ cartCount ?? 0 }}</h2>
        <p>Ítems en tu carrito</p>
        <ion-button *ngIf="auth.isLogged()" (click)="go('/cart')" fill="outline" color="primary">
          Ir al carrito
        </ion-button>
        <ion-button *ngIf="!auth.isLogged()" (click)="go('/login')" fill="outline" color="medium">
          Inicia sesión
        </ion-button>
      </ion-card-content>
    </ion-card>
  </ion-content>
  `
})
export class DashboardPage implements OnInit {
  totalProducts?: number;
  cartCount?: number;
  private destroyRef = inject(DestroyRef);
  private menu = inject(MenuController);
  private router = inject(Router);

  constructor(
    private catalog: CatalogService,
    private orders: OrdersService,
    public  auth: AuthService
  ) { addIcons({ menuOutline }); }

  ngOnInit() {
    this.catalog.list(1, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(r => this.totalProducts = r.total);

    if (this.auth.isLogged()) {
      const load = () =>
        this.orders.getCart()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(c => this.cartCount = c.items?.length ?? 0);
      load();
      this.orders.cartChanged$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => load());
    } else {
      this.cartCount = 0;
    }
  }

  async openMenu(){
    try {
      await customElements.whenDefined('ion-menu');    // aseguramos que está definido
      await this.menu.enable(true, 'main-menu');       // habilitamos por si acaso
      await this.menu.open('main-menu');               // abrimos
    } catch (e) {
      console.warn('openMenu() error', e);
    }
  }
  go(url: string){ this.router.navigateByUrl(url); }
}
