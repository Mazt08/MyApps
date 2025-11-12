import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonNote,
} from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { UserProfileService } from '../services/user-profile.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonIcon,
    IonNote,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class LoginPage {
  mode: 'login' | 'signup' = 'login';
  passwordVisibleLogin = false;
  passwordVisibleSignup = false;
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });
  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userProfile: UserProfileService,
    private cart: CartService
  ) {}

  private get navReturn(): string {
    const qp = this.route.snapshot.queryParamMap;
    return qp.get('returnUrl') || '/home';
  }

  private get itemToAdd(): string | null {
    const qp = this.route.snapshot.queryParamMap;
    const val = qp.get('addItem');
    return val && val.trim() ? val : null;
  }

  segmentChanged(ev: any) {
    this.mode = ev.detail.value as any;
  }

  get lf() {
    return this.loginForm.controls;
  }
  get sf() {
    return this.signupForm.controls;
  }

  loginError: string | null = null;

  submitLogin() {
    if (this.loginForm.invalid) return;
    this.loginError = null;
    const { email, password } = this.loginForm.value;
    const lower = (email || '').toLowerCase();

    // Admin credential check
    if (lower === 'admin@gmail.com') {
      if (password === '@Admin123') {
        this.userProfile.setUser({
          name: 'Admin',
          phone: '—',
          email: email!,
          avatarUrl: 'assets/icon/jay.png',
          isAdmin: true,
        });
        this.postAuthNavigate();
      } else {
        this.loginError = 'Invalid admin credentials';
      }
      return;
    }

    // Regular user login (no password validation; demo only)
    this.userProfile.setUser({
      name: 'User',
      phone: '—',
      email: email!,
      avatarUrl: 'assets/icon/jay.png',
      isAdmin: false,
    });
    this.postAuthNavigate();
  }

  submitSignup() {
    if (this.signupForm.invalid) return;
    const { name, phone, email } = this.signupForm.value;
    this.userProfile.setUser({
      name: name!,
      phone: phone!,
      email: email!,
      avatarUrl: 'assets/icon/jay.png',
      isAdmin: false,
    });
    this.postAuthNavigate();
  }

  private postAuthNavigate() {
    const toAdd = this.itemToAdd;
    if (toAdd) {
      this.cart.addItem(toAdd, 1);
    }
    const dest = this.navReturn;
    this.router.navigateByUrl(dest);
  }
}
