import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking, Vehicle, CalendarEvent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { VehicleIcon } from '../common';
import { lightenColor, cn } from '../../utils';

interface BookingCalendarProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onDateSelect: (start: Date, end: Date) => void;
  onEventClick: (booking: Booking) => void;
  view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  onViewChange: (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  vehicles,
  selectedVehicleId,
  onDateSelect,
  onEventClick,
  view,
  onViewChange,
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const { user } = useAuth();
  const [currentTitle, setCurrentTitle] = useState('');

  // Convert bookings to calendar events
  const events: CalendarEvent[] = bookings
    .filter((booking) => !selectedVehicleId || booking.vehicleId === selectedVehicleId)
    .map((booking) => {
      const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
      const isOwner = booking.userId === user?.id;
      const baseColor = vehicle?.color || '#6366f1';

      return {
        id: booking.id,
        title: booking.title || `${booking.user?.name || 'Someone'}'s booking`,
        start: booking.startTime,
        end: booking.endTime,
        backgroundColor: isOwner ? baseColor : lightenColor(baseColor, 30),
        borderColor: baseColor,
        textColor: isOwner ? '#ffffff' : baseColor,
        extendedProps: {
          booking,
          isOwner,
        },
      };
    });

  // Update title when calendar navigates
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      setCurrentTitle(api.view.title);
    }
  }, [view]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    onDateSelect(selectInfo.start, selectInfo.end);
    // Unselect after handling
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const booking = clickInfo.event.extendedProps.booking as Booking;
    onEventClick(booking);
  };

  const navigatePrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
    setCurrentTitle(api?.view.title || '');
  };

  const navigateNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
    setCurrentTitle(api?.view.title || '');
  };

  const navigateToday = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
    setCurrentTitle(api?.view.title || '');
  };

  const changeView = (newView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    const api = calendarRef.current?.getApi();
    api?.changeView(newView);
    onViewChange(newView);
    setCurrentTitle(api?.view.title || '');
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { booking, isOwner } = eventInfo.event.extendedProps;
    const vehicle = vehicles.find((v) => v.id === booking.vehicleId);

    return (
      <div className="flex items-center gap-1 overflow-hidden px-1 py-0.5">
        {vehicle && (
          <VehicleIcon
            type={vehicle.type}
            size="sm"
            className="flex-shrink-0 w-3 h-3"
          />
        )}
        <span className="truncate text-xs font-medium">
          {eventInfo.event.title}
        </span>
        {isOwner && (
          <span className="ml-auto text-[10px] opacity-75">You</span>
        )}
      </div>
    );
  };

  const viewButtons = [
    { value: 'dayGridMonth' as const, label: 'Month' },
    { value: 'timeGridWeek' as const, label: 'Week' },
    { value: 'timeGridDay' as const, label: 'Day' },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-soft p-4 sm:p-6">
      {/* Custom toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrev}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={navigateNext}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={navigateToday}
            className="px-4 py-2 rounded-full text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
          >
            Today
          </button>
          <h2 className="text-xl font-display font-bold text-gray-800 ml-2">
            {currentTitle}
          </h2>
        </div>

        {/* View toggle */}
        <div className="flex rounded-full bg-gray-100 p-1">
          {viewButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => changeView(btn.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                view === btn.value
                  ? 'bg-white text-primary-600 shadow-soft'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="fc-custom">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false} // We use custom toolbar
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          nowIndicator={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          eventDisplay="block"
          displayEventTime={view !== 'dayGridMonth'}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          selectAllow={(selectInfo) => {
            // Only allow future selections
            return selectInfo.start >= new Date();
          }}
          datesSet={(dateInfo) => {
            setCurrentTitle(dateInfo.view.title);
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary-500" />
            <span>Your bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary-200 border border-primary-400" />
            <span>Others' bookings</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">
              Click on a slot to book, click on a booking to view details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
