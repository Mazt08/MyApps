import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/angular/standalone';
import { Product, ProductService } from '../services/product.service';
import { ImageResolverService } from '../services/image-resolver.service';
import { CartService } from '../services/cart.service';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
  ],
})
export class ProductDetailPage implements OnInit, OnDestroy {
  product?: Product;
  private sub?: import('rxjs').Subscription;
  defaultImage = 'assets/icon/jay.png';
  images: string[] = [];
  private carouselEl?: HTMLDivElement;
  @ViewChild('carouselEl') set setCarousel(
    el: ElementRef<HTMLDivElement> | undefined
  ) {
    this.carouselEl = el?.nativeElement;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private products: ProductService,
    private cart: CartService,
    private userProfile: UserProfileService,
    private imageResolver: ImageResolverService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.product = this.products.getById(id);
        if (this.product) {
          // Resolve product images from assets folder
          this.imageResolver
            .resolveImages(this.product.name)
            .then((arr) => (this.images = arr))
            .catch(() => (this.images = []));
        }
      }
    });
  }

  scrollLeft() {
    const el = this.carouselEl;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
  }

  scrollRight() {
    const el = this.carouselEl;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img && img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
  }

  addToCart(): void {
    const p = this.product;
    if (!p) return;
    const u = this.userProfile.getUserSnapshot();
    const isGuest = !u.email || !u.email.includes('@');
    if (isGuest) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart', addItem: p.name },
      });
      return;
    }
    this.cart.addItem(p.name, 1);
  }
}
