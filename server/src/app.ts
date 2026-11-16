import express from 'express';
import cors from 'cors';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import farmRoutes from './routes/farm.routes.js';
import advisoryRoutes from './routes/advisory.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import historyRoutes from './routes/history.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

export function createApp() {
  const app = express();

  // CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.endsWith('.vercel.app') ||
        origin === env.CLIENT_URL ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: { code: 'RATE_LIMIT_EXCEEDED', details: ['Rate limit exceeded'] }
    }
  });
  app.use('/api/', limiter);

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve local uploads
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // Mount API Routes with /api/v1 prefix
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profile', profileRoutes);
  app.use('/api/v1/farms', farmRoutes);
  app.use('/api/v1/advisory', advisoryRoutes);
  app.use('/api/v1/weather', weatherRoutes);
  app.use('/api/v1/chat', chatbotRoutes);
  app.use('/api/v1/history', historyRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);

  // 404 Route handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.originalUrl} not found`,
      error: { code: 'NOT_FOUND', details: ['Unknown API endpoint'] }
    });
  });

  // Centralized Error Middleware
  app.use(errorHandler);

  return app;
}
