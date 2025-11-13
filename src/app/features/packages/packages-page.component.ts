import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PackagesService } from '../../core/services/packages.service';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-packages-page',
  imports: [AsyncPipe, CurrencyPipe, PanelModule, CardModule],
  templateUrl: './packages-page.component.html',
  styleUrl: './packages-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackagesPageComponent {
  private readonly packagesService = inject(PackagesService);

  protected readonly packages$ = this.packagesService.packages$;
}
