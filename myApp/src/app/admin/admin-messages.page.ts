import { Component, OnInit, inject } from '@angular/core';
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
import { AlertController, ToastController } from '@ionic/angular';

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
  // Optional conversation fields (used for two-way messaging)
  replies?: Array<{
    id: number;
    from: 'user' | 'admin';
    text: string;
    at: number;
  }>;
  lastReplyAt?: number;
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
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
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

  async reply(msg: ContactMessage) {
    const alert = await this.alertCtrl.create({
      header: 'Reply to ' + msg.email,
      inputs: [
        {
          type: 'textarea',
          name: 'reply',
          placeholder: 'Type your reply...',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Send',
          handler: (data: any) => {
            const text = (data?.reply || '').trim();
            if (!text) return false;
            const now = Date.now();
            (msg as any).replies = (msg as any).replies || [];
            (msg as any).replies.push({
              id: now,
              from: 'admin',
              text,
              at: now,
            });
            (msg as any).lastReplyAt = now;
            msg.handled = true;
            this.save();
            this.presentToast('Reply sent (stored locally)');
            this.expanded[msg.id] = true;
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async presentToast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'top',
    });
    t.present();
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
