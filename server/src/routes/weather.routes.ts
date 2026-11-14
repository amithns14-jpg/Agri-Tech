import { Router, Request, Response, NextFunction } from 'express';
import { weatherService } from '../services/weather.service.js';

const router = Router();

// ==========================================
// GET /api/v1/weather/current
// ==========================================
router.get('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.query.location as string) || 'Dharwad';
    const state = req.query.state as string | undefined;

    const weather = await weatherService.getCurrentWeather(location, state);

    res.json({
      success: true,
      message: 'Weather information retrieved',
      data: weather
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// GET /api/v1/weather/forecast
// ==========================================
router.get('/forecast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.query.location as string) || 'Dharwad';
    const state = req.query.state as string | undefined;

    const forecast = await weatherService.getForecast(location, state);

    res.json({
      success: true,
      message: 'Weather forecast retrieved',
      data: forecast
    });
  } catch (err) {
    next(err);
  }
});

export default router;
