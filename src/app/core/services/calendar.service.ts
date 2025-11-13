import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { AvailabilitySlot } from '../../shared/models/availability-slot.model';
import { ContactRequest } from '../../shared/models/contact-request.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly firestore = inject(Firestore, { optional: true });
  private readonly availabilityRef = this.firestore
    ? collection(this.firestore, 'availability')
    : null;
  private readonly requestsRef = this.firestore ? collection(this.firestore, 'dateRequests') : null;

  readonly availability$: Observable<AvailabilitySlot[]> = this.availabilityRef
    ? (collectionData(this.availabilityRef, {
        idField: 'id'
      }) as Observable<AvailabilitySlot[]>)
    : of([]);

  requestDate(payload: ContactRequest): Promise<void> {
    if (!this.requestsRef) {
      return Promise.reject(new Error('Firestore is not configured.'));
    }

    return addDoc(this.requestsRef, {
      ...payload,
      createdAt: serverTimestamp()
    }).then(() => undefined);
  }
}
