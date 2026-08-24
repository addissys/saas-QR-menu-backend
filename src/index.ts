import express from 'express';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import publicMenuRoutes from './routes/public-menu.routes';
import notificationRoutes from './routes/notification.routes';
import auditLogRoutes from './routes/audit-log.routes';
import rolePermissionRoutes from './routes/role-permission.routes';
import tenantRoutes from './routes/tenant.routes';
import branchRoutes from './routes/branch.routes';
import executiveRoutes from './routes/executive.routes';
import executiveBranchRoutes from './routes/executive-branch.routes';
import branchManagerRoutes from './routes/branch-manager.routes';
import categoryRoutes from './routes/category.routes';
import menuItemRoutes from './routes/menu-item.routes';
import tableRoutes from './routes/table.routes';
import qrRoutes from './routes/qr.routes';
import imageRoutes from './routes/image.routes';
import userRoutes from './routes/user.routes';
import userRoleRoutes from './routes/user-role.routes';
import path from 'path';
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

app.use(
  '/uploads',
  express.static(
    path.join(process.cwd(), 'uploads')
  )
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

app.use(
  '/api/v1/tenants',
  tenantRoutes
);

app.use('/api/v1/admin', adminRoutes);

app.use(
  '/api/v1/branches',
  branchRoutes
); 
app.use(
  '/api/v1/executives',
  executiveRoutes
);

app.use(
  '/api/v1/executive-branches',
  executiveBranchRoutes
);

app.use(
  '/api/v1/branch-managers',
  branchManagerRoutes
);

app.use(
  '/api/v1/categories',
  categoryRoutes
);

app.use(
  '/api/v1/menu-items',
  menuItemRoutes
);

app.use(
  '/api/v1/tables',
  tableRoutes
);

app.use(
  '/api/v1/qr',
  qrRoutes
);

app.use(
  '/api/v1/images',
  imageRoutes
);

app.use(
  '/api/v1/public',
  publicMenuRoutes
);
app.use(
  '/api/v1/notifications',
  notificationRoutes
);

//---users---//
app.use(
  '/api/v1/users', 
  userRoutes
);

//--user roles--//
app.use('/api/v1/user-roles', userRoleRoutes);

app.use(
  '/api/v1/audit-logs',
  auditLogRoutes
);

app.use('/api/v1', rolePermissionRoutes);

//_________________//
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);
//_________________//
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