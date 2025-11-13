import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { ContactRequest } from '../../shared/models/contact-request.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly firestore = inject(Firestore, { optional: true });
  private readonly inquiriesRef = this.firestore ? collection(this.firestore, 'contactRequests') : null;

  submitInquiry(payload: ContactRequest): Promise<void> {
    if (!this.inquiriesRef) {
      return Promise.reject(new Error('Firestore is not configured.'));
    }

    return addDoc(this.inquiriesRef, {
      ...payload,
      createdAt: serverTimestamp()
    }).then(() => undefined);
  }
}
