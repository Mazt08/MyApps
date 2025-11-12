import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { ImageResolverService } from '../services/image-resolver.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    // Featured
    'Yara Elixir': 49.99,
    'Asad Elixir': 49.99,
    'Eclaire Banoffi': 49.99,
    'Eclaire Pistache': 49.99,
    'Whipped Pleasure': 59.99,
    'Vanilla Freak': 59.99,
    'Raed Gold': 29.99,
    Emaan: 39.99,
    Qimmah: 29.99,
    'Mayar Cherry Intense': 34.99,
    Teriaq: 49.99,
    'Fire On Ice': 49.99,
    'Habik for Women': 44.99,
    'Habik for Men': 44.99,
    'His Confession': 49.99,
    'Her Confession': 49.99,
    // Armaf / Club de Nuit
    'CLUB DE NUIT OUD': 62.99,
    'CLUB DE NUIT MILESTONE': 62.99,
    'CLUB DE NUIT ICONIC': 69.99,
    'CLUB DE NUIT UNTOLD': 62.99,
    'CLUB DE NUIT MALEKA': 54.99,
    'MISS ARMAF CHIC': 49.49,
    // Other Brands (unknown price -> 0)
    'OROS PURE LEATHER GOLD': 0,
    'MINYA CARAMEL DULCE': 0,
  };
  // Resolved product images cache (by product name)
  private imageMap = new Map<string, string>();
  private sub?: import('rxjs').Subscription;

  // Premium summary features (Option 2)
  // Shipping is flat $50 if there is at least one selected item, else $0

  constructor(
    private cart: CartService,
    private userProfile: UserProfileService,
    private router: Router,
    private toastCtrl: ToastController,
    private imageResolver: ImageResolverService
  ) {}

  ngOnInit(): void {
    this.sub = this.cart.items$.subscribe((it) => {
      this.items = it;
      this.resolveItemImages(it);
    });
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
    return 50; // flat
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
    return this.imageMap.get(name) ?? 'assets/icon/jay.png';
  }

  private resolveItemImages(list: CartItem[]) {
    for (const it of list) {
      const key = it.name;
      if (!this.imageMap.has(key)) {
        // seed with placeholder then replace when resolved
        this.imageMap.set(key, 'assets/icon/jay.png');
        this.imageResolver
          .resolveFirst(key)
          .then((url) => {
            if (url) this.imageMap.set(key, url);
          })
          .catch(() => {
            // keep placeholder on error
          });
      }
    }
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
    });
    await t.present();
  }

  // no coupon, notes, or free shipping logic per requirements
}
