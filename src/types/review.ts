export interface ReviewEntry {
  id: string;
  reviewerName: string;
  reviewerInitials: string;
  countryCode: string;
  country: string;
  rating: number;
  title: string;
  comment: string;
  tags: string[];
  service: string;
  dateValue: string;
  relativeDate: string;
}
