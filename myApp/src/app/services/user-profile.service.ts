import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  isAdmin?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly storageKeys = {
    name: 'user_name',
    phone: 'user_phone',
    email: 'user_email',
    avatar: 'user_avatar',
    isAdmin: 'user_is_admin',
  } as const;

  private readonly defaultUser: UserProfile = {
    name: 'Guest User',
    phone: '—',
    email: '',
    avatarUrl: 'assets/icon/jay.png',
    isAdmin: false,
  };

  private userSubject = new BehaviorSubject<UserProfile>(
    this.readFromStorage()
  );
  readonly user$: Observable<UserProfile> = this.userSubject.asObservable();

  getUserSnapshot(): UserProfile {
    return this.userSubject.value;
  }

  setUser(user: Partial<UserProfile>): void {
    const merged: UserProfile = {
      ...this.userSubject.value,
      ...user,
    } as UserProfile;
    this.persistToStorage(merged);
    this.userSubject.next(merged);
  }

  private readFromStorage(): UserProfile {
    try {
      const name =
        localStorage.getItem(this.storageKeys.name) || this.defaultUser.name;
      const phone =
        localStorage.getItem(this.storageKeys.phone) || this.defaultUser.phone;
      const email =
        localStorage.getItem(this.storageKeys.email) || this.defaultUser.email;
      const avatarUrl =
        localStorage.getItem(this.storageKeys.avatar) ||
        this.defaultUser.avatarUrl;
      const isAdminRaw = localStorage.getItem(this.storageKeys.isAdmin);
      const isAdmin = isAdminRaw === 'true';
      return { name, phone, email, avatarUrl, isAdmin };
    } catch {
      return this.defaultUser;
    }
  }

  private persistToStorage(user: UserProfile): void {
    try {
      localStorage.setItem(this.storageKeys.name, user.name ?? '');
      localStorage.setItem(this.storageKeys.phone, user.phone ?? '');
      localStorage.setItem(this.storageKeys.email, user.email ?? '');
      localStorage.setItem(this.storageKeys.avatar, user.avatarUrl ?? '');
      localStorage.setItem(
        this.storageKeys.isAdmin,
        String(Boolean(user.isAdmin))
      );
    } catch {
      // ignore storage errors (e.g., SSR or private mode)
    }
  }
}
