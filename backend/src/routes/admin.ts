import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Simple admin check - in production, add a proper admin role to your User model
const ADMIN_EMAILS = ['admin@example.com', 'demo@example.com']; // Add your admin emails here

const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;
  
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  
  next();
};

// Apply auth + admin check to all routes
router.use(authenticate);
router.use(requireAdmin);

// ============== DASHBOARD STATS ==============

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [userCount, vehicleCount, bookingCount, recentBookings] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.booking.count(),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, vehicle: true },
      }),
    ]);

    res.json({
      stats: {
        users: userCount,
        vehicles: vehicleCount,
        bookings: bookingCount,
      },
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============== USERS MANAGEMENT ==============

// Get all users
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      users: users.map((u: { id: string; name: string; email: string; avatarColor: string; createdAt: Date; _count: { bookings: number } }) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarColor: u.avatarColor,
        createdAt: u.createdAt,
        bookingCount: u._count.bookings,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete a user (and their bookings)
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (req.user?.id === id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============== VEHICLES MANAGEMENT ==============

// Get all vehicles with booking counts
router.get('/vehicles', async (_req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ vehicles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Create a new vehicle
router.post('/vehicles', async (req: Request, res: Response) => {
  try {
    const { name, type, licensePlate, color } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: { name, type, licensePlate, color },
    });

    res.status(201).json({ vehicle, message: 'Vehicle created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// Update a vehicle
router.put('/vehicles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, licensePlate, color, isActive } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { name, type, licensePlate, color, isActive },
    });

    res.json({ vehicle, message: 'Vehicle updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete a vehicle
router.delete('/vehicles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check for existing bookings
    const bookingCount = await prisma.booking.count({
      where: { vehicleId: id },
    });

    if (bookingCount > 0) {
      res.status(400).json({
        error: `Cannot delete vehicle with ${bookingCount} existing bookings. Delete bookings first or deactivate the vehicle.`,
      });
      return;
    }

    await prisma.vehicle.delete({ where: { id } });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// ============== BOOKINGS MANAGEMENT ==============

// Get all bookings with filters
router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const { userId, vehicleId, startDate, endDate } = req.query;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) (where.startTime as Record<string, Date>).gte = new Date(startDate as string);
      if (endDate) (where.startTime as Record<string, Date>).lte = new Date(endDate as string);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatarColor: true } },
        vehicle: true,
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ bookings, total: bookings.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update any booking (admin override)
router.put('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vehicleId, startTime, endTime, title, description } = req.body;

    // Check for conflicts (excluding this booking)
    if (vehicleId && startTime && endTime) {
      const conflict = await prisma.booking.findFirst({
        where: {
          id: { not: id },
          vehicleId,
          OR: [
            {
              startTime: { lt: new Date(endTime) },
              endTime: { gt: new Date(startTime) },
            },
          ],
        },
      });

      if (conflict) {
        res.status(409).json({ error: 'This time slot conflicts with another booking' });
        return;
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(vehicleId && { vehicleId }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicle: true,
      },
    });

    res.json({ booking, message: 'Booking updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete any booking (admin override)
router.delete('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.delete({
      where: { id },
      include: { user: true, vehicle: true },
    });

    res.json({
      message: `Booking for ${booking.vehicle.name} by ${booking.user.name} deleted`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Bulk delete bookings
router.post('/bookings/bulk-delete', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'Provide an array of booking IDs' });
      return;
    }

    const result = await prisma.booking.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `${result.count} bookings deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bookings' });
  }
});

// Delete all past bookings (cleanup)
router.delete('/bookings/cleanup/past', async (_req: Request, res: Response) => {
  try {
    const result = await prisma.booking.deleteMany({
      where: {
        endTime: { lt: new Date() },
      },
    });

    res.json({ message: `${result.count} past bookings deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cleanup bookings' });
  }
});

// Check if current user is admin
router.get('/check', async (req: Request, res: Response) => {
  res.json({ isAdmin: true, email: req.user?.email });
});

export default router;
