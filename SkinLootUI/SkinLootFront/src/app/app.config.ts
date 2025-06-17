import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi, withFetch } from "@angular/common/http";
import { AuthInterceptorService } from "./service/auth-interceptor.service";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(),

    // Angular Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,

    // Forms
    FormsModule,
    ReactiveFormsModule,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ]
};
