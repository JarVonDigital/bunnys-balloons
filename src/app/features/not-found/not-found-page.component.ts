import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPageComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.update({
      title: 'Page Not Found | Bunny’s Balloons',
      description:
        'Looks like the page you tried to visit drifted off. Use the main navigation to explore Bunny’s Balloons services across Belleville, Michigan.',
      path: '/404',
      robots: 'noindex,follow'
    });
  }
}
