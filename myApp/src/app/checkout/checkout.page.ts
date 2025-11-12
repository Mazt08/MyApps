import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class CheckoutPage {
  total = 0;
  shipping = 0;
  grand = 0;
  items: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cart: CartService,
    private orders: OrderService
  ) {
    const qp = this.route.snapshot.queryParamMap;
    this.total = Number(qp.get('total')) || 0;
    this.shipping = Number(qp.get('shipping')) || 0;
    this.grand = Number(qp.get('grand')) || this.total + this.shipping;
    const rawItems = qp.get('items');
    this.items = rawItems ? rawItems.split(',').filter((x) => !!x) : [];
  }

  placeOrder() {
    // Build order items (price unknown -> treat as 0 for now)
    const orderItems = this.items.map((name) => ({
      name,
      qty: 1,
      unitPrice: 0,
    }));
    const order = this.orders.create({
      items: orderItems,
      subtotal: this.total,
      shipping: this.shipping,
      total: this.grand,
    });
    this.cart.clear();
    this.router.navigate(['/order-success'], {
      queryParams: {
        orderId: order.id,
        total: order.total,
        items: order.items.length,
      },
    });
  }
}
