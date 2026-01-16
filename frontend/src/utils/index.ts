import { format, parseISO, isToday, isTomorrow, isPast, isFuture, isSameDay } from 'date-fns';
import { VehicleType } from '../types';

/**
 * Format a date string or Date object for display
 */
export const formatDate = (date: string | Date, formatStr?: string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (formatStr) {
    return format(dateObj, formatStr);
  }
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, 'MMM d')}`;
  }
  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, 'MMM d')}`;
  }
  return format(dateObj, 'EEEE, MMM d');
};

/**
 * Format a time string or Date object for display
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
};

/**
 * Format a date range for display
 */
export const formatDateRange = (start: string | Date, end: string | Date): string => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  if (isSameDay(startDate, endDate)) {
    return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  }
  
  return `${format(startDate, 'MMM d, h:mm a')} - ${format(endDate, 'MMM d, h:mm a')}`;
};

/**
 * Format a time range for display
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Format date for form input (datetime-local)
 */
export const formatForInput = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Check if a booking is in the past
 */
export const isBookingPast = (endTime: string): boolean => {
  return isPast(parseISO(endTime));
};

/**
 * Check if a booking is upcoming
 */
export const isBookingUpcoming = (endTime: string): boolean => {
  return isFuture(parseISO(endTime));
};

/**
 * Get vehicle type display name
 */
export const getVehicleTypeLabel = (type: VehicleType): string => {
  const labels: Record<VehicleType, string> = {
    [VehicleType.CAR]: 'Car',
    [VehicleType.VAN]: 'Van',
    [VehicleType.SUV]: 'SUV',
    [VehicleType.TRUCK]: 'Truck',
  };
  return labels[type] || type;
};

/**
 * Get vehicle icon name based on type
 */
export const getVehicleIcon = (type: VehicleType): string => {
  const icons: Record<VehicleType, string> = {
    [VehicleType.CAR]: 'car',
    [VehicleType.VAN]: 'van',
    [VehicleType.SUV]: 'suv',
    [VehicleType.TRUCK]: 'truck',
  };
  return icons[type] || 'car';
};

/**
 * Generate initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Lighten a hex color
 */
export const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true, message: '' };
};

/**
 * Class names utility (simple cn alternative)
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
