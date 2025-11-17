import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about-page',
  imports: [PanelModule, TagModule],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPageComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.update({
      title: "About Bunny's Balloons | Veronica Bunny, Belleville Balloon Artist",
      description:
        "Meet Veronica Bunny, the Belleville, Michigan balloon artist blending medical-grade precision with imaginative installs for weddings, showers, and corporate events.",
      path: '/about',
      type: 'profile',
      keywords: [
        "Veronica Bunny",
        "Bunny's Balloons owner",
        'Belleville Michigan balloon artist',
        'female balloon designer',
        'Detroit creative entrepreneur profile'
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: "About Bunny's Balloons",
        mainEntity: {
          '@type': 'Person',
          name: 'Veronica Bunny',
          jobTitle: 'Owner & Lead Balloon Artist',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Belleville',
            addressRegion: 'MI',
            addressCountry: 'US'
          }
        }
      }
    });
  }
}
