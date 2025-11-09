import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import {
  UserProfile,
  UserProfileService,
} from '../services/user-profile.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
  ],
})
export class HomePage implements OnInit, OnDestroy {
  perfumes = [
    {
      name: 'Amouré Elegance',
      price: '₱899.00',
      image: 'assets/icon/1.jpg',
      description:
        'A sophisticated blend of floral and woody notes — perfect for formal evenings.',
    },
    {
      name: 'Amouré Bloom',
      price: '₱799.00',
      image: 'assets/icon/2.jpg',
      description:
        'A fresh floral scent that captures the essence of spring and youth.',
    },
    {
      name: 'Amouré Noir',
      price: '₱999.00',
      image: 'assets/icon/3.jpg',
      description:
        'A deep, mysterious fragrance with notes of amber and musk ideal for night wear.',
    },
    {
      name: 'Amouré Nuit',
      price: '₱1,099.00',
      image: 'assets/icon/4.jpg',
      description:
        'Intense and bold, a fragrance that leaves a lasting impression.',
    },
    {
      name: 'Amouré Velvet',
      price: '₱1,199.00',
      image: 'assets/icon/5.jpg',
      description: 'Soft, luxurious scent with hints of vanilla and amber.',
    },
    {
      name: 'Amouré Fleur',
      price: '₱899.00',
      image: 'assets/icon/6.jpg',
      description: 'Delicate floral fragrance perfect for everyday elegance.',
    },
  ];

  isToastOpen = false;
  toastMessage = '';
  private sub?: import('rxjs').Subscription;
  user: UserProfile | null = null;

  constructor(
    private router: Router,
    private userProfile: UserProfileService,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    this.sub = this.userProfile.user$.subscribe((u) => (this.user = u));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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

  // Sign-in/login header buttons removed
}
