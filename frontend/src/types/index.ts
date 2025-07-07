export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  duration: number;
  image: string;
  rating: number;
  availableSpots: number;
}

export interface BookingRequest {
  tourId: string;
  userId: string;
  guests: number;
  date: string;
}

export interface SearchFilters {
  name?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}