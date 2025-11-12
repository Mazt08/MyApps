import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserProfileService } from '../services/user-profile.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-perfume-details',
  templateUrl: './perfume-details-modal.component.html',
  styleUrls: ['./perfume-details-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
  ],
})
export class PerfumeDetailsModal {
  perfume: any;

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private userProfile: UserProfileService,
    private cart: CartService
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  addToCart(name: string) {
    const u = this.userProfile.getUserSnapshot();
    const isGuest = !(u?.email && u.email.includes('@'));
    if (isGuest) {
      this.modalCtrl.dismiss();
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart', addItem: name },
      });
      return;
    }
    this.cart.addItem(name, 1);
    this.modalCtrl.dismiss();
    this.router.navigateByUrl('/cart');
  }
}
