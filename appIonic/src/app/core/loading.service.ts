import { Injectable, inject } from "@angular/core";
import { LoadingController } from "@ionic/angular";
@Injectable({ providedIn: "root" })
export class LoadingService {
  private lc = inject(LoadingController);
  private count = 0;
  private loading?: HTMLIonLoadingElement;
  async show(message = "Procesando...") {
    this.count++;
    if (this.loading) return;
    this.loading = await this.lc.create({ message, spinner: "crescent" });
    await this.loading.present();
  }
  async hide() {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0 && this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
    }
  }
}
