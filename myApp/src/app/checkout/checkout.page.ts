import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class CheckoutPage {
  total = 0;
  shipping = 0;
  grand = 0;
  items: string[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {
    const qp = this.route.snapshot.queryParamMap;
    this.total = Number(qp.get('total')) || 0;
    this.shipping = Number(qp.get('shipping')) || 0;
    this.grand = Number(qp.get('grand')) || this.total + this.shipping;
    const rawItems = qp.get('items');
    this.items = rawItems ? rawItems.split(',').filter((x) => !!x) : [];
  }

  placeOrder() {
    // Placeholder order placement
    this.router.navigateByUrl('/home');
  }
}
