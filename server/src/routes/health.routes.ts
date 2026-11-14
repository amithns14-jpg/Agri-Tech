import { Router, Request, Response } from 'express';
import { env, validateRequiredEnv } from '../config/env.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AgroGuide AI Backend API is healthy',
    data: {
      service: 'agroguide-ai-server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV
    }
  });
});

router.get('/ready', (req: Request, res: Response) => {
  const envStatus = validateRequiredEnv();
  res.json({
    success: true,
    message: 'Readiness check complete',
    data: {
      supabase_configured: env.isSupabaseConfigured,
      gemini_configured: env.isGeminiConfigured,
      weather_configured: env.isWeatherConfigured,
      warnings: envStatus.warnings
    }
  });
});

export default router;
