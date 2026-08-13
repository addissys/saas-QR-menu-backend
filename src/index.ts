import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import publicMenuRoutes from './routes/public-menu.routes';
import notificationRoutes from './routes/notification.routes';
import auditLogRoutes from './routes/audit-log.routes';
import {
  securityHeaders,
  apiRateLimiter,
} from './middleware/security.middleware';

import { errorHandler } from './middleware/error.middleware';

const app = express();

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(securityHeaders);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: '1mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);

/*
|--------------------------------------------------------------------------
| General API Rate Limiting
|--------------------------------------------------------------------------
*/

app.use('/api/v1', apiRateLimiter);


/*
 * API Routes
 */

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use(
  '/api/v1/public',
  publicMenuRoutes
);
app.use(
  '/api/v1/notifications',
  notificationRoutes
);

app.use(
  '/api/v1/audit-logs',
  auditLogRoutes
);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'QR Menu SaaS Backend API is running',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});