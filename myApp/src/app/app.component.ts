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
import {
  AlertController,
  ToastController,
  MenuController,
} from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

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
    RouterModule,
    IonMenuToggle,
    IonAvatar,
    NgIf,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  private sub?: import('rxjs').Subscription;
  private wheelHandler?: (e: WheelEvent) => void;
  private touchStartY: number | null = null;
  private touchMoveHandler?: (e: TouchEvent) => void;
  private touchStartHandler?: (e: TouchEvent) => void;
  constructor(
    private userProfile: UserProfileService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
    private menu: MenuController
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
    // Redirect to full profile settings page with upload capability
    try {
      await this.menu.close('main-menu');
    } catch {}
    await this.router.navigateByUrl('/profile-settings');
  }

  signOut(): void {
    this.userProfile.setUser({
      name: 'Guest User',
      phone: '—',
      email: '',
      avatarUrl: 'assets/icon/jay.png',
      isAdmin: false,
    });
    try {
      // Also close admin menu if it was open
      this.menu.close('admin-menu');
    } catch {}
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
      // Close menu first for better UX
      await this.menu.close();
    } catch {}

    try {
      // If already on the same path, just scroll to top instead of re-navigating
      if (this.router.url.startsWith(path)) {
        await this.scrollVisibleContentToTop();
        // Small nudge to trigger layout refresh if needed
        setTimeout(() => {
          try {
            window.scrollTo({ top: 1 });
            window.scrollTo({ top: 0 });
          } catch {}
        }, 0);
        return;
      }
      await this.router.navigateByUrl(path);
    } catch (e) {
      // no-op fallback
    }
  }

  private async scrollVisibleContentToTop(): Promise<void> {
    try {
      const contents = Array.from(
        document.querySelectorAll('ion-content')
      ) as HTMLElement[];
      // pick the first visible ion-content
      const visible =
        contents.find((el) => el.offsetParent !== null) || contents[0];
      const anyEl: any = visible as any;
      if (anyEl && typeof anyEl.scrollToTop === 'function') {
        await anyEl.scrollToTop(300);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // toggleAdmin method removed (no longer required)

  get isLoginRoute(): boolean {
    try {
      return this.router.url.includes('/login');
    } catch {
      return false;
    }
  }

  async navigateToLogin(): Promise<void> {
    try {
      await this.menu.close('main-menu');
    } catch {}
    await this.router.navigate(['/login']);
  }
}
