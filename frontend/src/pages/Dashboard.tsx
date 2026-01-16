import { useState, useMemo, useCallback } from 'react';
import { Filter, Car, X, RefreshCw } from 'lucide-react';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BookingModal } from '../components/booking/BookingModal';
import { useVehicles, useBookings } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { Button, VehicleBadge, PageLoader } from '../components/common';
import { bookingsApi } from '../services/api';
import type { Booking, Vehicle, BookingFormData } from '../types';
import toast from 'react-hot-toast';

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

export function Dashboard() {
  const { user } = useAuth();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings();
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('dayGridMonth');
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    booking?: Booking;
    isOwner: boolean;
    selectedDate?: Date;
  }>({
    isOpen: false,
    isOwner: true,
  });

  // Filter bookings by selected vehicle
  const filteredBookings = useMemo(() => {
    if (!selectedVehicleId) return bookings;
    return bookings.filter(booking => booking.vehicleId === selectedVehicleId);
  }, [bookings, selectedVehicleId]);

  const clearFilters = () => {
    setSelectedVehicleId(null);
  };

  const handleDateSelect = useCallback((start: Date, _end: Date) => {
    setModalState({
      isOpen: true,
      isOwner: true,
      selectedDate: start,
    });
  }, []);

  const handleEventClick = useCallback((booking: Booking) => {
    const isOwner = booking.userId === user?.id;
    setModalState({
      isOpen: true,
      booking,
      isOwner,
    });
  }, [user?.id]);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, isOwner: true });
  }, []);

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
      refetchBookings();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save booking';
      toast.error(message);
      throw error;
    }
  }, [modalState.booking, handleCloseModal, refetchBookings]);

  const handleDelete = useCallback(async () => {
    if (!modalState.booking) return;
    try {
      await bookingsApi.delete(modalState.booking.id);
      toast.success('Booking cancelled');
      handleCloseModal();
      refetchBookings();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete booking';
      toast.error(message);
      throw error;
    }
  }, [modalState.booking, handleCloseModal, refetchBookings]);

  if (vehiclesLoading || bookingsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage vehicle bookings
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchBookings()}
              className="text-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {selectedVehicleId && (
                <span className="ml-2 bg-white text-primary-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  1
                </span>
              )}
            </Button>
            <Button
              onClick={() => setModalState({ isOpen: true, isOwner: true })}
            >
              <Car className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-3xl shadow-soft p-6 mb-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-gray-800">
                Filter by Vehicle
              </h3>
              {selectedVehicleId && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((vehicle: Vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                return (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(isSelected ? null : vehicle.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    <VehicleBadge vehicle={vehicle} size="sm" showName={false} />
                    <span className="font-medium">{vehicle.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedVehicleId && (
              <p className="text-sm text-gray-500 mt-4">
                Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} for selected vehicle
              </p>
            )}
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
          <BookingCalendar
            bookings={filteredBookings}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onDateSelect={handleDateSelect}
            onEventClick={handleEventClick}
            view={calendarView}
            onViewChange={setCalendarView}
          />
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onDelete={modalState.isOwner && modalState.booking ? handleDelete : undefined}
        booking={modalState.booking}
        isOwner={modalState.isOwner}
        vehicles={vehicles}
        selectedDate={modalState.selectedDate}
        selectedVehicleId={selectedVehicleId ?? undefined}
      />
    </div>
  );
}
