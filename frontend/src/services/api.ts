import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  User,
  Vehicle,
  Booking,
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  BookingFormData,
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect here - let the auth context handle it
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Auth API
export const authApi = {
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/signup', credentials);
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Vehicles API
export const vehiclesApi = {
  getAll: async (): Promise<{ vehicles: Vehicle[] }> => {
    const { data } = await api.get('/vehicles');
    return data;
  },

  getById: async (id: string): Promise<{ vehicle: Vehicle }> => {
    const { data } = await api.get(`/vehicles/${id}`);
    return data;
  },
};

// Bookings API
export const bookingsApi = {
  getAll: async (params?: {
    vehicleId?: string;
    start?: string;
    end?: string;
    userId?: string;
  }): Promise<{ bookings: Booking[] }> => {
    const { data } = await api.get('/bookings', { params });
    return data;
  },

  getMy: async (): Promise<{
    bookings: Booking[];
    upcoming: Booking[];
    past: Booking[];
  }> => {
    const { data } = await api.get('/bookings/my');
    return data;
  },

  getById: async (id: string): Promise<{ booking: Booking; isOwner: boolean }> => {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  },

  create: async (bookingData: BookingFormData): Promise<{ booking: Booking; message: string }> => {
    const { data } = await api.post('/bookings', bookingData);
    return data;
  },

  update: async (
    id: string,
    bookingData: BookingFormData
  ): Promise<{ booking: Booking; message: string }> => {
    const { data } = await api.put(`/bookings/${id}`, bookingData);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/bookings/${id}`);
    return data;
  },
};

// Admin API
export const adminApi = {
  checkAdmin: async (): Promise<{ isAdmin: boolean; email: string }> => {
    const { data } = await api.get('/admin/check');
    return data;
  },

  getStats: async (): Promise<{
    stats: { users: number; vehicles: number; bookings: number };
    recentBookings: Booking[];
  }> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  getUsers: async (): Promise<{
    users: Array<{
      id: string;
      name: string;
      email: string;
      avatarColor: string;
      createdAt: string;
      bookingCount: number;
    }>;
  }> => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  getVehicles: async (): Promise<{ vehicles: Vehicle[] }> => {
    const { data } = await api.get('/admin/vehicles');
    return data;
  },

  createVehicle: async (vehicleData: {
    name: string;
    type: string;
    licensePlate: string;
    color: string;
  }): Promise<{ vehicle: Vehicle; message: string }> => {
    const { data } = await api.post('/admin/vehicles', vehicleData);
    return data;
  },

  updateVehicle: async (
    id: string,
    vehicleData: Partial<Vehicle>
  ): Promise<{ vehicle: Vehicle; message: string }> => {
    const { data } = await api.put(`/admin/vehicles/${id}`, vehicleData);
    return data;
  },

  deleteVehicle: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/vehicles/${id}`);
    return data;
  },

  getBookings: async (params?: {
    userId?: string;
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ bookings: Booking[]; total: number }> => {
    const { data } = await api.get('/admin/bookings', { params });
    return data;
  },

  updateBooking: async (
    id: string,
    bookingData: Partial<BookingFormData>
  ): Promise<{ booking: Booking; message: string }> => {
    const { data } = await api.put(`/admin/bookings/${id}`, bookingData);
    return data;
  },

  deleteBooking: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/bookings/${id}`);
    return data;
  },

  bulkDeleteBookings: async (ids: string[]): Promise<{ message: string }> => {
    const { data } = await api.post('/admin/bookings/bulk-delete', { ids });
    return data;
  },

  cleanupPastBookings: async (): Promise<{ message: string }> => {
    const { data } = await api.delete('/admin/bookings/cleanup/past');
    return data;
  },
};

export default api;
