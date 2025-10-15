import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
import { OfflineService } from "./offline.service";
import { ToastService } from "./toast.service";
import { Subject, from, of, switchMap, tap, catchError, map } from "rxjs";
import { lastValueFrom } from "rxjs";

export interface CartItemDto {
  itemId: number;
  productId: number;
  name: string;
  unitPrice: number;
  qty: number;
  lineTotal?: number;
}
export interface CartDto {
  cartId: number | null;
  items: CartItemDto[];
  total: number;
}

@Injectable({ providedIn: "root" })
export class OrdersService {
  private http = inject(HttpClient);
  private offline = inject(OfflineService);
  private toast = inject(ToastService);
  private base = environment.apiBase;

  cartChanged$ = new Subject<void>();

  getCart() {
    return from(this.offline.isOnline()).pipe(
      switchMap((online) => {
        if (!online)
          return from(this.offline.getCachedCart()).pipe(
            map((c) => c ?? ({ cartId: null, items: [], total: 0 } as CartDto))
          );
        return this.http
          .get<CartDto>(`${this.base}/orders/cart`)
          .pipe(tap((cart) => this.offline.setCachedCart(cart)));
      }),
      catchError((err) => {
        this.toast.show("No se pudo obtener el carrito", "danger");
        return of({ cartId: null, items: [], total: 0 } as CartDto);
      })
    );
  }

  addToCart(payload: {
    productId: number;
    qty: number;
    unitPrice: number;
    name?: string;
  }) {
    return from(this.offline.isOnline()).pipe(
      switchMap((online) => {
        if (!online)
          return from(this.applyLocalAdd(payload)).pipe(
            tap(() => this.cartChanged$.next())
          );
        return this.http
          .post(`${this.base}/orders/cart/items`, payload)
          .pipe(tap(() => this.cartChanged$.next()));
      }),
      tap(() => this.toast.show("Producto agregado", "success")),
      catchError((err) => {
        this.toast.show("No se pudo agregar", "danger");
        return of(null);
      })
    );
  }

  updateQty(itemId: number, qty: number) {
    return from(this.offline.isOnline()).pipe(
      switchMap((online) => {
        if (!online)
          return from(this.applyLocalUpdate(itemId, qty)).pipe(
            tap(() => this.cartChanged$.next())
          );
        return this.http
          .put(`${this.base}/orders/cart/items/${itemId}`, { qty })
          .pipe(tap(() => this.cartChanged$.next()));
      }),
      catchError((err) => {
        this.toast.show("No se pudo actualizar cantidad", "danger");
        return of(null);
      })
    );
  }

  removeFromCart(itemId: number) {
    return from(this.offline.isOnline()).pipe(
      switchMap((online) => {
        if (!online)
          return from(this.applyLocalRemove(itemId)).pipe(
            tap(() => this.cartChanged$.next())
          );
        return this.http
          .delete(`${this.base}/orders/cart/items/${itemId}`)
          .pipe(tap(() => this.cartChanged$.next()));
      }),
      tap(() => this.toast.show("Ítem eliminado", "success")),
      catchError((err) => {
        this.toast.show("No se pudo eliminar", "danger");
        return of(null);
      })
    );
  }

  clearCart() {
    return from(this.offline.isOnline()).pipe(
      switchMap((online) => {
        if (!online)
          return from(this.applyLocalClear()).pipe(
            tap(() => this.cartChanged$.next())
          );
        return this.http
          .delete(`${this.base}/orders/cart`)
          .pipe(tap(() => this.cartChanged$.next()));
      }),
      tap(() => this.toast.show("Carrito vaciado", "success")),
      catchError((err) => {
        this.toast.show("No se pudo vaciar", "danger");
        return of(null);
      })
    );
  }

