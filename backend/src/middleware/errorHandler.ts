import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';

  // Check if it's our custom error
  if ('statusCode' in err && 'isOperational' in err) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma errors
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this data already exists';
    } else if (prismaError.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Send response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
