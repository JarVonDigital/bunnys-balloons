import { ElementRef, Injectable, QueryList } from '@angular/core';
import gsap from 'gsap';

@Injectable({
  providedIn: 'root'
})
export class ContactBalloonAnimationService {
  private balloonElements: HTMLElement[] = [];
  private readonly focusTweens = new Map<HTMLElement, gsap.core.Animation>();
  private readonly neighborTweens = new Map<HTMLElement, gsap.core.Animation>();
  private balloonAnimations: gsap.core.Tween[] = [];
  private activeBalloonElement: HTMLElement | null = null;
  private activeLeftNeighbor: HTMLElement | null = null;
  private nextLayerBase = 4;

  initialize(balloonRefs: QueryList<ElementRef<HTMLElement>>): void {
    this.balloonElements = balloonRefs?.length
      ? balloonRefs.toArray().map((ref) => ref.nativeElement)
      : [];

    if (!this.balloonElements.length) {
      return;
    }

    this.initializeBalloonLayers();
    this.animateBalloons();
  }

  focusBalloon(element: HTMLElement): void {
    if (!element) {
      return;
    }

    if (this.activeBalloonElement && this.activeBalloonElement !== element) {
      this.animateBalloonFocus(this.activeBalloonElement, false);
    }

    this.activeBalloonElement = element;
    this.animateBalloonFocus(element, true);
    this.animateLeftNeighbor(element);
  }

  resetFocusedBalloon(): void {
    if (this.activeBalloonElement) {
      this.animateBalloonFocus(this.activeBalloonElement, false);
      this.activeBalloonElement = null;
    }

    this.resetLeftNeighbor();
  }

  destroy(): void {
    this.disposeBalloonAnimations();
    this.clearFocusTweens();
    this.clearNeighborTweens();
    this.activeBalloonElement = null;
    this.activeLeftNeighbor = null;
    this.nextLayerBase = 4;
    this.balloonElements = [];
  }

  private animateBalloons(): void {
    this.disposeBalloonAnimations();

    this.balloonElements.forEach((element, index) => {
      const duration = 5 + index * 0.8;
      const verticalDrift = 6 + index * 1.8;
      const horizontalDrift = 3 + index;
      const floatXStart = index % 2 === 0 ? `-${horizontalDrift}px` : `${horizontalDrift}px`;
      const floatXEnd = index % 2 === 0 ? `${horizontalDrift}px` : `-${horizontalDrift}px`;
      const tiltStart = index % 2 === 0 ? '-1.4deg' : '1.4deg';
      const tiltEnd = index % 2 === 0 ? '1.4deg' : '-1.4deg';

      const tween = gsap.fromTo(
        element,
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

    timeline.to(element, moveOut).to(element, returnHome);

    this.focusTweens.set(element, timeline);
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
    if (!this.balloonElements.length) {
      return null;
    }

    const activeRect = active.getBoundingClientRect();
    const activeCenter = activeRect.left + activeRect.width / 2;
    let closestElement: HTMLElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    this.balloonElements.forEach((element) => {
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

  private getFocusMotion(direction?: string): {
    axis: '--balloon-focus-x' | '--balloon-focus-y';
    amount: string;
  } {
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
    this.balloonElements.forEach((element, index) => {
      element.style.setProperty('--balloon-layer-base', `${index + 1}`);
    });

    this.nextLayerBase = this.balloonElements.length + 2;
  }

  private bumpLayer(element: HTMLElement): void {
    const layer = this.nextLayerBase++;
    element.style.setProperty('--balloon-layer-base', `${layer}`);
  }
}
