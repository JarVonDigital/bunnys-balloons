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
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';
import gsap from 'gsap';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ContactService } from '../../core/services/contact.service';
import { EventDateDialogComponent } from './event-date-dialog.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-contact-page',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    MessageModule,
    ChipModule,
    DynamicDialogModule
  ],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService]
})
export class ContactPageComponent implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly dialogService = inject(DialogService);

  @ViewChildren('balloon') private readonly balloonElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('contactFormRef') private formElement?: ElementRef<HTMLFormElement>;
  private balloonAnimations: gsap.core.Tween[] = [];
  private readonly focusTweens = new Map<HTMLElement, gsap.core.Animation>();
  private readonly neighborTweens = new Map<HTMLElement, gsap.core.Animation>();
  private activeBalloonElement: HTMLElement | null = null;
  private activeLeftNeighbor: HTMLElement | null = null;
  private nextLayerBase = 4;
  protected readonly activeBalloon = signal<'details' | 'event' | 'message' | null>(null);
  protected readonly highlights = [
    'Full-service design, delivery, and teardown',
    '72-hour rush partnerships available',
    'Palette curation with Pantone-level color matching'
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
  private readonly readableDateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

  ngAfterViewInit(): void {
    this.initializeBalloonLayers();
    this.animateBalloons();
  }

  ngOnDestroy(): void {
    this.disposeBalloonAnimations();
    this.clearFocusTweens();
    this.clearNeighborTweens();
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
    if (this.activeBalloonElement && this.activeBalloonElement !== balloon) {
      this.animateBalloonFocus(this.activeBalloonElement, false);
    }

    this.activeBalloonElement = balloon;
    this.activeBalloon.set(section);
    this.animateBalloonFocus(balloon, true);
    this.animateLeftNeighbor(balloon);
  }

  protected handleFormFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as HTMLElement | null;
    if (!nextTarget || !this.formElement?.nativeElement.contains(nextTarget)) {
      this.resetActiveBalloon();
    }
  }

  protected handleAmbientPointer(event: PointerEvent, element: HTMLElement): void {
    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const relativeX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const relativeY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    const pointerRange = Number(element.dataset['pointerRange'] ?? 24);

    element.style.setProperty('--ambient-pointer-x', `${relativeX * pointerRange}px`);
    element.style.setProperty('--ambient-pointer-y', `${relativeY * pointerRange}px`);
    element.style.setProperty('--ambient-pointer-tilt', `${relativeX * 6}deg`);
  }

  protected resetAmbientPointerElement(element: HTMLElement): void {
    element.style.setProperty('--ambient-pointer-x', '0px');
    element.style.setProperty('--ambient-pointer-y', '0px');
    element.style.setProperty('--ambient-pointer-tilt', '0deg');
  }

  protected get eventDateLabel(): string {
    const rawValue = this.contactForm.controls.eventDate.value;
    const parsed = this.parseDateString(rawValue);

    if (!parsed) {
      return 'Select date';
    }

    return this.readableDateFormatter.format(parsed);
  }

  protected isEventDateInvalid(): boolean {
    const control = this.contactForm.controls.eventDate;
    return control.invalid && (control.dirty || control.touched);
  }

  protected openEventDateDialog(): void {
    const presetDate = this.parseDateString(this.contactForm.controls.eventDate.value);

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
          this.updateEventDateControl(this.formatDateForStorage(selection));
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

  private animateBalloons(): void {
    this.disposeBalloonAnimations();

    if (!this.balloonElements?.length) {
      return;
    }

    this.balloonElements.forEach((balloon, index) => {
      const duration = 5 + index * 0.8;
      const verticalDrift = 6 + index * 1.8;
      const horizontalDrift = 3 + index;
      const floatXStart = index % 2 === 0 ? `-${horizontalDrift}px` : `${horizontalDrift}px`;
      const floatXEnd = index % 2 === 0 ? `${horizontalDrift}px` : `-${horizontalDrift}px`;
      const tiltStart = index % 2 === 0 ? '-1.4deg' : '1.4deg';
      const tiltEnd = index % 2 === 0 ? '1.4deg' : '-1.4deg';

      const tween = gsap.fromTo(
        balloon.nativeElement,
        {
          '--balloon-float-y': `-${verticalDrift}px`,
          '--balloon-float-x': floatXStart,
          '--balloon-tilt': tiltStart
        },
        {
          '--balloon-float-y': `${verticalDrift}px`,
          '--balloon-float-x': floatXEnd,
          '--balloon-tilt': tiltEnd,
          duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.25
        }
      );

      this.balloonAnimations.push(tween);
    });
  }

  private disposeBalloonAnimations(): void {
    this.balloonAnimations.forEach((animation) => animation?.kill());
    this.balloonAnimations = [];
  }

  private animateBalloonFocus(element: HTMLElement, elevate: boolean): void {
    const existing = this.focusTweens.get(element);
    existing?.kill();

    if (!elevate) {
      const resetTween = gsap.to(element, {
        duration: 0.3,
        ease: 'power2.out',
        '--balloon-focus-x': '0px',
        '--balloon-focus-y': '0px',
        '--balloon-focus-scale': 1
      });

      this.focusTweens.set(element, resetTween);
      return;
    }

    const motion = this.getFocusMotion(element.dataset['focusDirection']);
    const timeline = gsap.timeline({
      defaults: {
        overwrite: true,
        duration: 1,
        ease: 'power1.inOut'
      },
      onComplete: () => {
        this.focusTweens.delete(element);
      }
    });

    const moveOut = this.buildFocusTweenVars(motion.axis, motion.amount);
    const returnHome = this.buildFocusTweenVars(motion.axis, '0px');

    timeline
      .to(element, moveOut)
      .to(element, returnHome);

    this.focusTweens.set(element, timeline);
  }

  private resetActiveBalloon(): void {
    if (this.activeBalloonElement) {
      this.animateBalloonFocus(this.activeBalloonElement, false);
      this.activeBalloonElement = null;
    }

    this.activeBalloon.set(null);
    this.resetLeftNeighbor();
  }

  private clearFocusTweens(): void {
    this.focusTweens.forEach((tween) => tween?.kill());
    this.focusTweens.clear();
  }

  private animateLeftNeighbor(active: HTMLElement): void {
    const leftNeighbor = this.findLeftNeighbor(active);

    if (!leftNeighbor) {
      this.resetLeftNeighbor();
      return;
    }

    if (this.activeLeftNeighbor && this.activeLeftNeighbor !== leftNeighbor) {
      this.resetLeftNeighbor();
    }

    this.activeLeftNeighbor = leftNeighbor;
    const existing = this.neighborTweens.get(leftNeighbor);
    existing?.kill();

    const timeline = gsap.timeline({
      defaults: { overwrite: true },
      onComplete: () => {
        this.bumpLayer(leftNeighbor);
        this.neighborTweens.delete(leftNeighbor);
      }
    });

    timeline
      .to(leftNeighbor, {
        duration: 0.55,
        ease: 'power2.out',
        '--balloon-peer-slide-x': '-100px',
        '--balloon-peer-bob-y': '8px',
        '--balloon-peer-tilt': '-3deg'
      })
      .to(leftNeighbor, {
        duration: 0.65,
        ease: 'elastic.out(1, 0.7)',
        '--balloon-peer-slide-x': '0px',
        '--balloon-peer-bob-y': '0px',
        '--balloon-peer-tilt': '0deg'
      });

    this.neighborTweens.set(leftNeighbor, timeline);
  }

  private findLeftNeighbor(active: HTMLElement): HTMLElement | null {
    if (!this.balloonElements?.length) {
      return null;
    }

    const activeRect = active.getBoundingClientRect();
    const activeCenter = activeRect.left + activeRect.width / 2;
    let closestElement: HTMLElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    this.balloonElements.forEach((balloonRef) => {
      const element = balloonRef.nativeElement;
      if (element === active) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      if (center < activeCenter) {
        const distance = activeCenter - center;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestElement = element;
        }
      }
    });

    return closestElement;
  }

  private resetLeftNeighbor(): void {
    if (!this.activeLeftNeighbor) {
      return;
    }

    const element = this.activeLeftNeighbor;
    const tween = this.neighborTweens.get(element);
    tween?.kill();

    gsap.to(element, {
      duration: 0.3,
      ease: 'sine.out',
      '--balloon-peer-slide-x': '0px',
      '--balloon-peer-bob-y': '0px',
      '--balloon-peer-tilt': '0deg'
    });

    this.neighborTweens.delete(element);
    this.activeLeftNeighbor = null;
  }

  private clearNeighborTweens(): void {
    this.resetLeftNeighbor();
    this.neighborTweens.forEach((tween) => tween?.kill());
    this.neighborTweens.clear();
  }

  private getFocusMotion(direction?: string): { axis: '--balloon-focus-x' | '--balloon-focus-y'; amount: string } {
    if (direction === 'left') {
      return { axis: '--balloon-focus-x', amount: '-100px' };
    }
    if (direction === 'right') {
      return { axis: '--balloon-focus-x', amount: '100px' };
    }
    return { axis: '--balloon-focus-y', amount: '-120px' };
  }

  private buildFocusTweenVars(
    property: '--balloon-focus-x' | '--balloon-focus-y',
    value: string
  ): gsap.TweenVars {
    const vars: gsap.TweenVars = {};
    (vars as Record<string, string | number>)[property] = value;
    return vars;
  }

  private initializeBalloonLayers(): void {
    if (!this.balloonElements?.length) {
      return;
    }

    this.balloonElements.forEach((balloon, index) => {
      balloon.nativeElement.style.setProperty('--balloon-layer-base', `${index + 1}`);
    });

    this.nextLayerBase = this.balloonElements.length + 2;
  }

  private bumpLayer(element: HTMLElement): void {
    const layer = this.nextLayerBase++;
    element.style.setProperty('--balloon-layer-base', `${layer}`);
  }

  private parseDateString(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const [year, month, day] = value.split('-').map((segment) => Number(segment));
    if (!year || !month || !day) {
      return null;
    }

    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatDateForStorage(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateEventDateControl(value: string): void {
    const control = this.contactForm.controls.eventDate;
    control.setValue(value);
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();
  }
}
