import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import globalErrorHandler from './controllers/errorController.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import loadRoutes from './routes/loadRoutes.js';
import { loadEnv } from './config/env.js';

export const createApp = (config = loadEnv()) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.frontendUrl, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use('/.well-known', express.static(path.join(process.cwd(), '.well-known')));

  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Server is running healthy',
      environment: config.nodeEnv,
    });
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  app.use('/api/v1/profile', profileRoutes);
  app.use('/api/v1/loads', loadRoutes);

  app.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(globalErrorHandler);
  return app;
};

export default createApp;
