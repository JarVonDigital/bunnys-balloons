import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { BalloonClusterComponent } from '../../shared/components/balloons/balloon-cluster/balloon-cluster.component';
import { BalloonConfig } from '../../shared/models/balloon.model';
import { FadeInOnScrollDirective } from '../../shared/directives/fade-in-on-scroll.directive';
import { MosaicGalleryComponent, MosaicImage } from '../../shared/components/mosaic-gallery/mosaic-gallery.component';

@Component({
  selector: 'app-home-page',
  imports: [
    CardModule,
    ButtonModule,
    ChipModule,
    RouterLink,
    BalloonClusterComponent,
    FadeInOnScrollDirective,
    MosaicGalleryComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  protected readonly heroBalloons: BalloonConfig[] = [
    {
      id: 'primary',
      gradient: 'radial-gradient(circle at 30% 30%, #fff6d6, #f0b444)',
      translateX: 0,
      translateY: 0,
      floatRange: 120,
      horizontalDrift: 40,
      rotationRange: 6,
      zIndex: 3,
      stringLength: 276,
      stringBend: 12,
      stringWaveAmplitude: 12,
      stringWaveDuration: 5.4,
      stringWaveDelay: 0
    },
    {
      id: 'secondary',
      gradient: 'radial-gradient(circle at 30% 30%, #fff1cc, #d9a04a)',
      translateX: 0,
      translateY: 20,
      floatRange: 90,
      horizontalDrift: 30,
      rotationRange: 4,
      zIndex: 2,
      stringLength: 252,
      stringBend: 10,
      stringWaveAmplitude: 10,
      stringWaveDuration: 4.8,
      stringWaveDelay: -0.3
    },
    {
      id: 'accent',
      gradient: 'radial-gradient(circle at 30% 30%, #fff8e8, #f8d88f)',
      translateX: 0,
      translateY: -10,
      floatRange: 140,
      horizontalDrift: 28,
      rotationRange: 7,
      zIndex: 4,
      stringLength: 294,
      stringBend: 14,
      stringWaveAmplitude: 13,
      stringWaveDuration: 5.8,
      stringWaveDelay: 0.15
    },
    {
      id: 'rose-backdrop',
      gradient: 'radial-gradient(circle at 35% 35%, #ffe2f3, #f5a8c9 70%)',
      translateX: -42,
      translateY: 48,
      floatRange: 80,
      horizontalDrift: 24,
      rotationRange: 5,
      zIndex: 1,
      stringLength: 312,
      stringBend: 11,
      stringWaveAmplitude: 9,
      stringWaveDuration: 5.1,
      stringWaveDelay: -0.45
    },
    {
      id: 'citrus-glow',
      gradient: 'radial-gradient(circle at 30% 30%, #fff1d0, #f6c46f 60%, #f0902d)',
      translateX: 36,
      translateY: 60,
      floatRange: 110,
      horizontalDrift: 34,
      rotationRange: 6,
      zIndex: 2,
      stringLength: 288,
      stringBend: 13,
      stringWaveAmplitude: 11,
      stringWaveDuration: 5.6,
      stringWaveDelay: 0.25
    },
    {
      id: 'lavender-haze',
      gradient: 'radial-gradient(circle at 30% 30%, #f8f0ff, #c7a2ff)',
      translateX: -18,
      translateY: -34,
      floatRange: 150,
      horizontalDrift: 32,
      rotationRange: 8,
      zIndex: 5,
      stringLength: 306,
      stringBend: 12,
      stringWaveAmplitude: 14,
      stringWaveDuration: 6,
      stringWaveDelay: -0.1
    }
  ];

  protected readonly galleryEyebrow = 'Recent installs';
  protected readonly galleryHeading = 'Mosaic moments from weddings and launch weekends.';
  protected readonly galleryCopy =
    'Organic arches, suspended ribbons, and neon pairings that show how we sculpt balloons into immersive storylines.';

  protected readonly galleryImages: MosaicImage[] = [
    {
      id: 'gallery-1',
      src: '/arch-1.jpg',
      alt: 'Sunlit wedding balloon arch in blush and cream tones',
      layout: 'tall'
    },
    {
      id: 'gallery-2',
      src: '/arch-2.jpg',
      alt: 'Modern indoor balloon cloud with metallic accents',
      layout: 'wide'
    },
    {
      id: 'gallery-3',
      src: '/arch-3.jpg',
      alt: 'Colorful ceremony backdrop with cascading balloons',
      layout: 'standard'
    },
    {
      id: 'gallery-4',
      src: '/arch-4.jpg',
      alt: 'Garden cocktail hour with luxe balloon garland',
      layout: 'wide'
    }
  ];
}
