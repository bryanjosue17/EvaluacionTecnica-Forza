// src/app/core/orders.service.ts
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

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

export interface AddItemPayload {
  productId: number;
  qty: number;
  unitPrice: number;   // requerido por tu Program.cs
  name?: string | null;
}

export interface UpdateQtyPayload {
  qty: number;
}

@Injectable({ providedIn: "root" })
export class OrdersService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/orders`; // ← apunta al GATEWAY

  /** Obtiene el carrito completo { cartId, items[], total } */
  getCart(): Observable<CartDto> {
    return this.http.get<CartDto>(`${this.base}/cart`);
  }

  /** Atajo: devuelve sólo el arreglo de items */
  getCartItems(): Observable<CartItemDto[]> {
    return this.getCart().pipe(map(c => c?.items ?? []));
  }

  /** Agregar/mergear item en carrito (el backend requiere unitPrice y opcional name) */
  addToCart(payload: AddItemPayload): Observable<{ cartId: number }> {
    return this.http.post<{ cartId: number }>(`${this.base}/cart/items`, payload);
  }

  /** Actualizar cantidad: PUT /orders/cart/items/{itemId} */
  updateQty(itemId: number, qty: number) {
    const body: UpdateQtyPayload = { qty };
    return this.http.put(`${this.base}/cart/items/${itemId}`, body);
  }

  /** Eliminar por itemId: DELETE /orders/cart/items/{itemId} */
  removeFromCart(itemId: number) {
    return this.http.delete(`${this.base}/cart/items/${itemId}`);
  }

  /** Vaciar carrito: DELETE /orders/cart */
  clearCart() {
    return this.http.delete(`${this.base}/cart`);
  }

  /**
   * Checkout real del backend:
   * POST /orders/checkout-from-cart
   * (El userId lo toma del JWT; no envíes body si no hace falta)
   */
  checkoutFromCart(): Observable<{ ok: boolean; order: any }> {
    return this.http.post<{ ok: boolean; order: any }>(`${this.base}/checkout-from-cart`, {});
  }

  /** Obtener una orden ya creada */
  getOrder(orderId: number) {
    return this.http.get<any>(`${this.base}/${orderId}`);
  }
}
