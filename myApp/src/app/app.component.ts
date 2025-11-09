import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonApp,
  IonMenu,
  IonContent,
  IonLabel,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonRouterOutlet,
  IonMenuToggle,
  IonAvatar,
} from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import {
  UserProfile,
  UserProfileService,
} from './services/user-profile.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    IonApp,
    IonMenu,
    IonContent,
    IonLabel,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonRouterOutlet,
    IonMenuToggle,
    IonAvatar,
    NgIf,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  private sub?: import('rxjs').Subscription;
  constructor(
    private userProfile: UserProfileService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.userProfile.user$.subscribe((u) => (this.user = u));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isGuest(): boolean {
    const u = this.user;
    if (!u) return true;
    const hasEmail = !!u.email && u.email.includes('@');
    const nameLooksGuest = !u.name || u.name.toLowerCase().includes('guest');
    return !hasEmail || nameLooksGuest;
  }

  useDefaultAvatar(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (img) {
      img.src = 'assets/icon/jay.png';
    }
  }

  // Removed signIn UI (button gone). Method kept for potential future use; can be deleted if not needed.

  async editProfile(): Promise<void> {
    const u =
      this.user ?? ({ name: '', phone: '', avatarUrl: '' } as UserProfile);
    const alert = await this.alertCtrl.create({
      header: 'Edit profile',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Full name', value: u.name },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Phone number',
          value: u.phone,
        },
        {
          name: 'avatarUrl',
          type: 'url',
          placeholder: 'Avatar image URL (optional)',
          value: u.avatarUrl,
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          role: 'confirm',
          handler: (data: any) => {
            const patch: Partial<UserProfile> = {};
            if (typeof data?.name === 'string') patch.name = data.name.trim();
            if (typeof data?.phone === 'string')
              patch.phone = data.phone.trim();
            if (typeof data?.avatarUrl === 'string')
              patch.avatarUrl = data.avatarUrl.trim();
            this.userProfile.setUser(patch);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  signOut(): void {
    this.userProfile.setUser({
      name: 'Guest User',
      phone: '—',
      email: '',
      avatarUrl: 'assets/icon/jay.png',
    });
  }

  isActive(path: string): boolean {
    try {
      return this.router.url.startsWith(path);
    } catch {
      return false;
    }
  }

  async handleCart(): Promise<void> {
    if (this.isGuest) {
      await this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/cart' },
      });
      return;
    }
    await this.router.navigateByUrl('/cart');
  }

  async navigate(path: string): Promise<void> {
    try {
      await this.router.navigateByUrl(path);
    } catch (e) {
      // no-op fallback
    }
  }
}
