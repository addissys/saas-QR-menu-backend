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

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/

router.post(
  '/register',
  register
);

router.post(
  '/login',
  login
);

router.post(
  '/refresh-token',
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