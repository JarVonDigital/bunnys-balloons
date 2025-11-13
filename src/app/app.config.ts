import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

const brandPrimary = {
  50: '#fef6ea',
  100: '#fde9d0',
  200: '#f9d3a6',
  300: '#f1b874',
  400: '#e18b3b',
  500: '#a15512',
  600: '#8f4810',
  700: '#75360f',
  800: '#5c2b0c',
  900: '#401d08',
  950: '#291104'
} as const;

const brandSurface = {
  0: '#fffdf6',
  50: '#fcf4e4',
  100: '#f7ebd2',
  200: '#f0dfc0',
  300: '#e5cfa8',
  400: '#d9be92',
  500: '#c9aa79',
  600: '#ab8959',
  700: '#8a6a43',
  800: '#6b4f31',
  900: '#3f2f1c',
  950: '#261c10'
} as const;

const bunnyPreset = definePreset(Lara, {
  semantic: {
    primary: brandPrimary,
    colorScheme: {
      light: {
        surface: brandSurface,
        text: {
          color: '#3b2716',
          hoverColor: '#2a1a0f',
          mutedColor: '#7a644a',
          hoverMutedColor: '#5d4630'
        },
        primary: {
          color: '{primary.500}',
          contrastColor: '#fffaf2',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}'
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}'
        },
        focusRing: {
          shadow: '0 0 0 0.2rem color-mix(in srgb, {primary.400}, transparent 70%)'
        }
      }
    }
  }
});

const firebaseProviders = environment.firebase.apiKey
  ? [
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore())
    ]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: bunnyPreset,
        options: {
          darkModeSelector: 'none',
          cssLayer: true
        }
      }
    }),
    ...firebaseProviders
  ]
};