  checkoutFromCart() {
    return from(this.offline.isOnline()).pipe(
      switchMap((online) => {
        if (!online)
          return from(
            this.offline.enqueue(this.offline.buildItem("checkout", {}))
          ).pipe(tap(() => this.cartChanged$.next()));
        return this.http
          .post(`${this.base}/orders/checkout-from-cart`, {})
          .pipe(tap(() => this.cartChanged$.next()));
      }),
      tap(() => this.toast.show("Checkout iniciado", "success")),
      catchError((err) => {
        this.toast.show("No se pudo completar el checkout", "danger");
        return of(null);
      })
    );
  }

  private async applyLocalAdd(p: {
    productId: number;
    qty: number;
    unitPrice: number;
    name?: string;
  }) {
    const cart: CartDto = (await this.offline.getCachedCart()) ?? {
      cartId: null,
      items: [],
      total: 0,
    };
    const idx = cart.items.findIndex((x: any) => x.productId === p.productId);
    if (idx >= 0) cart.items[idx].qty += p.qty;
    else
      cart.items.push({
        itemId: Date.now(),
        productId: p.productId,
        name: p.name ?? "",
        unitPrice: p.unitPrice,
        qty: p.qty,
      });
    cart.total = cart.items.reduce(
      (a: any, it: any) => a + it.unitPrice * it.qty,
      0
    );
    await this.offline.setCachedCart(cart);
    await this.offline.enqueue(this.offline.buildItem("add", p));
    return cart;
  }
  private async applyLocalUpdate(itemId: number, qty: number) {
    const cart: CartDto = (await this.offline.getCachedCart()) ?? {
      cartId: null,
      items: [],
      total: 0,
    };
    const it = cart.items.find((x: any) => x.itemId === itemId);
    if (it) {
      it.qty = qty;
      cart.total = cart.items.reduce(
        (a: any, it: any) => a + it.unitPrice * it.qty,
        0
      );
    }
    await this.offline.setCachedCart(cart);
    await this.offline.enqueue(
      this.offline.buildItem("update", { itemId, qty })
    );
    return cart;
  }
  private async applyLocalRemove(itemId: number) {
    const cart: CartDto = (await this.offline.getCachedCart()) ?? {
      cartId: null,
      items: [],
      total: 0,
    };
    cart.items = cart.items.filter((x: any) => x.itemId !== itemId);
    cart.total = cart.items.reduce(
      (a: any, it: any) => a + it.unitPrice * it.qty,
      0
    );
    await this.offline.setCachedCart(cart);
    await this.offline.enqueue(this.offline.buildItem("remove", { itemId }));
    return cart;
  }
  private async applyLocalClear() {
    const cart: CartDto = { cartId: null, items: [], total: 0 };
    await this.offline.setCachedCart(cart);
    await this.offline.enqueue(this.offline.buildItem("clear", {}));
    return cart;
  }

  async runSync() {
    if (!(await this.offline.isOnline())) return;
    const queue = await this.offline.peekQueue();
    if (!queue.length) return;
    try {
      for (const item of queue) {
        if (item.kind === "add")
          await lastValueFrom(
            this.http.post(`${this.base}/orders/cart/items`, item.payload)
          );
        else if (item.kind === "update")
          await lastValueFrom(
            this.http.put(
              `${this.base}/orders/cart/items/${item.payload.itemId}`,
              { qty: item.payload.qty }
            )
          );
        else if (item.kind === "remove")
          await lastValueFrom(
            this.http.delete(
              `${this.base}/orders/cart/items/${item.payload.itemId}`
            )
          );
        else if (item.kind === "clear")
          await lastValueFrom(this.http.delete(`${this.base}/orders/cart`));
        else if (item.kind === "checkout")
          await lastValueFrom(
            this.http.post(`${this.base}/orders/checkout-from-cart`, {})
          );
      }
    } finally {
      await this.offline.dequeueAll();
      this.cartChanged$.next();
      try {
        const cart = await lastValueFrom(
          this.http.get<CartDto>(`${this.base}/orders/cart`)
        );
        await this.offline.setCachedCart(cart);
      } catch {}
    }
  }
}
