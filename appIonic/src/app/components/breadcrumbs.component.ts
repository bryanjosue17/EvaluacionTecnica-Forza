import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IonBreadcrumb, IonBreadcrumbs } from '@ionic/angular/standalone';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [IonBreadcrumb, IonBreadcrumbs, NgFor],
  template: `
    <ion-breadcrumbs>
      <ion-breadcrumb *ngFor="let crumb of breadcrumbs; let i = index"
                      [routerLink]="crumb.url"
                      [class.active]="i === breadcrumbs.length - 1">
        {{ crumb.label }}
      </ion-breadcrumb>
    </ion-breadcrumbs>
  `,
  styles: [`
    ion-breadcrumbs {
      padding: 8px 16px;
      background: var(--ion-color-light);
      border-bottom: 1px solid var(--ion-color-light-shade);
    }

    ion-breadcrumb.active {
      color: var(--ion-color-primary);
      font-weight: 600;
    }

    ion-breadcrumb:not(.active) {
      color: var(--ion-color-medium);
    }
  `]
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: { label: string; url: string }[] = [];
  private router = inject(Router);

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateBreadcrumbs(event.url);
      });

    // Initialize with current route
    this.updateBreadcrumbs(this.router.url);
  }

  private updateBreadcrumbs(url: string) {
    const segments = url.split('/').filter(segment => segment);
    this.breadcrumbs = [];

    // Always start with Home/Dashboard
    this.breadcrumbs.push({ label: 'Inicio', url: '/dashboard' });

    if (segments.length > 0) {
      segments.forEach((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        let label = this.getLabelForSegment(segment);

        // If it's a product detail page, try to get the product name
        if (segment === 'product' && segments[index + 1]) {
          label = 'Producto';
        }

        this.breadcrumbs.push({ label, url: path });
      });
    }
  }

  private getLabelForSegment(segment: string): string {
    const labels: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'products': 'Productos',
      'product': 'Producto',
      'cart': 'Carrito',
      'checkout': 'Checkout',
      'login': 'Login',
      'register': 'Registro',
      'order': 'Orden'
    };

    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}