import { Routes, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserProfileService } from './services/user-profile.service';

const adminGuard: CanMatchFn = () => {
  const userSvc = inject(UserProfileService);
  const router = inject(Router);
  const u = userSvc.getUserSnapshot();
  return u.isAdmin ? true : router.createUrlTree(['/home']);
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'company-history',
    loadComponent: () =>
      import('./company-history/company-history.page').then(
        (m) => m.CompanyHistoryPage
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.page').then((m) => m.ContactPage),
  },
  {
    path: 'profile-settings',
    loadComponent: () =>
      import('./profile-settings/profile-settings.page').then(
        (m) => m.ProfileSettingsPage
      ),
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadComponent: () => import('./admin/admin.page').then((m) => m.AdminPage),
  },
  {
    path: 'admin/products',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-products.page').then((m) => m.AdminProductsPage),
  },
  {
    path: 'admin/orders',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-orders.page').then((m) => m.AdminOrdersPage),
  },
  {
    path: 'admin/users',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-users.page').then((m) => m.AdminUsersPage),
  },
  {
    path: 'admin/reports',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-reports.page').then((m) => m.AdminReportsPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'developers',
    loadComponent: () =>
      import('./developers/developers.page').then((m) => m.DevelopersPage),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./product-detail/product-detail.page').then(
        (m) => m.ProductDetailPage
      ),
  },
  {
    path: 'order-success',
    loadComponent: () =>
      import('./order-success/order-success.page').then(
        (m) => m.OrderSuccessPage
      ),
  },
  // Fallback to home for any unknown path
  { path: '**', redirectTo: 'home' },
];
