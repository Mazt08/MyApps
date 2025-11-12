import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Order, OrderService } from '../services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './admin-orders.page.html',
  styleUrls: ['./admin-orders.page.scss'],
})
export class AdminOrdersPage {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {
    this.orderService.list$().subscribe((list) => (this.orders = list));
  }

  updateStatus(order: Order, status: Order['status']) {
    this.orderService.updateStatus(order.id, status);
  }

  remove(order: Order) {
    this.orderService.remove(order.id);
  }
}
