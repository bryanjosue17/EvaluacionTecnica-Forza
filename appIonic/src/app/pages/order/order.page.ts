import { Component, OnInit, inject } from "@angular/core";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/angular/standalone";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { CurrencyPipe, NgIf, NgFor } from "@angular/common";
@Component({
  selector: "app-order",
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    CurrencyPipe,
    NgIf,
    NgFor,
  ],
  template: `<ion-header
      ><ion-toolbar color="light"
        ><ion-title>Orden #{{ id }}</ion-title></ion-toolbar
      ></ion-header
    ><ion-content class="ion-padding"
      ><div *ngIf="!order">Cargando...</div>
      <div *ngIf="order">
        <p><strong>Status:</strong> {{ order.status }}</p>
        <p><strong>Total:</strong> {{ order.total | currency : "GTQ" }}</p>
        <ion-list
          ><ion-item *ngFor="let i of order.items"
            ><ion-label
              ><h2>Producto {{ i.productId }}</h2>
              <p>
                Qty {{ i.qty }} — {{ i.unitPrice | currency : "GTQ" }}
              </p></ion-label
            ></ion-item
          ></ion-list
        >
      </div></ion-content
    >`,
})
export class OrderPage implements OnInit {
  id!: number;
  order: any;
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get("id"));
    this.http
      .get<any>(`${environment.apiBase}/orders/${this.id}`)
      .subscribe((o) => {
        this.order = {
          status: o.status ?? o.Status,
          total: o.total ?? o.Total,
          items: o.items ?? o.Items,
        };
      });
  }
}
