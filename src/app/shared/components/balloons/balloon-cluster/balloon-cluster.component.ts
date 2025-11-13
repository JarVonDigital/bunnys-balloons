import { isPlatformBrowser, NgStyle } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  inject
} from '@angular/core';
import { BalloonConfig } from '../../../models/balloon.model';
import { BalloonComponent } from '../balloon/balloon.component';
import { ensureScrollTriggerRegistered, gsap, ScrollTrigger } from '../../../utils/gsap-helpers';

interface BalloonState {
  el: HTMLElement;
  config: BalloonConfig;
  zIndex: number;
  limits: { x: number; y: number };
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  baseCenter: { x: number; y: number };
  radius: number;
  mass: number;
  rotationRange: number;
  wobble: {
    timeX: number;
    timeY: number;
    speedX: number;
    speedY: number;
    magnitudeX: number;
    magnitudeY: number;
  };
  setters: {
    x: ReturnType<typeof gsap.quickSetter>;
    y: ReturnType<typeof gsap.quickSetter>;
    rotate: ReturnType<typeof gsap.quickSetter>;
  };
}

@Component({
  selector: 'app-balloon-cluster',
  standalone: true,
  imports: [NgStyle, BalloonComponent],
  templateUrl: './balloon-cluster.component.html',
  styleUrl: './balloon-cluster.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalloonClusterComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private balloonStates: BalloonState[] = [];
  private scrollTrigger?: ScrollTrigger;
  private resizeObserver?: ResizeObserver;
  private simulationRunning = false;
  private readonly simulationTick = () => this.stepSimulation();
  private readonly measureBalloonLayout = () => this.captureBalloonLayout();

  @Input() balloons: BalloonConfig[] = [];
  @Input() gap = 16;
  @Input() align: 'flex-start' | 'center' | 'flex-end' = 'flex-end';
  @Input() justify: 'flex-start' | 'center' | 'flex-end' = 'flex-start';

  @ViewChildren(BalloonComponent, { read: ElementRef })
  private readonly balloonElements!: QueryList<ElementRef<HTMLElement>>;

  protected get clusterStyles(): Record<string, string> {
    return {
      '--balloon-cluster-gap': `${this.gap}px`,
      'align-items': this.align,
      'justify-content': this.justify
    };
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.balloonElements?.length) {
      return;
    }

    ensureScrollTriggerRegistered();
    const hostElement = this.host.nativeElement;
    const ctx = gsap.context(() => {
      this.initializeBalloonStates();
      this.attachResizeObserver();
      this.startSimulationLoop();

      this.scrollTrigger = ScrollTrigger.create({
        trigger: hostElement,
        start: 'top bottom',
        end: 'bottom top-=80',
        onUpdate: (self) => this.handleScrollUpdate(self.getVelocity())
      });

      ScrollTrigger.addEventListener('refresh', this.measureBalloonLayout);
    }, hostElement);

    this.destroyRef.onDestroy(() => {
      this.stopSimulationLoop();
      this.scrollTrigger?.kill();
      ScrollTrigger.removeEventListener('refresh', this.measureBalloonLayout);
      this.resizeObserver?.disconnect();
      ctx?.revert();
    });
  }

  private initializeBalloonStates(): void {
    const elements = this.balloonElements?.toArray() ?? [];
    this.balloonStates = elements.map((balloonEl, index) => {
      const el = balloonEl.nativeElement;
      const config = this.balloons[index] ?? {};
      const horizontalRange = Math.max(config.horizontalDrift ?? 30, 8);
      const verticalRange = Math.max(config.floatRange ?? 90, 12);
      const width = config.width ?? 110;
      const height = config.height ?? 150;
      const mass = Math.max((width * height) / 12000, 0.75);
      const wobbleMagnitudeX = Math.min(horizontalRange * 0.18, 8);
      const wobbleMagnitudeY = Math.min(verticalRange * 0.2, 12);

      return {
        el,
        config,
        zIndex: config.zIndex ?? 1,
        limits: { x: horizontalRange, y: verticalRange },
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        baseCenter: { x: 0, y: 0 },
        radius: Math.min(width, height) * 0.48,
        mass,
        rotationRange: config.rotationRange ?? 6,
        wobble: {
          timeX: gsap.utils.random(0, Math.PI * 2, 0.001),
          timeY: gsap.utils.random(0, Math.PI * 2, 0.001),
          speedX: gsap.utils.random(0.003, 0.007),
          speedY: gsap.utils.random(0.0025, 0.006),
          magnitudeX: wobbleMagnitudeX,
          magnitudeY: wobbleMagnitudeY
        },
        setters: {
          x: gsap.quickSetter(el, '--balloon-drift-x', 'px'),
          y: gsap.quickSetter(el, '--balloon-drift-y', 'px'),
          rotate: gsap.quickSetter(el, '--balloon-rotate', 'deg')
        }
      };
    });

    requestAnimationFrame(() => this.captureBalloonLayout());
  }

  private attachResizeObserver(): void {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.captureBalloonLayout());
    this.resizeObserver.observe(this.host.nativeElement);
  }

  private startSimulationLoop(): void {
    if (!this.balloonStates.length || this.simulationRunning) {
      return;
    }

    gsap.ticker.add(this.simulationTick);
    this.simulationRunning = true;
  }

  private stopSimulationLoop(): void {
    if (!this.simulationRunning) {
      return;
    }

    gsap.ticker.remove(this.simulationTick);
    this.simulationRunning = false;
  }

  private handleScrollUpdate(velocity: number): void {
    if (!this.balloonStates.length) {
      return;
    }

    const clamped = gsap.utils.clamp(-3000, 3000, velocity);
    if (Math.abs(clamped) < 5) {
      return;
    }

    const verticalImpulse = -clamped * 0.006;
    const horizontalImpulse = clamped * 0.0012;

    this.balloonStates.forEach((state, index) => {
      const parity = index % 2 === 0 ? 1 : -1;
      const massInv = 1 / state.mass;
      state.velocity.y += verticalImpulse * massInv * (state.limits.y / 120);
      state.velocity.x += horizontalImpulse * parity * massInv * (state.limits.x / 60);
    });
  }

  private captureBalloonLayout(): void {
    if (!this.balloonStates.length) {
      return;
    }

    const containerRect = this.host.nativeElement.getBoundingClientRect();
    this.balloonStates.forEach((state) => {
      const rect = state.el.getBoundingClientRect();
      const centerX = rect.left - containerRect.left + rect.width / 2;
      const centerY = rect.top - containerRect.top + rect.height / 2;

      state.baseCenter.x = centerX - state.position.x;
      state.baseCenter.y = centerY - state.position.y;
      state.radius = Math.min(rect.width, rect.height) * 0.48;
    });
  }

  private stepSimulation(): void {
    if (!this.balloonStates.length) {
      return;
    }

    const damping = 0.95;
    const spring = 0.006;
    const buoyancy = 0.12;

    this.balloonStates.forEach((state) => {
      state.wobble.timeX += state.wobble.speedX;
      state.wobble.timeY += state.wobble.speedY;
      const wobbleForceX = Math.sin(state.wobble.timeX) * state.wobble.magnitudeX * 0.0016;
      const wobbleForceY = Math.sin(state.wobble.timeY) * state.wobble.magnitudeY * 0.0012;

      const targetY = -state.limits.y * 0.2;
      state.velocity.x += -state.position.x * spring + wobbleForceX;
      state.velocity.y += (-state.position.y + targetY) * spring + buoyancy * (1 / state.mass) + wobbleForceY;

      state.velocity.x *= damping;
      state.velocity.y *= damping;

      const maxVelocityX = Math.max(state.limits.x * 0.12, 0.4);
      const maxVelocityY = Math.max(state.limits.y * 0.12, 0.4);
      state.velocity.x = gsap.utils.clamp(-maxVelocityX, maxVelocityX, state.velocity.x);
      state.velocity.y = gsap.utils.clamp(-maxVelocityY, maxVelocityY, state.velocity.y);

      state.position.x += state.velocity.x;
      state.position.y += state.velocity.y;

      this.enforceBounds(state);
    });

    this.resolveCollisions();

    this.balloonStates.forEach((state) => {
      state.setters.x(state.position.x);
      state.setters.y(state.position.y);

      const rotation = gsap.utils.clamp(
        -state.rotationRange,
        state.rotationRange,
        (state.velocity.x / Math.max(state.limits.x, 1)) * state.rotationRange * 1.5
      );
      state.setters.rotate(rotation);
    });
  }

  private enforceBounds(state: BalloonState): void {
    const maxX = state.limits.x;
    const maxY = state.limits.y;

    if (maxX > 0) {
      if (state.position.x > maxX) {
        state.position.x = maxX;
        state.velocity.x *= -0.55;
      } else if (state.position.x < -maxX) {
        state.position.x = -maxX;
        state.velocity.x *= -0.55;
      }
    }

    if (maxY > 0) {
      if (state.position.y > maxY) {
        state.position.y = maxY;
        state.velocity.y *= -0.5;
      } else if (state.position.y < -maxY) {
        state.position.y = -maxY;
        state.velocity.y *= -0.5;
      }
    }
  }

  private resolveCollisions(): void {
    if (this.balloonStates.length < 2) {
      return;
    }

    const groups = new Map<number, BalloonState[]>();
    this.balloonStates.forEach((state) => {
      const group = groups.get(state.zIndex);
      if (group) {
        group.push(state);
      } else {
        groups.set(state.zIndex, [state]);
      }
    });

    groups.forEach((group) => {
      for (let i = 0; i < group.length; i += 1) {
        for (let j = i + 1; j < group.length; j += 1) {
          this.resolvePair(group[i], group[j]);
        }
      }
    });
  }

  private resolvePair(a: BalloonState, b: BalloonState): void {
    const ax = a.baseCenter.x + a.position.x;
    const ay = a.baseCenter.y + a.position.y;
    const bx = b.baseCenter.x + b.position.x;
    const by = b.baseCenter.y + b.position.y;

    const dx = bx - ax;
    const dy = by - ay;
    const distance = Math.hypot(dx, dy) || 0.0001;
    const minDistance = a.radius + b.radius;

    if (distance >= minDistance) {
      return;
    }

    const overlap = minDistance - distance + 0.5;
    const nx = dx / distance;
    const ny = dy / distance;
    const totalMass = a.mass + b.mass;
    const separationA = (overlap * (b.mass / totalMass));
    const separationB = (overlap * (a.mass / totalMass));

    a.position.x -= nx * separationA;
    a.position.y -= ny * separationA;
    b.position.x += nx * separationB;
    b.position.y += ny * separationB;

    const relativeVelocity = (b.velocity.x - a.velocity.x) * nx + (b.velocity.y - a.velocity.y) * ny;
    if (relativeVelocity >= 0) {
      return;
    }

    const restitution = 0.65;
    const impulse = ((-1 - restitution) * relativeVelocity) / totalMass;

    a.velocity.x -= impulse * b.mass * nx;
    a.velocity.y -= impulse * b.mass * ny;
    b.velocity.x += impulse * a.mass * nx;
    b.velocity.y += impulse * a.mass * ny;

    this.enforceBounds(a);
    this.enforceBounds(b);
  }
}
