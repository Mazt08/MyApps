import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  IonAvatar,
  IonButton,
  IonList,
  IonIcon,
} from '@ionic/angular/standalone';
import { UserProfileService } from '../services/user-profile.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
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
    IonAvatar,
    IonButton,
    IonList,
    IonIcon,
  ],
})
export class ProfileSettingsPage {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    phone: [''],
    // We'll store the uploaded image as a Data URL here
    avatarUrl: [''],
  });
  loading = false;
  previewUrl: string = '';
  fileError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private profile: UserProfileService,
    private toastCtrl: ToastController
  ) {
    const snap = this.profile.getUserSnapshot();
    this.form.patchValue({
      name: snap.name,
      email: snap.email,
      phone: snap.phone,
      avatarUrl: snap.avatarUrl,
    });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { name, email, phone, avatarUrl } = this.form.value;
    this.profile.setUser({
      name: name ?? '',
      email: email ?? '',
      phone: phone ?? '',
      avatarUrl: avatarUrl ?? '',
    });
    this.loading = false;
    const t = await this.toastCtrl.create({
      message: 'Profile updated',
      duration: 1500,
      position: 'bottom',
    });
    await t.present();
  }

  async onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.fileError = null;

    if (!file.type.startsWith('image/')) {
      this.fileError = 'Invalid image type';
      return;
    }
    // Allow up to 4MB original before compression
    const maxOriginal = 4 * 1024 * 1024;
    if (file.size > maxOriginal) {
      this.fileError = 'Image exceeds 4MB limit';
      return;
    }

    try {
      const dataUrl = await this.resizeImage(file, 256, 0.85);
      // If still big (>350KB) recompress at lower quality
      const finalDataUrl =
        dataUrl.length > 350_000
          ? await this.resizeImage(file, 256, 0.65)
          : dataUrl;
      if (finalDataUrl.length > 500_000) {
        this.fileError = 'Final image still too large';
        return;
      }
      this.previewUrl = finalDataUrl;
      this.form.patchValue({ avatarUrl: finalDataUrl });
    } catch (e) {
      this.fileError = 'Failed to process image';
    }
    // reset input so same file can be re-selected
    input.value = '';
  }

  private resizeImage(
    file: File,
    maxSide: number,
    quality: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read error'));
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const scale = maxSide / Math.max(width, height);
          if (scale < 1) {
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('no ctx'));
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('img error'));
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  clearAvatar() {
    this.previewUrl = '';
    this.form.patchValue({ avatarUrl: '' });
  }
}
