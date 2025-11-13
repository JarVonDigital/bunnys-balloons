import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-footer',
  imports: [CardModule, ButtonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly location = {
    name: 'Studio & showroom',
    street: '2346 Artisan Row',
    cityStateZip: 'Austin, TX 78704'
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

  readonly sitemapLinks = [
    { label: 'Home', routerLink: '/' },
    { label: 'About', routerLink: '/about' },
    { label: 'Packages', routerLink: '/packages' },
    { label: 'Calendar', routerLink: '/calendar' },
    { label: 'Contact', routerLink: '/contact' }
  ] as const;
}
