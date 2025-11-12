import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonChip,
} from '@ionic/angular/standalone';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  topic: string;
  subject: string;
  message: string;
  handled?: boolean;
  createdAt?: number;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonBadge,
    IonChip,
  ],
  templateUrl: './admin-messages.page.html',
  styleUrls: ['./admin-messages.page.scss'],
})
export class AdminMessagesPage implements OnInit {
  messages: ContactMessage[] = [];
  expanded: Record<number, boolean> = {};

  ngOnInit(): void {
    this.load();
  }

  load() {
    const raw = localStorage.getItem('contactMessages');
    const arr: ContactMessage[] = raw ? JSON.parse(raw) : [];
    // newest first
    this.messages = arr
      .map((m) => ({
        ...m,
        createdAt: m.createdAt || m.id || Date.now(),
        handled: !!m.handled,
      }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  save() {
    localStorage.setItem('contactMessages', JSON.stringify(this.messages));
  }

  toggleExpand(id: number) {
    this.expanded[id] = !this.expanded[id];
  }

  toggleHandled(msg: ContactMessage) {
    msg.handled = !msg.handled;
    this.save();
  }

  remove(msg: ContactMessage) {
    this.messages = this.messages.filter((m) => m.id !== msg.id);
    this.save();
  }

  clearAll() {
    this.messages = [];
    this.save();
  }

  trackById(_idx: number, m: ContactMessage) {
    return m.id;
  }

  // Template helpers (avoid arrow functions in templates)
  get hasHandled(): boolean {
    return this.messages?.some((m) => !!m.handled) ?? false;
  }
  get handledCount(): number {
    return this.messages?.filter((m) => !!m.handled).length ?? 0;
  }
}
