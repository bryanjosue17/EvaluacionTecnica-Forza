import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Tus otros interceptores
import { jwtInterceptor } from './app/core/jwt.interceptor';
import { errorInterceptor } from './app/core/error.interceptor';

// Loader seguro
import { LoaderInterceptor } from './app/core/loader.interceptor';

// Registrar íconos globalmente
import { addIcons } from 'ionicons';
import {
  homeOutline, pricetagsOutline, cartOutline, logInOutline, personAddOutline, logOutOutline, menuOutline,
  add, remove, trash, basket, eye
} from 'ionicons/icons';

// Registrar todos los íconos usados en la aplicación
addIcons({
  homeOutline, pricetagsOutline, cartOutline, logInOutline, personAddOutline, logOutOutline, menuOutline,
  add, remove, trash, basket, eye
});

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    // Registrar loader con HTTP_INTERCEPTORS para DI correcto
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },

    importProvidersFrom(
      IonicStorageModule.forRoot({
        name: '__ecomdb',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
      })
    )
  ]
}).catch(err => console.error(err));
