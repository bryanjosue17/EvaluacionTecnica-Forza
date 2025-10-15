import { Component } from '@angular/core';
import { OrdersService } from '../../core/orders.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <h2>Checkout</h2>
    <button mat-raised-button color="primary" (click)="pay()">Pagar</button>
  `
})
export class CheckoutComponent {
  constructor(private orders: OrdersService, private router: Router) {}

  // Usa el método que tengas definido en tu servicio actualmente:
  // - Si tu servicio expone checkoutFromCart(): usa este bloque.
  pay() {
    this.orders.checkoutFromCart()
      .subscribe((res: { ok: boolean; order: { Id: number } }) => {
        this.router.navigate(['/order', res.order.Id]);
      });
  }

}
