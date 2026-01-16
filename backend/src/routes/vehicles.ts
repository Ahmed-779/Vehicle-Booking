import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * GET /api/vehicles
 * Get all active vehicles
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        licensePlate: true,
        color: true,
        imageUrl: true,
      },
    });

    res.json({ vehicles });
  })
);

/**
 * GET /api/vehicles/:id
 * Get a specific vehicle by ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        licensePlate: true,
        color: true,
        imageUrl: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }

    res.json({ vehicle });
  })
);

export default router;
