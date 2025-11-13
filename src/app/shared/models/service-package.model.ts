export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  includes: string[];
  addOns?: string[];
  durationHours?: number;
}
