import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CalendarService } from '../../core/services/calendar.service';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvailabilityStatus } from '../../shared/models/availability-slot.model';

@Component({
  selector: 'app-availability-page',
  imports: [
    AsyncPipe,
    DatePipe,
    TitleCasePipe,
    PanelModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule
  ],
  templateUrl: './availability-page.component.html',
  styleUrl: './availability-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilityPageComponent {
  private readonly calendarService = inject(CalendarService);

  protected readonly availability$ = this.calendarService.availability$;

  protected statusSeverity(status: AvailabilityStatus) {
    switch (status) {
      case 'open':
        return 'success';
      case 'held':
        return 'warn';
      default:
        return 'danger';
    }
  }
}
