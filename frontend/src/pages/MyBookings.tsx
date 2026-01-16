import { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, ChevronRight, Plus, History } from 'lucide-react';
import { useMyBookings, useVehicles } from '../hooks';
import { BookingModal } from '../components/booking/BookingModal';
import { Button, PageLoader, VehicleBadge } from '../components/common';
import { formatDate, formatDateRange } from '../utils';
import { bookingsApi } from '../services/api';
import type { Booking, Vehicle, BookingFormData } from '../types';
import toast from 'react-hot-toast';

type Tab = 'upcoming' | 'past';

export function MyBookings() {
  const { bookings, isLoading: bookingsLoading, refetch } = useMyBookings();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    booking?: Booking;
  }>({
    isOpen: false,
  });

  const now = new Date();

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    bookings.all.forEach((booking: Booking) => {
      if (new Date(booking.endTime) > now) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    // Sort upcoming by start time (nearest first)
    upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Sort past by end time (most recent first)
    past.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings.all, now]);

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getVehicle = (vehicleId: string): Vehicle | undefined => {
    return vehicles.find((v: Vehicle) => v.id === vehicleId);
  };

  const handleBookingClick = useCallback((booking: Booking) => {
    setModalState({
      isOpen: true,
      booking,
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false });
    refetch();
  }, [refetch]);

  const handleSubmit = useCallback(async (data: BookingFormData) => {
    try {
      if (modalState.booking) {
        await bookingsApi.update(modalState.booking.id, data);
        toast.success('Booking updated! ✨');
      } else {
        await bookingsApi.create(data);
        toast.success('Booking created! 🎉');
      }
      handleCloseModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save booking';
      toast.error(message);
      throw error;
    }
  }, [modalState.booking, handleCloseModal]);

  const handleDelete = useCallback(async () => {
    if (!modalState.booking) return;
    try {
      await bookingsApi.delete(modalState.booking.id);
      toast.success('Booking cancelled');
      handleCloseModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete booking';
      toast.error(message);
      throw error;
    }
  }, [modalState.booking, handleCloseModal]);

  if (bookingsLoading || vehiclesLoading) {
    return <PageLoader />;
  }

  const isUpcoming = (booking: Booking) => new Date(booking.startTime) > now;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-800">
              My Bookings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your vehicle reservations
            </p>
          </div>
          <Button onClick={() => setModalState({ isOpen: true })}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-full p-1.5 shadow-soft inline-flex mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`
              px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2
              ${activeTab === 'upcoming'
                ? 'bg-primary-500 text-white shadow-soft'
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            Upcoming
            {upcomingBookings.length > 0 && (
              <span className={`
                text-xs font-bold px-2 py-0.5 rounded-full
                ${activeTab === 'upcoming'
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-100 text-primary-600'
                }
              `}>
                {upcomingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`
              px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-2
              ${activeTab === 'past'
                ? 'bg-primary-500 text-white shadow-soft'
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <History className="w-4 h-4" />
            Past
            {pastBookings.length > 0 && (
              <span className={`
                text-xs font-bold px-2 py-0.5 rounded-full
                ${activeTab === 'past'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {pastBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Bookings List */}
        {displayedBookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-soft p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'upcoming' ? (
                <Calendar className="w-8 h-8 text-gray-400" />
              ) : (
                <History className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming vehicle reservations."
                : "You haven't made any bookings yet."}
            </p>
            {activeTab === 'upcoming' && (
              <Button onClick={() => setModalState({ isOpen: true })}>
                <Plus className="w-4 h-4 mr-2" />
                Make a Booking
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedBookings.map((booking: Booking) => {
              const vehicle = getVehicle(booking.vehicleId);
              const startDate = new Date(booking.startTime);
              const endDate = new Date(booking.endTime);
              const isActive = startDate <= now && endDate > now;

              return (
                <button
                  key={booking.id}
                  onClick={() => handleBookingClick(booking)}
                  className={`
                    w-full bg-white rounded-3xl shadow-soft p-6 text-left transition-all
                    hover:shadow-soft-lg hover:scale-[1.01] group
                    ${isActive ? 'ring-2 ring-success-400' : ''}
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Date badge */}
                    <div className={`
                      flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center
                      ${isUpcoming(booking)
                        ? 'bg-gradient-to-br from-primary-100 to-primary-200'
                        : 'bg-gray-100'
                      }
                    `}>
                      <span className={`text-xs font-medium uppercase ${isUpcoming(booking) ? 'text-primary-600' : 'text-gray-500'}`}>
                        {formatDate(startDate, 'MMM')}
                      </span>
                      <span className={`text-2xl font-bold ${isUpcoming(booking) ? 'text-primary-700' : 'text-gray-700'}`}>
                        {formatDate(startDate, 'd')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-semibold text-gray-800 truncate">
                            {booking.title || 'Vehicle Booking'}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-100 text-success-700 text-xs font-medium rounded-full mt-1">
                              <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
                              In progress
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{formatDateRange(startDate, endDate)}</span>
                        </div>
                        {vehicle && (
                          <VehicleBadge vehicle={vehicle} size="sm" />
                        )}
                      </div>

                      {booking.description && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-1">
                          {booking.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onDelete={modalState.booking ? handleDelete : undefined}
        booking={modalState.booking}
        isOwner={true}
        vehicles={vehicles}
      />
    </div>
  );
}
