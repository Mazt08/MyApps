import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {
  totalRevenue = 0;
  totalOrders = 0;
  productsCount = 0;
  usersCount = 0;

  constructor(
    private orders: OrderService,
    private products: ProductService,
    private users: UserService
  ) {
    this.orders.list$().subscribe((list) => {
      this.totalOrders = list.length;
      this.totalRevenue = list.reduce((sum, o) => sum + (o.total || 0), 0);
    });
    this.products
      .list$()
      .subscribe((list) => (this.productsCount = list.length));
    this.users.list$().subscribe((list) => (this.usersCount = list.length));
  }
}
