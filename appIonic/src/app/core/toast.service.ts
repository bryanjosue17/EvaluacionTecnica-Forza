import { Injectable, inject } from "@angular/core";
import { ToastController } from "@ionic/angular";
@Injectable({ providedIn: "root" })
export class ToastService {
  private toastCtrl = inject(ToastController);
  async show(
    message: string,
    color: "success" | "warning" | "danger" | "medium" = "medium",
    duration = 2500
  ) {
    const t = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: "bottom",
    });
    await t.present();
  }
}
