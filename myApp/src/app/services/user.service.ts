import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'users_v1';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users$ = new BehaviorSubject<ManagedUser[]>([]);

  constructor() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        this.users$.next(JSON.parse(existing));
      } catch {
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  list$() {
    return this.users$.asObservable();
  }
  getAll(): ManagedUser[] {
    return this.users$.getValue();
  }

  private persist(users: ManagedUser[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    this.users$.next(users);
  }

  create(input: Omit<ManagedUser, 'id' | 'createdAt'>): ManagedUser {
    const user: ManagedUser = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const users = [user, ...this.getAll()];
    this.persist(users);
    return user;
  }

  update(id: string, patch: Partial<Omit<ManagedUser, 'id' | 'createdAt'>>) {
    const users = this.getAll().map((u) =>
      u.id === id ? { ...u, ...patch } : u
    );
    this.persist(users);
  }

  remove(id: string) {
    const users = this.getAll().filter((u) => u.id !== id);
    this.persist(users);
  }

  clearAll() {
    this.persist([]);
  }

  private seed() {
    const now = Date.now();
    const seedUsers: ManagedUser[] = [
      {
        id: crypto.randomUUID(),
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
        active: true,
        createdAt: now,
      },
    ];
    this.persist(seedUsers);
  }
}
