import { Component, inject } from "@angular/core";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from "@ionic/angular/standalone";
import { AuthService } from "../../core/auth.service";
import { OrdersService } from "../../core/orders.service";
import { ToastService } from "../../core/toast.service";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";
@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    FormsModule,
  ],
  template: `<ion-header
      ><ion-toolbar color="light"
        ><ion-title>Login</ion-title></ion-toolbar
      ></ion-header
    ><ion-content class="ion-padding"
      ><ion-item
        ><ion-label position="stacked">Email</ion-label
        ><ion-input [(ngModel)]="email" type="email"></ion-input></ion-item
      ><ion-item
        ><ion-label position="stacked">Contraseña</ion-label
        ><ion-input [(ngModel)]="password" type="password"></ion-input
      ></ion-item>
      <div class="ion-padding">
        <ion-button expand="block" color="primary" (click)="login()"
          >Entrar</ion-button
        >
      </div>
      <div class="ion-text-center">
        <a routerLink="/register">Crear cuenta</a>
      </div></ion-content
    >`,
})
export class LoginPage {
  email = "";
  password = "";
  private auth = inject(AuthService);
  private orders = inject(OrdersService);
  private toast = inject(ToastService);
  private router = inject(Router);
  async login() {
    try {
      const res = await firstValueFrom(
        this.auth.login(this.email, this.password)
      );
      const token = (res as any)?.access_token;
      if (token) localStorage.setItem("access_token", token);
      await this.orders.runSync();
      await this.toast.show("Sesión iniciada", "success");
      this.router.navigate(["/dashboard"]);
    } catch (e) {
      this.toast.show("Credenciales inválidas", "danger");
    }
  }
}
