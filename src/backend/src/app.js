import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import listingsRoutes from './routes/listings.js';
import favoritesRoutes from './routes/favorites.js';
import ordersRoutes from './routes/orders.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import path from 'path';
import uploadsRoutes from './routes/upload.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin, credentials: false }));
  app.use(express.json());

  app.use(healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/listings', listingsRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/uploads', express.static(path.resolve('uploads')));
  app.use('/api/uploads', uploadsRoutes);

  app.use((err, _req, res, _next) => {
  if (err?.message) {
    return res.status(400).json({ message: err.message });
  }

    return res.status(500).json({ message: 'Internal server error.' });
  });

  app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
  return app;
}
