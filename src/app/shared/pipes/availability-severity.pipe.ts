import { Pipe, PipeTransform } from '@angular/core';
import { AvailabilityStatus } from '../models/availability-slot.model';

@Pipe({
  name: 'availabilitySeverity',
  standalone: true
})
export class AvailabilitySeverityPipe implements PipeTransform {
  transform(status: AvailabilityStatus): 'success' | 'warn' | 'danger' {
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

