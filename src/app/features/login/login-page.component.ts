import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, InputTextModule, ButtonModule, CheckboxModule, MessageModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly seo = inject(SeoService);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  protected readonly isSubmitting = signal(false);
  protected readonly submitSuccess = signal(false);
  protected readonly submitError = signal<string | null>(null);

  constructor() {
    this.seo.update({
      title: "Client Login | Bunny's Balloons Planning Portal",
      description:
        "Securely access your Bunny's Balloons proposals, install timelines, sketches, and invoices. This client portal keeps Detroit-area celebrations organized in one place.",
      path: '/login',
      robots: 'noindex,nofollow',
      keywords: [
        "Bunny's Balloons login",
        'balloon planning portal',
        'client login Detroit balloon stylist'
      ]
    });
  }

  protected async submit(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);

    try {
      // Mocked async login flow. Replace with auth API when ready.
      await new Promise((resolve) => setTimeout(resolve, 600));
      this.submitSuccess.set(true);
      this.loginForm.controls.password.reset('');
    } catch (error) {
      console.error('Login failed', error);
      this.submitError.set('Unable to log in right now. Please try again shortly.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected controlHasError(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
