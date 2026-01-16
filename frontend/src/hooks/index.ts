import { useState, useEffect, useCallback } from 'react';
import { Vehicle, Booking } from '../types';
import { vehiclesApi, bookingsApi, getErrorMessage } from '../services/api';

/**
 * Hook for fetching and managing vehicles
 */
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { vehicles } = await vehiclesApi.getAll();
      setVehicles(vehicles);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return { vehicles, isLoading, error, refetch: fetchVehicles };
};

/**
 * Hook for fetching and managing bookings
 */
export const useBookings = (params?: {
  vehicleId?: string;
  start?: string;
  end?: string;
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { bookings } = await bookingsApi.getAll(params);
      setBookings(bookings);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [params?.vehicleId, params?.start, params?.end]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, error, refetch: fetchBookings, setBookings };
};

/**
 * Hook for fetching user's own bookings
 */
export const useMyBookings = () => {
  const [bookings, setBookings] = useState<{
    all: Booking[];
    upcoming: Booking[];
    past: Booking[];
  }>({
    all: [],
    upcoming: [],
    past: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingsApi.getMy();
      setBookings({
        all: data.bookings,
        upcoming: data.upcoming,
        past: data.past,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, error, refetch: fetchBookings };
};

/**
 * Hook for managing a single booking
 */
export const useBooking = (id: string | null) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) {
      setBooking(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingsApi.getById(id);
      setBooking(data.booking);
      setIsOwner(data.isOwner);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  return { booking, isOwner, isLoading, error, refetch: fetchBooking };
};
