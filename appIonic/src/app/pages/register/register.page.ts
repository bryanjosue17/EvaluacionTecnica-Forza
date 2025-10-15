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
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../core/auth.service";
import { ToastService } from "../../core/toast.service";
import { Router } from "@angular/router";
@Component({
  selector: "app-register",
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
        ><ion-title>Crear cuenta</ion-title></ion-toolbar
      ></ion-header
    ><ion-content class="ion-padding"
      ><ion-item
        ><ion-label position="stacked">Email</ion-label
        ><ion-input
          [(ngModel)]="email"
          type="email"
          autocomplete="email"
        ></ion-input></ion-item
      ><ion-item
        ><ion-label position="stacked">Contraseña</ion-label
        ><ion-input
          [(ngModel)]="password"
          type="password"
          autocomplete="new-password"
        ></ion-input
      ></ion-item>
      <div class="ion-padding">
        <ion-button expand="block" color="primary" (click)="register()"
          >Registrar</ion-button
        >
      </div></ion-content
    >`,
})
export class RegisterPage {
  email = "";
  password = "";
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  async register() {
    if (!this.email || !this.password) {
      this.toast.show("Completa email y contraseña", "warning");
      return;
    }
    try {
      await this.auth.register(this.email, this.password).toPromise();
      await this.toast.show("Cuenta creada. Ahora inicia sesión.", "success");
      this.router.navigate(["/login"]);
    } catch (err: any) {
      const status = err?.status;
      if (status === 409) this.toast.show("El email ya existe", "danger");
      else this.toast.show("No se pudo registrar", "danger");
    }
  }
}
