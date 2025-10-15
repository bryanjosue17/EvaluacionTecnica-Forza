import { Component, OnInit, inject } from "@angular/core";
import { NgIf } from "@angular/common";
import { OfflineService } from "./offline.service";
import { IonItem, IonIcon, IonLabel } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { cloudOfflineOutline } from "ionicons/icons";
@Component({
  selector: "app-network-banner",
  standalone: true,
  imports: [NgIf, IonItem, IonIcon, IonLabel],
  template: `<ion-item *ngIf="!online" color="warning"
    ><ion-icon name="cloud-offline-outline" slot="start"></ion-icon
    ><ion-label
      >Estás sin conexión. Los cambios se sincronizarán al
      reconectar.</ion-label
    ></ion-item
  >`,
})
export class NetworkBannerComponent implements OnInit {
  online = true;
  private offline = inject(OfflineService);
  ngOnInit() {
    addIcons({ cloudOfflineOutline });
    this.offline.online$.subscribe((v) => (this.online = v));
  }
}
