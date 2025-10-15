import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'dashboard',   loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
  { path: 'products',    loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage) },
  { path: 'product/:id', loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage) },

  { path: 'cart',        canActivate: [authGuard], loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage) },
  { path: 'checkout',    canActivate: [authGuard], loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage) },
  { path: 'order/:id',   canActivate: [authGuard], loadComponent: () => import('./pages/order/order.page').then(m => m.OrderPage) },

  { path: 'login',       loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register',    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },

  { path: '**', redirectTo: 'dashboard' }
];
