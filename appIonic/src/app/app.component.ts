import { Component, inject, AfterViewInit, OnInit } from '@angular/core';
import {
  IonApp, IonMenu, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonMenuToggle, IonRouterOutlet, IonIcon, IonButtons, IonButton
} from '@ionic/angular/standalone';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MenuController } from '@ionic/angular';
import { AuthService } from './core/auth.service';
import { BreadcrumbsComponent } from './components/breadcrumbs.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonApp, IonMenu, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonMenuToggle, IonRouterOutlet,
    IonIcon, IonButtons, IonButton, RouterLink, NgIf, BreadcrumbsComponent
  ],
  template: `
  <ion-app>
    <!-- Menú overlay, vinculado al outlet por contentId="main" -->
    <ion-menu id="main-menu" contentId="main" side="start" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Ecom</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <ion-menu-toggle auto-hide="false">
            <ion-item routerLink="/dashboard">
              <ion-icon slot="start" name="home-outline"></ion-icon>
              <ion-label>Dashboard</ion-label>
            </ion-item>

            <ion-item routerLink="/products">
              <ion-icon slot="start" name="pricetags-outline"></ion-icon>
              <ion-label>Productos</ion-label>
            </ion-item>

            <ion-item *ngIf="auth.isLogged()" routerLink="/cart">
              <ion-icon slot="start" name="cart-outline"></ion-icon>
              <ion-label>Carrito</ion-label>
            </ion-item>

            <ion-item *ngIf="!auth.isLogged()" routerLink="/login">
              <ion-icon slot="start" name="log-in-outline"></ion-icon>
              <ion-label>Login</ion-label>
            </ion-item>

            <ion-item *ngIf="!auth.isLogged()" routerLink="/register">
              <ion-icon slot="start" name="person-add-outline"></ion-icon>
              <ion-label>Registro</ion-label>
            </ion-item>

            <ion-item *ngIf="auth.isLogged()" (click)="logout()">
              <ion-icon slot="start" name="log-out-outline"></ion-icon>
              <ion-label>Salir</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Toolbar global superior -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button fill="clear" (click)="openMenu()">
            <ion-icon name="menu-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ currentPageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- Breadcrumbs -->
    <app-breadcrumbs></app-breadcrumbs>

    <!-- Contenido principal; el id DEBE coincidir con contentId del menú -->
    <ion-router-outlet id="main"></ion-router-outlet>
  </ion-app>
  `
})
export class AppComponent implements AfterViewInit, OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private menu = inject(MenuController);
  currentPageTitle = 'Ecom';

  constructor() {
    // Icons are registered globally in main.ts
  }

  ngOnInit() {
    // Actualizar el título según la ruta actual
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
  }

  async ngAfterViewInit() {
    // Esperar a que el web component <ion-menu> esté definido
    await customElements.whenDefined('ion-menu');

    // Ahora, Ionic lo registra correctamente
    await this.menu.enable(true, 'main-menu');

    // Logs de verificación
    const menus = await this.menu.getMenus();
    console.log('[Menu] registrados:', menus.map((m: any) => ({ id: m?.id })));
    console.log('[Menu] isEnabled(main-menu):', await this.menu.isEnabled('main-menu'));

    // Comprobar contentId vs outlet id
    const menuEl = document.querySelector('ion-menu#main-menu') as any;
    const outletEl = document.querySelector('#main') as any;
    console.log('[Menu] menu.contentId=', menuEl?.contentId, ' outlet.id=', outletEl?.id);
  }

  updatePageTitle(url: string) {
    if (url.includes('/products')) {
      this.currentPageTitle = 'Productos';
    } else if (url.includes('/cart')) {
      this.currentPageTitle = 'Mi Carrito';
    } else if (url.includes('/checkout')) {
      this.currentPageTitle = 'Finalizar Compra';
    } else if (url.includes('/dashboard')) {
      this.currentPageTitle = 'Dashboard';
    } else if (url.includes('/login')) {
      this.currentPageTitle = 'Iniciar Sesión';
    } else if (url.includes('/register')) {
      this.currentPageTitle = 'Registro';
    } else {
      this.currentPageTitle = 'Ecom';
    }
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

  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
