import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OrderItem {
  productId?: string; // optional if product was custom
  name: string;
  qty: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'placed'
  | 'paid'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string; // order id
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
}

const STORAGE_KEY = 'orders_v1';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private orders$ = new BehaviorSubject<Order[]>([]);

  constructor() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        this.orders$.next(JSON.parse(existing));
      } catch {
        this.orders$.next([]);
      }
    }
  }

  list$() {
    return this.orders$.asObservable();
  }
  getAll(): Order[] {
    return this.orders$.getValue();
  }

  private persist(orders: Order[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    this.orders$.next(orders);
  }

  create(
    input: Omit<Order, 'id' | 'createdAt' | 'status'> & { status?: OrderStatus }
  ): Order {
    const order: Order = {
      ...input,
      id: this.generateOrderId(),
      createdAt: Date.now(),
      status: input.status ?? 'placed',
    };
    const orders = [order, ...this.getAll()];
    this.persist(orders);
    return order;
  }

  updateStatus(id: string, status: OrderStatus) {
    const orders = this.getAll().map((o) =>
      o.id === id ? { ...o, status } : o
    );
    this.persist(orders);
  }

  remove(id: string) {
    const orders = this.getAll().filter((o) => o.id !== id);
    this.persist(orders);
  }

  clearAll() {
    this.persist([]);
  }

  private generateOrderId(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `ORD-${datePart}-${rand}`;
  }
}
