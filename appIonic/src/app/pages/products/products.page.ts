import { Component, OnInit, inject } from "@angular/core";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonSpinner,
  IonButton,
  IonIcon,
  IonButtons,
} from "@ionic/angular/standalone";
import { RouterLink } from "@angular/router";
import { CatalogService } from "../../core/catalog.service";
import { OrdersService } from "../../core/orders.service";
import { CurrencyPipe, NgFor, NgIf } from "@angular/common";
import { MenuController } from "@ionic/angular";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonSpinner,
    IonButton,
    IonIcon,
    IonButtons,
    RouterLink,
    NgFor,
    NgIf,
    CurrencyPipe,
  ],
  template: `<ion-header>
    <ion-toolbar color="light">
      <ion-buttons slot="start">
        <ion-button fill="clear" (click)="openMenu()">
          <ion-icon name="menu-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Catálogo</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content
      ><ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-searchbar
        placeholder="Buscar productos..."
        (ionInput)="filterProducts($event)"
      ></ion-searchbar>
      <ion-grid *ngIf="!loading; else loadingTemplate">
        <ion-row>
          <ion-col size="12" size-md="6" size-lg="4" *ngFor="let p of filteredProducts">
            <ion-card>
              <ion-card-header>
                <ion-card-title>{{ p.name }}</ion-card-title>
                <ion-card-subtitle>{{ p.price | currency : "GTQ" }}</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p>{{ p.description }}</p>
                <ion-button
                  fill="outline"
                  expand="block"
                  [routerLink]="['/product', p.id ?? p.productId]"
                >
                  <ion-icon name="eye" slot="start"></ion-icon>
                  Ver Detalles
                </ion-button>
                <ion-button
                  color="success"
                  expand="block"
                  (click)="addToCart(p)"
                  [disabled]="adding[p.id ?? p.productId]"
                >
                  <ion-icon name="add" slot="start"></ion-icon>
                  {{ adding[p.id ?? p.productId] ? 'Agregando...' : 'Agregar al Carrito' }}
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ng-template #loadingTemplate>
        <div class="ion-text-center ion-padding">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando productos...</p>
        </div>
      </ng-template>
      <ion-infinite-scroll
        (ionInfinite)="loadMore($event)"
        *ngIf="hasMore"
      >
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content
    >`,
})
export class ProductsPage implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  loading = true;
  hasMore = false;
  currentPage = 1;
  searchTerm = '';
  adding: { [key: number]: boolean } = {};

  private catalog = inject(CatalogService);
  private orders = inject(OrdersService);
  private menu = inject(MenuController);

  constructor() {
    // Icons are registered globally in main.ts
  }

  ngOnInit() {
    this.loadProducts();
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

  loadProducts(page = 1, append = false) {
    this.loading = !append;
    this.catalog.list(page, 20).subscribe({
      next: (r) => {
        if (append) {
          this.products = [...this.products, ...r.items];
        } else {
          this.products = r.items;
        }
        this.filteredProducts = this.products;
        this.hasMore = r.items.length === 20;
        this.currentPage = page;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mostrar error
      }
    });
  }

  doRefresh(event: any) {
    this.currentPage = 1;
    this.loadProducts(1, false);
    event.target.complete();
  }

  loadMore(event: any) {
    this.loadProducts(this.currentPage + 1, true);
    event.target.complete();
  }

  filterProducts(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm) ||
      (p.description && p.description.toLowerCase().includes(this.searchTerm))
    );
  }

  addToCart(p: any) {
    const id = p.id ?? p.productId;
    this.adding[id] = true;
    this.orders
      .addToCart({
        productId: id,
        qty: 1,
        unitPrice: p.price,
        name: p.name,
      })
      .subscribe({
        next: () => {
          this.adding[id] = false;
        },
        error: () => {
          this.adding[id] = false;
        }
      });
  }
}
