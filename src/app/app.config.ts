import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
   providers: [
      providePrimeNG({
         theme: {
            preset: Aura,
            options: {
               darkModeSelector: false || 'none'
            }
         },
         ripple: true,
         inputVariant: 'filled',
      }),
      provideZoneChangeDetection({ 
         eventCoalescing: true
      }),
      provideBrowserGlobalErrorListeners(),
      provideAnimationsAsync(),
      provideRouter(routes),
      provideHttpClient(withFetch()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
   ]
};
