import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-event-date-dialog',
  standalone: true,
  imports: [FormsModule, DatePickerModule, ButtonModule],
  templateUrl: './event-date-dialog.component.html',
  styleUrl: './event-date-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventDateDialogComponent {
  protected selectedDate: Date | null = null;

  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  constructor() {
    const preset = this.config.data?.eventDate;
    this.selectedDate = preset instanceof Date ? preset : null;
  }

  protected handleSelect(date: Date): void {
    if (!date) {
      return;
    }

    this.selectedDate = date;
    this.ref.close(date);
  }

  protected clearSelection(): void {
    this.selectedDate = null;
    this.ref.close(null);
  }
}
