import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

type QueueItem = { id: string; ts: number; kind: 'add'|'update'|'remove'|'clear'|'checkout'; payload: any };

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private _online$ = new BehaviorSubject<boolean>(true);
  online$ = this._online$.asObservable();

  private ready!: Promise<void>;              // <- Promise<void>
  readonly CART_CACHE_KEY = 'cart.cache';
  readonly QUEUE_KEY = 'cart.queue';

  constructor(private storage: Storage) {
    // Antes: this.ready = this.storage.create();  // <- devuelve Promise<Storage>
    this.ready = (async () => {                   // <- normalizamos a void
      await this.storage.create();
    })();

    Network.addListener('networkStatusChange', s => this._online$.next(s.connected));
    Network.getStatus().then(s => this._online$.next(s.connected));
  }

  async isOnline() { return (await Network.getStatus()).connected; }

  async getCachedCart(): Promise<any|null> { await this.ready; return await this.storage.get(this.CART_CACHE_KEY); }
  async setCachedCart(cart:any){ await this.ready; await this.storage.set(this.CART_CACHE_KEY, cart); }

  async enqueue(item: QueueItem){ await this.ready; const q:(QueueItem[])=(await this.storage.get(this.QUEUE_KEY))??[]; q.push(item); await this.storage.set(this.QUEUE_KEY, q); }
  async dequeueAll(): Promise<QueueItem[]>{ await this.ready; const q:(QueueItem[])=(await this.storage.get(this.QUEUE_KEY))??[]; await this.storage.set(this.QUEUE_KEY, []); return q; }
  async peekQueue(): Promise<QueueItem[]>{ await this.ready; return (await this.storage.get(this.QUEUE_KEY))??[]; }

  buildItem(kind: QueueItem['kind'], payload:any): QueueItem {
    return { id: crypto.randomUUID(), ts: Date.now(), kind, payload };
  }
}
