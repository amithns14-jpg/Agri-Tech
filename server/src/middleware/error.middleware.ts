import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Centralized Error Handler]:', err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed for submitted data',
      error: {
        code: 'VALIDATION_ERROR',
        details: formattedIssues
      }
    });
    return;
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      message: 'File size limit exceeded (Maximum allowed size: 5 MB)',
      error: {
        code: 'FILE_TOO_LARGE',
        details: ['Maximum file upload size is 5 MB']
      }
    });
    return;
  }

  // Handle custom status errors
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred';

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? [err.stack || err.toString()] : ['Please try again later or contact support']
    }
  });
}
