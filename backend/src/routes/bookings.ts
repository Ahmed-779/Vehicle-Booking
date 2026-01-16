import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

// Validation rules for creating/updating bookings
const bookingValidation = [
  body('vehicleId').isUUID().withMessage('Invalid vehicle ID'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title too long'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
];

/**
 * Check if a booking time slot conflicts with existing bookings
 */
async function checkBookingConflict(
  vehicleId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      vehicleId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      OR: [
        // New booking starts during an existing booking
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        // New booking ends during an existing booking
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        // New booking completely contains an existing booking
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
  });

  return !!conflictingBooking;
}

/**
 * GET /api/bookings
 * Get bookings with optional filters
 * Query params: vehicleId, start, end, userId
 */
router.get(
  '/',
  authenticate,
  [
    query('vehicleId').optional().isUUID().withMessage('Invalid vehicle ID'),
    query('start').optional().isISO8601().withMessage('Invalid start date'),
    query('end').optional().isISO8601().withMessage('Invalid end date'),
    query('userId').optional().isUUID().withMessage('Invalid user ID'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((e) => e.msg).join(', ');
      throw new AppError(errorMessages, 400);
    }

    const { vehicleId, start, end, userId } = req.query;

    // Build where clause
    const where: {
      vehicleId?: string;
      userId?: string;
      startTime?: { gte?: Date };
      endTime?: { lte?: Date };
    } = {};

    if (vehicleId) {
      where.vehicleId = vehicleId as string;
    }
    if (userId) {
      where.userId = userId as string;
    }
    if (start) {
      where.startTime = { gte: new Date(start as string) };
    }
    if (end) {
      where.endTime = { lte: new Date(end as string) };
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarColor: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    });

    res.json({ bookings });
  })
);

/**
 * GET /api/bookings/my
 * Get current user's bookings
 */
router.get(
  '/my',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      orderBy: { startTime: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    });

    // Separate upcoming and past bookings
    const now = new Date();
    const upcoming = bookings.filter((b) => new Date(b.endTime) >= now);
    const past = bookings.filter((b) => new Date(b.endTime) < now);

    res.json({
      bookings,
      upcoming: upcoming.reverse(), // Chronological order for upcoming
      past,
    });
  })
);

/**
 * GET /api/bookings/:id
 * Get a specific booking by ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarColor: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
            licensePlate: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    res.json({
      booking,
      isOwner: booking.userId === req.user!.id,
    });
  })
);

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post(
  '/',
  authenticate,
  bookingValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((e) => e.msg).join(', ');
      throw new AppError(errorMessages, 400);
    }

    const { vehicleId, startTime, endTime, title, description } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate time range
    if (end <= start) {
      throw new AppError('End time must be after start time', 400);
    }

    // Prevent bookings in the past
    const now = new Date();
    if (start < now) {
      throw new AppError('Cannot create bookings in the past', 400);
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    // Check for conflicts
    const hasConflict = await checkBookingConflict(vehicleId, start, end);
    if (hasConflict) {
      throw new AppError(
        'This time slot is already booked for this vehicle. Please choose a different time.',
        409
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        vehicleId,
        startTime: start,
        endTime: end,
        title: title || null,
        description: description || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarColor: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  })
);

/**
 * PUT /api/bookings/:id
 * Update a booking (only owner can update)
 */
router.put(
  '/:id',
  authenticate,
  bookingValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((e) => e.msg).join(', ');
      throw new AppError(errorMessages, 400);
    }

    const { id } = req.params;
    const { vehicleId, startTime, endTime, title, description } = req.body;

    // Find existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new AppError('Booking not found', 404);
    }

    // Check ownership
    if (existingBooking.userId !== req.user!.id) {
      throw new AppError('You can only edit your own bookings', 403);
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate time range
    if (end <= start) {
      throw new AppError('End time must be after start time', 400);
    }

    // Prevent editing to past times
    const now = new Date();
    if (start < now) {
      throw new AppError('Cannot set booking time to the past', 400);
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    // Check for conflicts (excluding current booking)
    const hasConflict = await checkBookingConflict(vehicleId, start, end, id);
    if (hasConflict) {
      throw new AppError(
        'This time slot conflicts with another booking. Please choose a different time.',
        409
      );
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        vehicleId,
        startTime: start,
        endTime: end,
        title: title || null,
        description: description || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarColor: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    });

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  })
);

/**
 * DELETE /api/bookings/:id
 * Cancel/delete a booking (only owner can delete)
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new AppError('Booking not found', 404);
    }

    // Check ownership
    if (existingBooking.userId !== req.user!.id) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    res.json({
      message: 'Booking cancelled successfully',
    });
  })
);

export default router;
