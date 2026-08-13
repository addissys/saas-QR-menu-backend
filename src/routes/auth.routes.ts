import { Router } from 'express';

import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateUserProfile,
  updatePassword,
} from '../controllers/auth.controller';

import { authenticate } from '../middleware/auth.middleware';

import { authRateLimiter } from '../middleware/security.middleware';

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

router.post(
  '/register',
  authRateLimiter,
  register
);

router.post(
  '/login',
  authRateLimiter,
  login
);

router.post(
  '/refresh-token',
  authRateLimiter,
  refreshToken
);

/*
|--------------------------------------------------------------------------
| Protected Authentication Routes
|--------------------------------------------------------------------------
*/

router.post(
  '/logout',
  authenticate,
  logout
);

router.get(
  '/me',
  authenticate,
  getProfile
);

router.patch(
  '/profile',
  authenticate,
  updateUserProfile
);

router.patch(
  '/change-password',
  authenticate,
  updatePassword
);

export default router;