import { Injectable } from '@angular/core';
import { NavigationLink } from '../../shared/models/navigation-link.model';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly primary: ReadonlyArray<NavigationLink> = Object.freeze([
    { label: 'Home', path: '/', exact: true },
    { label: 'About', path: '/about' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Packages', path: '/packages' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' }
  ]);

  get primaryLinks(): ReadonlyArray<NavigationLink> {
    return this.primary;
  }
}
