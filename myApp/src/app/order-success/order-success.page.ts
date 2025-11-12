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
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.page.html',
  styleUrls: ['./order-success.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonIcon,
    IonButton,
  ],
})
export class OrderSuccessPage {
  orderId = '';
  total = 0;
  itemsCount = 0;

  constructor(private route: ActivatedRoute, private router: Router) {
    const qp = this.route.snapshot.queryParamMap;
    this.orderId = qp.get('orderId') || '';
    this.total = Number(qp.get('total')) || 0;
    this.itemsCount = Number(qp.get('items')) || 0;
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }
}
