import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonTextarea } from '@ionic/angular/standalone';
import { IonicModule, ToastController } from '@ionic/angular';
import { Product, ProductService } from '../services/product.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, IonTextarea],
  templateUrl: './admin-products.page.html',
  styleUrls: ['./admin-products.page.scss'],
})
export class AdminProductsPage {
  products: Product[] = [];
  sortKey: 'name' | 'price' | 'createdAt' = 'name';
  sortDir: 'asc' | 'desc' = 'asc';
  showForm = false;
  editingId: string | null = null;
  form: Partial<Product> = {
    name: '',
    price: null,
    category: 'Featured',
    image: '',
    active: true,
    featured: false,
    description: '',
  };

  categories = ['Featured', 'Armaf / Club de Nuit', 'Other Brands'];

  constructor(
    public productService: ProductService,
    private toast: ToastController
  ) {
    this.productService.list$().subscribe((list) => {
      this.products = this.sort(list.slice());
    });
  }

  private sort(list: Product[]): Product[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      let av: any = a[this.sortKey];
      let bv: any = b[this.sortKey];
      if (
        this.sortKey === 'name' &&
        typeof av === 'string' &&
        typeof bv === 'string'
      ) {
        return av.localeCompare(bv) * dir;
      }
      if (this.sortKey === 'price') {
        const an = av ?? Number.MAX_SAFE_INTEGER;
        const bn = bv ?? Number.MAX_SAFE_INTEGER;
        return (an - bn) * dir;
      }
      return ((av ?? 0) - (bv ?? 0)) * dir;
    });
  }

  onChangeSort() {
    this.products = this.sort(this.products.slice());
  }

  newProduct() {
    this.showForm = true;
    this.editingId = null;
    this.form = {
      name: '',
      price: null,
      category: 'Featured',
      image: '',
      active: true,
      featured: false,
      description: '',
    };
  }

  editProduct(p: Product) {
    this.showForm = true;
    this.editingId = p.id;
    this.form = { ...p };
  }

  async save() {
    if (!this.form.name || this.form.name.trim() === '') return;
    const input = {
      name: this.form.name!.trim(),
      price: this.form.price ?? null,
      category: this.form.category || 'Featured',
      image: this.form.image || 'assets/icon/favicon.png',
      featured: !!this.form.featured,
      active: this.form.active !== false,
      description: (this.form.description || '').toString().trim(),
    } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

    if (this.editingId) {
      this.productService.update(this.editingId, input);
      (
        await this.toast.create({ message: 'Product updated', duration: 1200 })
      ).present();
    } else {
      this.productService.create(input);
      (
        await this.toast.create({ message: 'Product created', duration: 1200 })
      ).present();
    }
    this.cancel();
  }

  cancel() {
    this.showForm = false;
    this.editingId = null;
  }

  async remove(p: Product) {
    this.productService.remove(p.id);
    (
      await this.toast.create({ message: 'Product removed', duration: 1200 })
    ).present();
  }
}
