import { Routes } from '@angular/router';

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
];
