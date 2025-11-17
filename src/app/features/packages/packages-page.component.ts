import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PackagesService } from '../../core/services/packages.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-packages-page',
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  templateUrl: './packages-page.component.html',
  styleUrl: './packages-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackagesPageComponent {
  private readonly packagesService = inject(PackagesService);
  private readonly seo = inject(SeoService);

  protected readonly packages$ = this.packagesService.packages$;

  constructor() {
    this.seo.update({
      title: "Balloon Install Packages | Bunny's Balloons Detroit Metro",
      description:
        'Compare curated balloon garland, ceiling installation, and entry moment packages that keep Bunny’s Balloons espresso-and-oat palette while tailoring textures to your venue.',
      path: '/packages',
      type: 'product.group',
      keywords: [
        'balloon install packages',
        'Detroit balloon pricing',
        'Belleville Michigan balloon garlands cost',
        'corporate event balloon packages',
        'wedding balloon decor Detroit'
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Bunny’s Balloons Install Packages',
        provider: {
          '@type': 'LocalBusiness',
          name: "Bunny's Balloons"
        },
        areaServed: 'Southeast Michigan',
        offers: [
          {
            '@type': 'Offer',
            name: 'Grand Entry Moments',
            priceCurrency: 'USD',
            url: 'https://www.bunnysballoons.com/packages'
          },
          {
            '@type': 'Offer',
            name: 'Brand Activation Installs',
            priceCurrency: 'USD',
            url: 'https://www.bunnysballoons.com/packages'
          },
          {
            '@type': 'Offer',
            name: 'Parties & Showers',
            priceCurrency: 'USD',
            url: 'https://www.bunnysballoons.com/packages'
          }
        ]
      }
    });
  }
}
