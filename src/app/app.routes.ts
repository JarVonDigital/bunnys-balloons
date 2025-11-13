import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/site-shell/site-shell.component').then((m) => m.SiteShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home-page.component').then((m) => m.HomePageComponent)
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about-page.component').then((m) => m.AboutPageComponent)
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/availability-page.component').then(
            (m) => m.AvailabilityPageComponent
          )
      },
      {
        path: 'packages',
        loadComponent: () =>
          import('./features/packages/packages-page.component').then(
            (m) => m.PackagesPageComponent
          )
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact-page.component').then((m) => m.ContactPageComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      )
  }
];
