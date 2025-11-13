import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FadeInOnScrollDirective } from '../../directives/fade-in-on-scroll.directive';

export type MosaicImage = {
  id: string;
  src: string;
  alt: string;
  layout?: 'tall' | 'wide' | 'standard';
};

@Component({
  selector: 'app-mosaic-gallery',
  standalone: true,
  imports: [FadeInOnScrollDirective],
  templateUrl: './mosaic-gallery.component.html',
  styleUrl: './mosaic-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MosaicGalleryComponent {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) heading!: string;
  @Input({ required: true }) description!: string;
  @Input() images: MosaicImage[] = [];
}
