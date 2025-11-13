export type AvailabilityStatus = 'open' | 'held' | 'booked';

export interface AvailabilitySlot {
  id?: string;
  date: string; // ISO-8601 string
  status: AvailabilityStatus;
  notes?: string;
}
