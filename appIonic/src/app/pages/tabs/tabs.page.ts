import { Component, inject } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { addIcons } from 'ionicons';
import { homeOutline, pricetagsOutline, cartOutline, logInOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet,
    NgIf
  ],
  template: `
  <ion-tabs>
    <ion-router-outlet></ion-router-outlet>

    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="dashboard" (click)="go('/tabs/dashboard')">
        <ion-icon name="home-outline"></ion-icon>
        <ion-label>Dashboard</ion-label>
      </ion-tab-button>

      <ion-tab-button tab="products" (click)="go('/tabs/products')">
        <ion-icon name="pricetags-outline"></ion-icon>
        <ion-label>Productos</ion-label>
      </ion-tab-button>

      <ion-tab-button *ngIf="auth.isLogged(); else loginTab"
                      tab="cart" (click)="go('/tabs/cart')">
        <ion-icon name="cart-outline"></ion-icon>
        <ion-label>Carrito</ion-label>
      </ion-tab-button>

      <ng-template #loginTab>
        <ion-tab-button tab="login" (click)="go('/login')">
          <ion-icon name="log-in-outline"></ion-icon>
          <ion-label>Login</ion-label>
        </ion-tab-button>
      </ng-template>
    </ion-tab-bar>
  </ion-tabs>
  `
})
export class TabsPage {
  auth = inject(AuthService);
  private router = inject(Router);

  constructor(){
    addIcons({ homeOutline, pricetagsOutline, cartOutline, logInOutline });
  }

  go(url: string){
    this.router.navigateByUrl(url);
  }
}
