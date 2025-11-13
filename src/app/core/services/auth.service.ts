import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  authState,
  signInWithPopup,
  signOut
} from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth, { optional: true });

  readonly user$: Observable<User | null> = this.auth ? authState(this.auth) : of(null);

  signInWithGoogle() {
    if (!this.auth) {
      return throwError(() => new Error('Firebase Auth is not configured.'));
    }

    return from(signInWithPopup(this.auth, new GoogleAuthProvider()));
  }

  signOut() {
    if (!this.auth) {
      return throwError(() => new Error('Firebase Auth is not configured.'));
    }

    return from(signOut(this.auth));
  }
}
