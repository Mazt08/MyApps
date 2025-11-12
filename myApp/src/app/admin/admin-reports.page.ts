import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './admin-reports.page.html',
  styleUrls: ['./admin-reports.page.scss'],
})
export class AdminReportsPage {
  totalRevenue = 0;
  totalOrders = 0;
  avgOrder = 0;
  byDay: { day: string; count: number; revenue: number }[] = [];

  constructor(private orders: OrderService) {
    this.orders.list$().subscribe((list) => {
      this.totalOrders = list.length;
      this.totalRevenue = list.reduce((s, o) => s + o.total, 0);
      this.avgOrder = this.totalOrders
        ? this.totalRevenue / this.totalOrders
        : 0;
      const map = new Map<string, { count: number; revenue: number }>();
      for (const o of list) {
        const day = new Date(o.createdAt).toISOString().slice(0, 10);
        const entry = map.get(day) || { count: 0, revenue: 0 };
        entry.count += 1;
        entry.revenue += o.total;
        map.set(day, entry);
      }
      this.byDay = Array.from(map.entries())
        .map(([day, v]) => ({ day, ...v }))
        .sort((a, b) => a.day.localeCompare(b.day));
    });
  }
}
