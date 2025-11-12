import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonToast,
  IonChip,
  IonBadge,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import {
  UserProfile,
  UserProfileService,
} from '../services/user-profile.service';
import { CartService } from '../services/cart.service';
import { ProductService, Product } from '../services/product.service';
import { ModalController } from '@ionic/angular/standalone';
import { PerfumeDetailsModal } from './perfume-details-modal.component';
import { ImageResolverService } from '../services/image-resolver.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonToast,
    IonChip,
    IonBadge,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  defaultImage = 'assets/icon/jay.png';

  sections: Array<{ title: string; items: Product[] }> = [];
  private productsSub?: import('rxjs').Subscription;

  isToastOpen = false;
  toastMessage = '';
  private sub?: import('rxjs').Subscription;
  user: UserProfile | null = null;

  private imageMap = new Map<string, string>();

  constructor(
    private router: Router,
    private userProfile: UserProfileService,
    private cart: CartService,
    private products: ProductService,
    private modalCtrl: ModalController,
    private imageResolver: ImageResolverService
  ) {}

  ngOnInit(): void {
    this.sub = this.userProfile.user$.subscribe((u) => (this.user = u));
    this.productsSub = this.products.list$().subscribe((list) => {
      const groups = new Map<string, Product[]>();
      for (const p of list.filter((p) => p.active)) {
        const cat = p.category || 'Other';
        const arr = groups.get(cat) || [];
        arr.push(p);
        groups.set(cat, arr);
      }
      this.sections = Array.from(groups.entries()).map(([title, items]) => ({
        title,
        items,
      }));

      // Resolve first image for visible products
      for (const item of list) {
        if (!this.imageMap.has(item.id)) {
          this.imageResolver
            .resolveFirst(item.name)
            .then((url) => {
              if (url) this.imageMap.set(item.id, url);
            })
            .catch(() => {});
        }
      }
    });
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
  }

  getImage(item: Product): string {
    return this.imageMap.get(item.id) || item.image || this.defaultImage;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.productsSub?.unsubscribe();
  }

  get isGuest(): boolean {
    const u = this.user;
    if (!u) return true;
    return !(u.email && u.email.includes('@'));
  }

  addToCart(perfumeName: string) {
    if (this.isGuest) {
      // Pass returnUrl and desired item to login so it can be added post-auth
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart', addItem: perfumeName },
      });
      return;
    }
    this.cart.addItem(perfumeName, 1);
    this.toastMessage = `${perfumeName} added to cart!`;
    this.isToastOpen = true;
  }

  async openDetails(item: Product) {
    const modal = await this.modalCtrl.create({
      component: PerfumeDetailsModal,
      componentProps: {
        perfume: {
          name: item.name,
          price: item.price,
          image: item.image || this.defaultImage,
          description: item.description || '',
        },
      },
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.9,
    });
    await modal.present();
  }

  // Sign-in/login header buttons removed
}
