import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonList,
  IonText,
  IonToggle,
  IonBadge,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonList,
    IonText,
    IonToggle,
  ],
})
export class ContactPage implements OnInit {
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    topic: ['general', [Validators.required]],
    subject: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    ],
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000),
      ],
    ],
  });

  submitting = false;
  submitted = false;
  thread: Array<{
    from: 'user' | 'admin';
    text: string;
    at: number;
    subject?: string;
    topic?: string;
  }> = [];
  hasThread = false;
  replyMode = false;

  ngOnInit(): void {
    // Load thread when email changes and is valid
    this.form.get('email')?.valueChanges?.subscribe((val) => {
      const email = (val || '').toString().trim().toLowerCase();
      if (/^\S+@\S+\.\S+$/.test(email)) {
        this.loadThread(email);
      } else {
        this.thread = [];
        this.hasThread = false;
        this.replyMode = false;
      }
    });
  }

  private loadThread(email: string) {
    const raw = localStorage.getItem('contactMessages');
    const arr: any[] = raw ? JSON.parse(raw) : [];
    const byEmail = arr.filter((m) => (m.email || '').toLowerCase() === email);
    const entries: Array<{
      from: 'user' | 'admin';
      text: string;
      at: number;
      subject?: string;
      topic?: string;
    }> = [];
    for (const m of byEmail) {
      const at = m.createdAt || m.id || 0;
      if (m.message) {
        entries.push({
          from: 'user',
          text: m.message,
          at,
          subject: m.subject,
          topic: m.topic,
        });
      }
      if (Array.isArray(m.replies)) {
        for (const r of m.replies) {
          if (!r) continue;
          entries.push({
            from: r.from === 'admin' ? 'admin' : 'user',
            text: r.text,
            at: r.at || r.id || 0,
            subject: m.subject,
            topic: m.topic,
          });
        }
      }
    }
    entries.sort((a, b) => a.at - b.at);
    this.thread = entries;
    this.hasThread = entries.length > 0;
    this.replyMode = this.hasThread;
    // Prefill subject for reply convenience (keep user's control if they want new)
    if (this.hasThread) {
      const last = byEmail.sort(
        (a: any, b: any) =>
          (b.lastReplyAt || b.createdAt || b.id || 0) -
          (a.lastReplyAt || a.createdAt || a.id || 0)
      )[0];
      if (last?.subject && !this.form.get('subject')?.dirty) {
        const subj = this.form.get('subject')?.value || '';
        if (!subj) this.form.get('subject')?.setValue(`Re: ${last.subject}`);
      }
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const now = Date.now();
    const existingRaw = localStorage.getItem('contactMessages');
    const messages: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    const email = (this.form.get('email')?.value || '')
      .toString()
      .trim()
      .toLowerCase();

    if (this.replyMode && this.hasThread) {
      // Append as reply to latest thread for this email
      const candidates = messages.filter(
        (m) => (m.email || '').toLowerCase() === email
      );
      candidates.sort(
        (a, b) =>
          (b.lastReplyAt || b.createdAt || b.id || 0) -
          (a.lastReplyAt || a.createdAt || a.id || 0)
      );
      const target = candidates[0];
      if (target) {
        target.replies = Array.isArray(target.replies) ? target.replies : [];
        target.replies.push({
          id: now,
          from: 'user',
          text: this.form.get('message')?.value,
          at: now,
        });
        target.lastReplyAt = now;
      } else {
        // fallback: create new
        messages.push({ ...this.form.value, id: now, createdAt: now });
      }
    } else {
      // New message
      messages.push({
        ...this.form.value,
        id: now,
        createdAt: now,
        replies: [],
      });
    }

    localStorage.setItem('contactMessages', JSON.stringify(messages));

    this.form.reset({ topic: 'general' });
    this.submitting = false;
    this.submitted = true;
    // Reload thread for same email (so user sees admin+their reply history)
    if (email) this.loadThread(email);

    const toast = await this.toastCtrl.create({
      message: this.replyMode
        ? 'Reply sent!'
        : 'Message sent! We will reach out soon.',
      duration: 2500,
      color: 'success',
      position: 'top',
    });
    toast.present();
  }

  get f() {
    return this.form.controls;
  }
}
