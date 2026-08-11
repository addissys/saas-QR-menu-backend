import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import publicMenuRoutes from './routes/public-menu.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});