import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { CalendarService } from '../../core/services/calendar.service';
import { AvailabilitySlot, AvailabilityStatus } from '../../shared/models/availability-slot.model';
import { DateUtilityService } from '../../shared/services/date-utility.service';
import { SeoService } from '../../core/services/seo.service';

interface CalendarDay {
  date: Date;
  isoDate: string;
  label: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  status?: AvailabilityStatus;
  isSelectable: boolean;
}

@Component({
  selector: 'app-availability-page',
  imports: [TitleCasePipe, PanelModule],
  templateUrl: './availability-page.component.html',
  styleUrl: './availability-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilityPageComponent {
  private readonly calendarService = inject(CalendarService);
  private readonly router = inject(Router);
  private readonly dateUtils = inject(DateUtilityService);
  private readonly seo = inject(SeoService);
  private readonly availability = toSignal(this.calendarService.availability$, { initialValue: [] });

  protected readonly dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  protected readonly currentMonth = signal(this.getMonthStart(new Date()));
  protected readonly monthLabel = computed(() =>
    this.dateUtils.formatReadableDate(this.currentMonth(), 'en-US', {
      month: 'long',
      year: 'numeric'
    })
  );
  protected readonly calendarWeeks = computed(() =>
    this.buildCalendarWeeks(this.currentMonth(), this.availability())
  );

  constructor() {
    this.seo.update({
      title: "Bunny's Balloons Availability Calendar | Reserve Your Install Date",
      description:
        'Browse the Bunny’s Balloons production calendar to find open install windows and submit your target date for luxury balloon garlands across Belleville, Michigan and the Detroit metro area.',
      path: '/calendar',
      type: 'website',
      keywords: [
        'balloon install availability',
        'book Belleville Michigan balloon stylist',
        'Detroit balloon schedule',
        'event date balloon install',
        'reserve balloon garland Michigan'
      ],
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: "Bunny's Balloons availability",
        potentialAction: {
          '@type': 'ScheduleAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.bunnysballoons.com/calendar'
          },
          result: {
            '@type': 'Reservation',
            name: 'Balloon install hold'
          }
        }
      }
    });
  }

  protected goToPreviousMonth(): void {
    const reference = this.currentMonth();
    this.currentMonth.set(new Date(reference.getFullYear(), reference.getMonth() - 1, 1));
  }

  protected goToNextMonth(): void {
    const reference = this.currentMonth();
    this.currentMonth.set(new Date(reference.getFullYear(), reference.getMonth() + 1, 1));
  }

  protected onDaySelected(day: CalendarDay): void {
    if (!day.isSelectable) {
      return;
    }

    void this.router.navigate(['/contact'], {
      queryParams: { eventDate: day.isoDate }
    });
  }

  protected trackWeek(_index: number, week: CalendarDay[]): string {
    return week[0]?.isoDate ?? String(_index);
  }

  protected trackDay(_index: number, day: CalendarDay): string {
    return day.isoDate;
  }

  private buildCalendarWeeks(monthStart: Date, slots: AvailabilitySlot[]): CalendarDay[][] {
    const slotMap = new Map(slots.map((slot) => [slot.date, slot.status]));
    const start = this.getStartOfWeek(monthStart);
    const endOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const end = this.getEndOfWeek(endOfMonth);
    const today = this.stripTime(new Date());

    const days: CalendarDay[] = [];
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const current = new Date(cursor);
      const isoDate = this.dateUtils.formatISODate(current);
      const isCurrentMonth = current.getMonth() === monthStart.getMonth();
      const isPast = this.isBeforeDay(current, today);
      days.push({
        date: current,
        isoDate,
        label: current.getDate(),
        isCurrentMonth,
        isToday: current.getTime() === today.getTime(),
        isPast,
        status: slotMap.get(isoDate),
        isSelectable: isCurrentMonth && !isPast
      });
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }

  private getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private getStartOfWeek(reference: Date): Date {
    const date = this.stripTime(new Date(reference));
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
  }

  private getEndOfWeek(reference: Date): Date {
    const date = this.stripTime(new Date(reference));
    const day = date.getDay();
    date.setDate(date.getDate() + (6 - day));
    return date;
  }

  private stripTime(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private isBeforeDay(date: Date, compareTo: Date): boolean {
    return this.stripTime(date).getTime() < compareTo.getTime();
  }
}
