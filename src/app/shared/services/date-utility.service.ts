import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateUtilityService {
  private readonly defaultReadableFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

  parseISODate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const [year, month, day] = value.split('-').map((segment) => Number(segment));
    if (!year || !month || !day) {
      return null;
    }

    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  formatISODate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatReadableDate(
    date: Date,
    locale = 'en-US',
    options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }
  ): string {
    if (locale === 'en-US' && options.dateStyle === 'long' && Object.keys(options).length === 1) {
      return this.defaultReadableFormatter.format(date);
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}

