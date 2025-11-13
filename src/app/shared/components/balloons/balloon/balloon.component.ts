import { isPlatformBrowser, NgStyle } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';
import { BalloonConfig } from '../../../models/balloon.model';
import lottie, { AnimationItem } from 'lottie-web';

const DEFAULT_STRING_ANIMATION = 'assets/animations/balloon-string.json';
const BASE_STRING_DURATION = 3; // seconds

@Component({
  selector: 'app-balloon',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './balloon.component.html',
  styleUrl: './balloon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalloonComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) config!: BalloonConfig;

  @ViewChild('stringHost', { static: true })
  private readonly stringHost?: ElementRef<HTMLSpanElement>;

  protected hasAnimatedString = false;
  private stringAnimation?: AnimationItem;

  protected get balloonStyles(): Record<string, string> {
    return {
      '--balloon-width': `${this.config.width ?? 110}px`,
      '--balloon-height': `${this.config.height ?? 150}px`,
      '--balloon-string-length': `${this.config.stringLength ?? 45}px`,
      '--balloon-string-width': `${this.computeStringWidth()}px`,
      '--balloon-string-lean': `${this.computeStringLean()}deg`,
      '--balloon-string-bend': `${this.config.stringBend ?? 12}deg`,
      '--balloon-string-wave-amplitude': `${this.config.stringWaveAmplitude ?? 8}px`,
      '--balloon-string-wave-duration': `${this.config.stringWaveDuration ?? 5.2}s`,
      '--balloon-string-wave-delay': `${this.config.stringWaveDelay ?? 0}s`,
      '--balloon-fill':
        this.config.gradient ??
        'radial-gradient(circle at 30% 30%, #fff5d6, #f0bb4f 60%, #c8862b)',
      '--balloon-base-x': `${this.config.translateX ?? 0}px`,
      '--balloon-base-y': `${this.config.translateY ?? 0}px`,
      '--balloon-drift-x': '0px',
      '--balloon-drift-y': '0px',
      '--balloon-rotate': '0deg',
      zIndex: `${this.config.zIndex ?? 1}`
    };
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.stringHost) {
      return;
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const path = this.config.stringAnimationPath ?? DEFAULT_STRING_ANIMATION;
    this.stringAnimation = lottie.loadAnimation({
      container: this.stringHost.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMin meet',
        progressiveLoad: true
      }
    });

    const teardown = () => this.stringAnimation?.destroy();
    this.destroyRef.onDestroy(teardown);

    this.stringAnimation.addEventListener('DOMLoaded', () => {
      if (!this.stringAnimation) {
        return;
      }

      const speed = this.computeAnimationSpeed();
      this.stringAnimation.setSpeed(speed);
      this.applyInitialDelay(speed);
      this.stringAnimation.play();
      this.hasAnimatedString = true;
    });
  }

  private computeStringWidth(): number {
    const amplitude = this.config.stringWaveAmplitude ?? 10;
    return this.clamp(amplitude * 2.4, 28, 60);
  }

  private computeStringLean(): number {
    return (this.config.stringBend ?? 0) * 0.08;
  }

  private computeAnimationSpeed(): number {
    const desiredDuration = Math.max(this.config.stringWaveDuration ?? BASE_STRING_DURATION, 1);
    const baseDuration = BASE_STRING_DURATION;
    const speed = baseDuration / desiredDuration;
    return this.clamp(speed, 0.35, 2);
  }

  private applyInitialDelay(speed: number): void {
    if (!this.stringAnimation) {
      return;
    }

    const delaySeconds = this.config.stringWaveDelay ?? 0;
    if (!delaySeconds) {
      return;
    }

    const desiredDuration = Math.max(this.config.stringWaveDuration ?? BASE_STRING_DURATION, 1);
    const normalizedDelay = ((delaySeconds % desiredDuration) + desiredDuration) % desiredDuration;
    const progress = normalizedDelay / desiredDuration;
    const frame = progress * this.stringAnimation.totalFrames;
    this.stringAnimation.goToAndPlay(frame, true);
    this.stringAnimation.setSpeed(speed);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
