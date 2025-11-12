import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  IonText
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
    IonText
  ]
})
export class ContactPage {
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\+?[0-9]{7,15}$/)]],
    topic: ['general', [Validators.required]],
    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  submitting = false;
  submitted = false;

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = { ...this.form.value, id: Date.now() };
    // Persist to localStorage (simple storage). Later we can move to a service/admin view.
    const existingRaw = localStorage.getItem('contactMessages');
    const messages = existingRaw ? JSON.parse(existingRaw) : [];
    messages.push(payload);
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    this.form.reset({ topic: 'general' });
    this.submitting = false;
    this.submitted = true;

    const toast = await this.toastCtrl.create({
      message: 'Message sent! We will reach out soon.',
      duration: 2500,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  get f() { return this.form.controls; }
}
