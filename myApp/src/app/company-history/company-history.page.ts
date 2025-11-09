import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-company-history',
  templateUrl: './company-history.page.html',
  styleUrls: ['./company-history.page.scss'],
  standalone: true,
  imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton]
})
export class CompanyHistoryPage {
  constructor() {}
}
