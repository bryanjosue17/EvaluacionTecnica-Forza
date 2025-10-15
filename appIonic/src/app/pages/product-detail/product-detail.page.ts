import { Component, OnInit, inject } from "@angular/core";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from "@ionic/angular/standalone";
import { ActivatedRoute } from "@angular/router";
import { CatalogService } from "../../core/catalog.service";
import { OrdersService } from "../../core/orders.service";
import { CurrencyPipe, NgIf } from "@angular/common";
@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    CurrencyPipe,
    NgIf,
  ],
  template: `<ion-header
      ><ion-toolbar color="light"
        ><ion-title>Detalle</ion-title></ion-toolbar
      ></ion-header
    ><ion-content class="ion-padding"
      ><ion-card *ngIf="p"
        ><ion-card-header
          ><ion-card-title>{{ p.name }}</ion-card-title></ion-card-header
        ><ion-card-content
          ><p><strong>Precio:</strong> {{ p.price | currency : "GTQ" }}</p>
          <p *ngIf="stock != null">
            <strong>Stock:</strong> {{ stock }}
          </p></ion-card-content
        >
        <div class="ion-padding">
          <ion-button color="primary" (click)="add()"
            >Agregar al carrito</ion-button
          >
        </div></ion-card
      ></ion-content
    >`,
})
export class ProductDetailPage implements OnInit {
  p: any;
  stock: number | null = null;
  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);
  private orders = inject(OrdersService);
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.catalog.get(id).subscribe((prod) => (this.p = prod));
    this.catalog.stock(id).subscribe((s) => (this.stock = s?.stock ?? null));
  }
  add() {
    if (!this.p) return;
    this.orders
      .addToCart({
        productId: this.p.id ?? this.p.productId,
        qty: 1,
        unitPrice: this.p.price,
        name: this.p.name,
      })
      .subscribe();
  }
}
