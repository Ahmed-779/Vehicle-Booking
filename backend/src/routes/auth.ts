import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

// Validation rules
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Generate JWT token for a user
 */
const generateToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Set token cookie
 */
const setTokenCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post(
  '/signup',
  signupValidation,
  asyncHandler(async (req: Request, res: Response) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((e) => e.msg).join(', ');
      throw new AppError(errorMessages, 400);
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate random avatar color
    const avatarColors = [
      '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899',
      '#3b82f6', '#ef4444', '#84cc16', '#6366f1', '#14b8a6',
    ];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        avatarColor,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email);
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token,
    });
  })
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  loginValidation,
  asyncHandler(async (req: Request, res: Response) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((e) => e.msg).join(', ');
      throw new AppError(errorMessages, 400);
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.id, user.email);
    setTokenCookie(res, token);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
      },
      token,
    });
  })
);

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      user: {
        ...user,
        bookingCount: user._count.bookings,
      },
    });
  })
);

export default router;
