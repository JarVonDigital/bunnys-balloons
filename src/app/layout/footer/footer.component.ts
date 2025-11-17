import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-footer',
  imports: [CardModule, ButtonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private readonly navigationService = inject(NavigationService);
  readonly currentYear = new Date().getFullYear();
  readonly location = {
    name: 'Belleville studio & showroom',
    street: '150 Main Street',
    cityStateZip: 'Belleville, MI 48111'
  };

  readonly phone = {
    display: '(512) 555-0145',
    href: 'tel:+15125550145'
  };

  readonly businessHours = [
    { label: 'Mon–Fri', value: '9:00a – 6:00p' },
    { label: 'Sat', value: '9:00a – 1:00p' },
    { label: 'Sun', value: 'By appointment only' }
  ] as const;

  readonly sitemapLinks = this.navigationService.primaryLinks;
}
