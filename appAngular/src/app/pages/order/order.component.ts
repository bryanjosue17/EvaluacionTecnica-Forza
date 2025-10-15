import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../core/orders.service';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe],
  template: `
  <div *ngIf="order">
    <h2>Orden #{{order.order.id}}</h2>
    <p>Total: {{order.order.total | currency:'GTQ'}}</p>
    <p>Status: {{order.order.status}}</p>
    <ul>
      <li *ngFor="let it of order.items">
        Prod {{it.productId}} — Qty {{it.qty}} — {{it.unitPrice | currency:'GTQ'}}
      </li>
    </ul>
  </div>
  `
})
export class OrderComponent implements OnInit {
  order:any;
  constructor(private route: ActivatedRoute, private orders: OrdersService) {}
  ngOnInit(){ const id = Number(this.route.snapshot.paramMap.get('id')); this.orders.getOrder(id).subscribe(o => this.order = o); }
}
