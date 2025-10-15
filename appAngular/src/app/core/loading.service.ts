import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = 0;
  isLoading = signal(false);
  show(){ this.counter++; this.isLoading.set(true); }
  hide(){ this.counter = Math.max(0, this.counter-1); if (this.counter===0) this.isLoading.set(false); }
}
