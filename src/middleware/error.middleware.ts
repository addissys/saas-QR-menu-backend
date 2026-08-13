import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled error:', error);

  // Do not expose internal error details to clients.
  return res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.statusCode
        ? error.message
        : 'Internal server error',
  });
};