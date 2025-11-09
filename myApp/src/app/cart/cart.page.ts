import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFooter,
  IonCheckbox,
  IonThumbnail,
  IonImg,
} from '@ionic/angular/standalone';
import { CartService, CartItem } from '../services/cart.service';
import { UserProfileService } from '../services/user-profile.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFooter,
    IonCheckbox,
    IonThumbnail,
    IonImg,
  ],
})
export class CartPage implements OnInit, OnDestroy {
  items: CartItem[] = [];
  private selected = new Set<string>();
  // Price map for display; could move to a dedicated product service later
  private readonly priceMap: Record<string, number> = {
    'Amouré Elegance': 899,
    'Amouré Bloom': 799,
    'Amouré Noir': 999,
    'Amouré Nuit': 1099,
    'Amouré Velvet': 1199,
    'Amouré Fleur': 899,
  };
  private readonly imageMap: Record<string, string> = {
    'Amouré Elegance': 'assets/icon/1.jpg',
    'Amouré Bloom': 'assets/icon/2.jpg',
    'Amouré Noir': 'assets/icon/3.jpg',
    'Amouré Nuit': 'assets/icon/4.jpg',
    'Amouré Velvet': 'assets/icon/5.jpg',
    'Amouré Fleur': 'assets/icon/6.jpg',
  };
  private sub?: import('rxjs').Subscription;

  constructor(
    private cart: CartService,
    private userProfile: UserProfileService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.sub = this.cart.items$.subscribe((it) => (this.items = it));
    // Auto-select all current items on load
    this.toggleAll(true);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isEmpty() {
    return this.items.length === 0;
  }

  // Selection helpers (Shopee-like)
  isSelected(name: string): boolean {
    return this.selected.has(name);
  }

  get allSelected(): boolean {
    return (
      this.items.length > 0 &&
      this.items.every((i) => this.selected.has(i.name))
    );
  }

  toggleAll(checked: boolean) {
    if (checked) {
      this.items.forEach((i) => this.selected.add(i.name));
    } else {
      this.selected.clear();
    }
  }

  toggleOne(name: string, checked: boolean) {
    if (checked) this.selected.add(name);
    else this.selected.delete(name);
  }

  priceOf(name: string): number {
    return this.priceMap[name] ?? 0;
  }

  lineTotal(item: CartItem): number {
    return this.priceOf(item.name) * item.qty;
  }

  grandTotal(): number {
    return this.items.reduce((sum, it) => sum + this.lineTotal(it), 0);
  }

  selectedTotal(): number {
    return this.items
      .filter((i) => this.selected.has(i.name))
      .reduce((sum, it) => sum + this.lineTotal(it), 0);
  }

  // Simple flat shipping estimate (could be dynamic later)
  shippingEstimate(): number {
    const count = this.items.filter((i) => this.selected.has(i.name)).length;
    if (!count) return 0;
    // e.g., base 50 + 10 per additional item
    return 50 + Math.max(0, count - 1) * 10;
  }

  totalWithShipping(): number {
    return this.selectedTotal() + this.shippingEstimate();
  }

  inc(name: string) {
    this.cart.addItem(name, 1);
  }
  dec(name: string) {
    this.cart.removeOne(name);
  }
  remove(name: string) {
    this.cart.removeAll(name);
    this.selected.delete(name);
  }
  clear() {
    this.cart.clear();
    this.selected.clear();
  }

  async removeSelected() {
    if (!this.selected.size) return;
    Array.from(this.selected).forEach((n) => this.cart.removeAll(n));
    this.selected.clear();
    await this.toast('Removed selected items');
  }

  async checkout() {
    if (!this.selected.size) {
      await this.toast('Select items to checkout');
      return;
    }
    // Navigate to checkout page with basic summary params (could move to service)
    this.router.navigate(['/checkout'], {
      queryParams: {
        total: this.selectedTotal(),
        shipping: this.shippingEstimate(),
        grand: this.totalWithShipping(),
        items: Array.from(this.selected).join(','),
      },
    });
  }

  imageOf(name: string): string {
    return this.imageMap[name] ?? 'assets/icon/1.jpg';
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
    });
    await t.present();
  }
}
