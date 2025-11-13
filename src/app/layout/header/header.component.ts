import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  inject,
  ElementRef
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import tinycolor from 'tinycolor2';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private contrastFrame: number | null = null;

  @HostBinding('class.has-dark-backdrop')
  protected hasDarkBackdrop = false;

  protected readonly navLinks: MenuItem[] = [
    { label: 'Home', routerLink: ['/'], routerLinkActiveOptions: { exact: true } },
    { label: 'About', routerLink: ['/about'] },
    { label: 'Calendar', routerLink: ['/calendar'] },
    { label: 'Packages', routerLink: ['/packages'] },
    { label: 'Contact', routerLink: ['/contact'] }
  ];

  ngAfterViewInit(): void {
    this.scheduleContrastMeasurement();
  }

  @HostListener('window:scroll')
  protected handleScroll(): void {
    this.scheduleContrastMeasurement();
  }

  @HostListener('window:resize')
  protected handleResize(): void {
    this.scheduleContrastMeasurement();
  }

  ngOnDestroy(): void {
    if (this.contrastFrame !== null) {
      cancelAnimationFrame(this.contrastFrame);
    }
  }

  private scheduleContrastMeasurement(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.contrastFrame !== null) {
      return;
    }

    this.contrastFrame = requestAnimationFrame(() => {
      this.contrastFrame = null;
      this.measureBackdropContrast();
    });
  }

  private measureBackdropContrast(): void {
    const host = this.elementRef.nativeElement;
    const rect = host.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const sampleY = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
    const samplePoints = [
      rect.left + rect.width * 0.2,
      rect.left + rect.width * 0.5,
      rect.left + rect.width * 0.8
    ]
      .filter((x) => x >= 0 && x <= window.innerWidth);

    if (!samplePoints.length) {
      return;
    }

    const originalPointerEvents = host.style.pointerEvents;
    host.style.pointerEvents = 'none';

    const colors: string[] = [];
    for (const x of samplePoints) {
      const target = document.elementFromPoint(x, sampleY);
      const color = this.resolveBackgroundColor(target);
      if (color) {
        colors.push(color);
      }
    }

    host.style.pointerEvents = originalPointerEvents;

    if (!colors.length) {
      return;
    }

    const luminance =
      colors.map((value) => tinycolor(value).getLuminance()).reduce((sum, value) => sum + value, 0) /
      colors.length;

    this.hasDarkBackdrop = luminance < 0.45;
  }

  private resolveBackgroundColor(element: Element | null): string | null {
    if (!element) {
      return this.safeBodyColor();
    }

    let current: Element | null = element;
    while (current && current !== document.documentElement) {
      const color = this.extractColorFromElement(current as HTMLElement);
      if (color) {
        return color;
      }
      current = current.parentElement;
    }

    return this.safeBodyColor();
  }

  private extractColorFromElement(element: HTMLElement): string | null {
    const elementColor = this.pickColorFromStyles(getComputedStyle(element));
    if (elementColor) {
      return elementColor;
    }

    const beforeColor = this.pickColorFromStyles(getComputedStyle(element, '::before'));
    if (beforeColor) {
      return beforeColor;
    }

    const afterColor = this.pickColorFromStyles(getComputedStyle(element, '::after'));
    if (afterColor) {
      return afterColor;
    }

    return null;
  }

  private pickColorFromStyles(styles: CSSStyleDeclaration | null): string | null {
    if (!styles) {
      return null;
    }

    const backgroundColor = this.normalizeColor(styles.backgroundColor);
    if (backgroundColor) {
      return backgroundColor;
    }

    return this.colorFromBackgroundImage(styles.backgroundImage);
  }

  private colorFromBackgroundImage(backgroundImage: string | null): string | null {
    if (!backgroundImage || backgroundImage === 'none') {
      return null;
    }

    const match = backgroundImage.match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8})/);
    if (!match) {
      return null;
    }

    return this.normalizeColor(match[0]);
  }

  private normalizeColor(color: string | null): string | null {
    if (!color || color === 'transparent') {
      return null;
    }

    const parsed = tinycolor(color);
    if (!parsed.isValid()) {
      return null;
    }

    if (parsed.getAlpha() <= 0.1) {
      return null;
    }

    return parsed.toRgbString();
  }

  private safeBodyColor(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return getComputedStyle(document.body).backgroundColor || null;
  }
}
