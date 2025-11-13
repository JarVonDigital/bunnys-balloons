import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  DestroyRef,
  Directive,
  ElementRef,
  Input,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { gsap } from '../utils/gsap-helpers';

export interface FadeInOnScrollConfig {
  /**
   * Offset in pixels used to start the animation before/after the element enters view.
   */
  start?: string;
  duration?: number;
  delay?: number;
  /**
   * The initial vertical offset.
   */
  y?: number;
  once?: boolean;
}

@Directive({
  selector: '[appFadeInOnScroll]',
  standalone: true
})
export class FadeInOnScrollDirective implements AfterViewInit {
  private config?: FadeInOnScrollConfig;
  private hasPlayed = false;
  private observer?: IntersectionObserver;
  private tween?: gsap.core.Tween;

  @Input('appFadeInOnScroll')
  set configInput(value: FadeInOnScrollConfig | '' | null | undefined) {
    this.config = value && typeof value === 'object' ? value : undefined;
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = this.host.nativeElement;
    const { start = 'top 85%', duration = 0.8, delay = 0, y = 40, once = true } = this.config ?? {};

    gsap.set(element, { opacity: 0, y });

    this.tween = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power2.out',
      paused: true
    });

    const play = (immediate = false) => {
      if (once && this.hasPlayed) {
        return;
      }

      this.hasPlayed = true;
      if (immediate) {
        this.tween?.progress(1).pause();
        return;
      }

      this.tween?.restart();
    };

    const reverse = () => {
      if (once) {
        return;
      }

      this.tween?.reverse();
    };

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              play();
              if (once) {
                this.observer?.unobserve(entry.target as Element);
              }
            } else {
              reverse();
            }
          });
        },
        {
          root: null,
          threshold: 0,
          rootMargin: this.resolveRootMargin(start)
        }
      );

      this.observer.observe(element);
    } else {
      play(true);
    }

    const fallbackId = window.setTimeout(() => {
      if (!this.hasPlayed) {
        play(true);
      }
    }, 800);

    this.destroyRef.onDestroy(() => {
      window.clearTimeout(fallbackId);
      this.observer?.disconnect();
      this.tween?.kill();
      gsap.set(element, { clearProps: 'opacity,transform' });
    });
  }

  private resolveRootMargin(start: string): string {
    const percentMatch = /top\s+(\d+)%/i.exec(start);
    if (percentMatch) {
      const percent = Math.max(0, Math.min(100, Number(percentMatch[1])));
      const bottomOffset = 100 - percent;
      return `0px 0px -${bottomOffset}% 0px`;
    }

    const pixelMatch = /top\s+(-?\d+)px/i.exec(start);
    if (pixelMatch) {
      const pixels = Number(pixelMatch[1]);
      // Positive pixels mean trigger later (scroll further), so shrink bottom margin.
      return `0px 0px ${-pixels}px 0px`;
    }

    return '0px 0px -15% 0px';
  }
}
