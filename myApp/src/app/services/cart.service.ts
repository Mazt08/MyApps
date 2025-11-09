import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  name: string;
  qty: number;
}

const STORAGE_KEY = 'cart_items_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSub = new BehaviorSubject<CartItem[]>(this.read());
  readonly items$ = this.itemsSub.asObservable();

  private read(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return data.filter(
          (x) => x && typeof x.name === 'string' && typeof x.qty === 'number'
        );
      }
      return [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  getSnapshot(): CartItem[] {
    return this.itemsSub.getValue();
  }

  addItem(name: string, qty: number = 1) {
    const items = this.getSnapshot().slice();
    const idx = items.findIndex((i) => i.name === name);
    if (idx >= 0) items[idx].qty += qty;
    else items.push({ name, qty });
    this.itemsSub.next(items);
    this.persist(items);
  }

  removeOne(name: string) {
    const items = this.getSnapshot().slice();
    const idx = items.findIndex((i) => i.name === name);
    if (idx >= 0) {
      items[idx].qty -= 1;
      if (items[idx].qty <= 0) items.splice(idx, 1);
      this.itemsSub.next(items);
      this.persist(items);
    }
  }

  removeAll(name: string) {
    const items = this.getSnapshot().filter((i) => i.name !== name);
    this.itemsSub.next(items);
    this.persist(items);
  }

  clear() {
    this.itemsSub.next([]);
    this.persist([]);
  }
}
