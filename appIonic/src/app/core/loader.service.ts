import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private active = 0;
  private loading?: HTMLIonLoadingElement;

  constructor(private lc: LoadingController) {}

  async show(message = 'Cargando...') {
    this.active++;
    if (!this.loading) {
      this.loading = await this.lc.create({
        message,
        backdropDismiss: false,
        cssClass: 'app-loader'
      });
      await this.loading.present();
    }
  }

  async hide() {
    if (this.active > 0) this.active--;
    if (this.active === 0 && this.loading) {
      try { await this.loading.dismiss(); } catch {}
      this.loading = undefined;
    }
  }

  async forceClose() {
    this.active = 0;
    if (this.loading) {
      try { await this.loading.dismiss(); } catch {}
      this.loading = undefined;
    }
  }
}
