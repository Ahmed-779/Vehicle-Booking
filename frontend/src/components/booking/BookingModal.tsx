import React, { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import {
  Clock,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Booking, Vehicle, BookingFormData } from '../../types';
import { Modal, Button, Input, Textarea, Select, VehicleBadge, UserAvatar } from '../common';
import { formatForInput, formatDate, formatTimeRange } from '../../utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  booking?: Booking | null;
  isOwner?: boolean;
  vehicles: Vehicle[];
  selectedDate?: Date;
  selectedVehicleId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  booking,
  isOwner = true,
  vehicles,
  selectedDate,
  selectedVehicleId,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    vehicleId: '',
    startTime: '',
    endTime: '',
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine mode based on booking presence
  const isViewMode = booking && !isOwner;
  const isCreateMode = !booking;

  // Initialize form data
  useEffect(() => {
    if (booking) {
      setFormData({
        vehicleId: booking.vehicleId,
        startTime: formatForInput(parseISO(booking.startTime)),
        endTime: formatForInput(parseISO(booking.endTime)),
        title: booking.title || '',
        description: booking.description || '',
      });
      setIsEditing(false);
    } else {
      // New booking
      const defaultStart = selectedDate || new Date();
      defaultStart.setHours(defaultStart.getHours() + 1, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(defaultEnd.getHours() + 1);

      setFormData({
        vehicleId: selectedVehicleId || vehicles[0]?.id || '',
        startTime: formatForInput(defaultStart),
        endTime: formatForInput(defaultEnd),
        title: '',
        description: '',
      });
      setIsEditing(true);
    }
    setError(null);
  }, [booking, selectedDate, selectedVehicleId, vehicles, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.vehicleId) {
      setError('Please select a vehicle');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    if (start < new Date()) {
      setError('Cannot book in the past');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setIsDeleting(false);
    }
  };

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);

  // View mode (read-only)
  if (isViewMode && booking) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="md">
        <div className="space-y-4">
          {/* Vehicle info */}
          {booking.vehicle && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Vehicle</p>
              <VehicleBadge vehicle={booking.vehicle} size="md" />
            </div>
          )}

          {/* Time info */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(booking.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
          </div>

          {/* Booked by */}
          {booking.user && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Booked by</p>
              <UserAvatar
                name={booking.user.name}
                color={booking.user.avatarColor}
                size="md"
              />
            </div>
          )}

          {/* Title and description */}
          {booking.title && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Title</p>
              <p className="font-medium text-gray-800">{booking.title}</p>
            </div>
          )}

          {booking.description && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{booking.description}</p>
            </div>
          )}

          <div className="pt-4">
            <Button variant="secondary" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Create/Edit mode
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreateMode ? 'New Booking' : isEditing ? 'Edit Booking' : 'Your Booking'}
      size="md"
    >
      {/* View mode for owner (not editing) */}
      {booking && !isEditing && (
        <div className="space-y-4">
          {/* Vehicle info */}
          {booking.vehicle && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Vehicle</p>
              <VehicleBadge vehicle={booking.vehicle} size="md" />
            </div>
          )}

          {/* Time info */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(booking.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
          </div>

          {/* Title and description */}
          {booking.title && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Title</p>
              <p className="font-medium text-gray-800">{booking.title}</p>
            </div>
          )}

          {booking.description && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{booking.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              className="flex-1"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cancel Booking
            </Button>
          </div>
        </div>
      )}

      {/* Edit/Create form */}
      {(isCreateMode || isEditing) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <Select
            label="Vehicle"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            options={vehicleOptions}
            placeholder="Select a vehicle"
          />

          {selectedVehicle && (
            <div className="flex items-center gap-2">
              <VehicleBadge vehicle={selectedVehicle} size="sm" showName={false} />
              <span className="text-sm text-gray-600">
                {selectedVehicle.name}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
            <Input
              label="End Time"
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Title (optional)"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Team outing"
          />

          <Textarea
            label="Description (optional)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add any notes about this booking..."
            rows={3}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={booking ? () => setIsEditing(false) : onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="flex-1"
            >
              {isCreateMode ? 'Create Booking' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
