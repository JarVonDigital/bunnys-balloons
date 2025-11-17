import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ContactService } from '../../core/services/contact.service';
import { EventDateDialogComponent } from './event-date-dialog.component';
import { distinctUntilChanged, map, take } from 'rxjs';
import { ContactBalloonAnimationService } from './services/contact-balloon-animation.service';
import { AmbientBalloonComponent } from './components/ambient-balloon/ambient-balloon.component';
import { DateUtilityService } from '../../shared/services/date-utility.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact-page',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    MessageModule,
    ChipModule,
    DynamicDialogModule,
    AmbientBalloonComponent
  ],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService]
})
export class ContactPageComponent implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly contactService = inject(ContactService);
  private readonly dialogService = inject(DialogService);
  private readonly balloonAnimationService = inject(ContactBalloonAnimationService);
  private readonly dateUtils = inject(DateUtilityService);
  private readonly seo = inject(SeoService);

  @ViewChildren('balloon') private readonly balloonElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('contactFormRef') private formElement?: ElementRef<HTMLFormElement>;
  protected readonly activeBalloon = signal<'details' | 'event' | 'message' | null>(null);
  protected readonly highlights = [
    'Set up, delivery, and breakdown handled in a flat $75 logistics fee (large installs $125)',
    'A minimum two-hour on-site window keeps intricate builds stress-free',
    'Bookings need at least 2 weeks notice; rush slots are limited'
  ];

  protected readonly contactForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    eventDate: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
    packageId: ['']
  });

  protected readonly isSubmitting = signal(false);
  protected readonly submitSuccess = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  private dialogRef: DynamicDialogRef | null = null;

  constructor() {
    this.seo.update({
      title: "Contact Bunny's Balloons | Request a Custom Balloon Installation",
      description:
        "Share your event details to receive availability, mood board sketches, and investment guidance from Bunny's Balloons—serving Belleville, Michigan, Detroit, and Ann Arbor.",
      path: '/contact',
      type: 'ContactPage',
      keywords: [
        'contact Bunny’s Balloons',
        'book Belleville Michigan balloon artist',
        'Detroit balloon artist',
        'request balloon install quote',
        'Belleville balloon inquiries',
        'Detroit metro balloon contact'
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: "Contact Bunny's Balloons",
        url: 'https://www.bunnysballoons.com/contact',
        description:
          'Contact Bunny’s Balloons to request immersive balloon installations across Southeast Michigan.'
      }
    });

    this.route.queryParamMap
      .pipe(
        map((params) => params.get('eventDate')),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((dateParam) => this.prefillEventDate(dateParam));
  }

  ngAfterViewInit(): void {
    this.balloonAnimationService.initialize(this.balloonElements);
  }

  ngOnDestroy(): void {
    this.balloonAnimationService.destroy();
    this.dialogRef?.close();
  }

  protected async submit(): Promise<void> {
    if (this.contactForm.invalid || this.isSubmitting()) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.contactService.submitInquiry(this.contactForm.getRawValue());
      this.submitSuccess.set(true);
      this.contactForm.reset();
      this.resetActiveBalloon();
    } catch (error) {
      console.error('Contact submission failed', error);
      this.errorMessage.set('Unable to send your request right now. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected onBalloonFocus(section: 'details' | 'event' | 'message', balloon: HTMLElement): void {
    this.activeBalloon.set(section);
    this.balloonAnimationService.focusBalloon(balloon);
  }

  protected handleFormFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as HTMLElement | null;
    if (!nextTarget || !this.formElement?.nativeElement.contains(nextTarget)) {
      this.resetActiveBalloon();
    }
  }

  private resetActiveBalloon(): void {
    this.balloonAnimationService.resetFocusedBalloon();
    this.activeBalloon.set(null);
  }

  protected get eventDateLabel(): string {
    const rawValue = this.contactForm.controls.eventDate.value;
    const parsed = this.dateUtils.parseISODate(rawValue);

    if (!parsed) {
      return 'Select date';
    }

    return this.dateUtils.formatReadableDate(parsed);
  }

  protected isEventDateInvalid(): boolean {
    const control = this.contactForm.controls.eventDate;
    return control.invalid && (control.dirty || control.touched);
  }

  protected openEventDateDialog(): void {
    const presetDate = this.dateUtils.parseISODate(this.contactForm.controls.eventDate.value);

    this.dialogRef?.close();
    const dialogRef = this.dialogService.open(EventDateDialogComponent, {
      header: 'Select event date',
      width: '520px',
      modal: true,
      dismissableMask: true,
      appendTo: 'body',
      contentStyle: { overflow: 'visible' },
      breakpoints: {
        '960px': '70vw',
        '640px': '90vw'
      },
      data: {
        eventDate: presetDate ?? undefined
      }
    });

    if (!dialogRef) {
      return;
    }

    this.dialogRef = dialogRef;

    dialogRef.onClose.pipe(take(1)).subscribe({
      next: (selection?: Date | null) => {
        if (selection instanceof Date) {
          this.updateEventDateControl(this.dateUtils.formatISODate(selection));
          return;
        }

        if (selection === null) {
          this.updateEventDateControl('');
        }
      },
      complete: () => {
        this.dialogRef = null;
      }
    });
  }

  private updateEventDateControl(value: string): void {
    const control = this.contactForm.controls.eventDate;
    control.setValue(value);
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  private prefillEventDate(dateParam: string | null): void {
    if (!dateParam) {
      return;
    }

    const parsed = this.dateUtils.parseISODate(dateParam);
    if (!parsed) {
      return;
    }

    const formatted = this.dateUtils.formatISODate(parsed);
    if (this.contactForm.controls.eventDate.value === formatted) {
      return;
    }

    this.updateEventDateControl(formatted);
    this.submitSuccess.set(false);
  }
}
