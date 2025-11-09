import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
  IonImg,
} from '@ionic/angular/standalone';

interface Developer {
  name: string;
  role: string;
  photo: string; // path to asset or placeholder
}

@Component({
  selector: 'app-developers',
  standalone: true,
  templateUrl: './developers.page.html',
  styleUrls: ['./developers.page.scss'],
  imports: [
    CommonModule,
    NgFor,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonAvatar,
    IonImg,
  ],
})
export class DevelopersPage {
  // Template-only per your request: two developers, circular avatars with pink ring, no contact buttons.
  devs: Developer[] = [
    {
      name: 'John Rex Aspiras',
      role: 'Lead Developer',
      photo: 'assets/icon/jay.png',
    },
    {
      name: 'Mae Dela Cruz',
      role: 'UI/UX Designer',
      photo: 'assets/icon/jay.png',
    },
  ];
}
