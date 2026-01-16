// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
  bookingCount?: number;
}

// Vehicle types
export enum VehicleType {
  CAR = 'CAR',
  VAN = 'VAN',
  SUV = 'SUV',
  TRUCK = 'TRUCK',
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  color: string;
  imageUrl?: string;
}

// Booking types
export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  title?: string;
  description?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatarColor: string;
  };
  vehicle?: {
    id: string;
    name: string;
    type: VehicleType;
    color: string;
    licensePlate?: string;
  };
}

// Auth types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
}

export interface BookingsResponse {
  bookings: Booking[];
  upcoming?: Booking[];
  past?: Booking[];
}

export interface BookingResponse {
  booking: Booking;
  isOwner?: boolean;
}

// Form types
export interface BookingFormData {
  vehicleId: string;
  startTime: string;
  endTime: string;
  title?: string;
  description?: string;
}

// Calendar event type for FullCalendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    booking: Booking;
    isOwner: boolean;
  };
}
