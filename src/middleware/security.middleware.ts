import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Helmet
 *
 * Adds security-related HTTP headers.
 */
export const securityHeaders = helmet();

/**
 * Authentication rate limiter
 *
 * Protects login/register/refresh-password endpoints
 * from brute-force and excessive requests.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many authentication requests. Please try again later.',
  },
});

/**
 * General API rate limiter
 *
 * Protects the entire API from excessive requests.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many requests. Please try again later.',
  },
});