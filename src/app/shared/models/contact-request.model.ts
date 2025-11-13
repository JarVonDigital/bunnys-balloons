export interface ContactRequest {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  eventDate: string;
  message: string;
  packageId?: string;
  createdAt?: string;
}
