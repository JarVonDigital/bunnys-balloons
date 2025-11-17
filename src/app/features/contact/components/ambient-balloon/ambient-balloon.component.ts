import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input } from '@angular/core';
import { AmbientPointerService } from '../../services/ambient-pointer.service';

@Component({
  selector: 'app-ambient-balloon',
  standalone: true,
  template: '',
  styleUrl: './ambient-balloon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '(pointermove)': 'handlePointerMove($event)',
    '(pointerleave)': 'handlePointerLeave()'
  }
})
export class AmbientBalloonComponent {
  @Input() pointerRange = 24;
  @Input() variantClass = '';

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ambientPointer: AmbientPointerService
  ) {}

  @HostBinding('class')
  get hostClasses(): string {
    return ['contact__ambient-balloon', this.variantClass].filter(Boolean).join(' ');
  }

  private get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  handlePointerMove(event: PointerEvent): void {
    this.ambientPointer.applyPointer(this.element, event, this.pointerRange);
  }

  handlePointerLeave(): void {
    this.ambientPointer.resetPointer(this.element);
  }
}
