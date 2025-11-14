import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  // Handle operational errors (AppError instances)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;

    // Log operational errors at appropriate level
    if (err.isOperational) {
      logger.warn('Operational error', {
        code: err.code,
        message: err.message,
        path: req.path,
        method: req.method,
      });
    } else {
      logger.error('Non-operational error', {
        error: err,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    // Log unexpected errors
    logger.error('Unexpected error', {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: 'Error',
    message,
    code,
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: err.stack,
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const errorResponse: ErrorResponse = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  };

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
