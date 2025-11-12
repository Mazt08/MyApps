import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ManagedUser, UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage {
  users: ManagedUser[] = [];
  showForm = false;
  editingId: string | null = null;
  form: Partial<ManagedUser> = {
    name: '',
    email: '',
    role: 'user',
    active: true,
  };

  constructor(public userService: UserService, private toast: ToastController) {
    this.userService.list$().subscribe((list) => (this.users = list));
  }

  newUser() {
    this.showForm = true;
    this.editingId = null;
    this.form = { name: '', email: '', role: 'user', active: true };
  }

  editUser(u: ManagedUser) {
    this.showForm = true;
    this.editingId = u.id;
    this.form = { ...u };
  }

  async save() {
    if (!this.form.name || !this.form.email) return;
    const input = {
      name: this.form.name!,
      email: this.form.email!,
      role: (this.form.role as 'admin' | 'user') ?? 'user',
      active: this.form.active !== false,
    } as Omit<ManagedUser, 'id' | 'createdAt'>;

    if (this.editingId) {
      this.userService.update(this.editingId, input);
      (
        await this.toast.create({ message: 'User updated', duration: 1200 })
      ).present();
    } else {
      this.userService.create(input);
      (
        await this.toast.create({ message: 'User created', duration: 1200 })
      ).present();
    }
    this.cancel();
  }

  cancel() {
    this.showForm = false;
    this.editingId = null;
  }

  async remove(u: ManagedUser) {
    this.userService.remove(u.id);
    (
      await this.toast.create({ message: 'User removed', duration: 1200 })
    ).present();
  }
}
