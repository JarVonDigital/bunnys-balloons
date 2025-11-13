import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { ServicePackage } from '../../shared/models/service-package.model';

@Injectable({ providedIn: 'root' })
export class PackagesService {
  private readonly firestore = inject(Firestore, { optional: true });
  private readonly packagesRef = this.firestore ? collection(this.firestore, 'packages') : null;

  private readonly fallback = signal<ServicePackage[]>([
    {
      id: 'organic-installs',
      title: 'Organic Installations',
      description: 'Statement-making arches, cascades, and photo-ready feature walls.',
      startingPrice: 750,
      includes: ['Design consult', 'Color story curation', 'On-site install & strike']
    },
    {
      id: 'intimate-gatherings',
      title: 'Intimate Gatherings',
      description: 'Mini garlands and whimsical clusters sized for homes and boutiques.',
      startingPrice: 350,
      includes: ['Up to 12ft garland', 'Delivery within 20 miles', 'Basic installation hardware']
    }
  ]);

  readonly packages$: Observable<ServicePackage[]> = this.packagesRef
    ? (collectionData(this.packagesRef, {
        idField: 'id'
      }) as Observable<ServicePackage[]>)
    : of(this.fallback());

  /** Local fallback data when Firestore is not yet configured. */
  readonly fallbackPackages = this.fallback.asReadonly();
}
