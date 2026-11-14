import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { cropService } from '../services/crop.service.js';
import { soilService } from '../services/soil.service.js';
import { fertilizerService } from '../services/fertilizer.service.js';
import { irrigationService } from '../services/irrigation.service.js';
import { diseaseService } from '../services/disease.service.js';
import {
  CropRecommendationSchema,
  SoilAnalysisSchema,
  FertilizerAdvisorySchema,
  IrrigationAdvisorySchema,
  DiseaseDetectionSchema
} from '../validators/advisory.validator.js';
import { env } from '../config/env.js';

const router = Router();

// Configure Multer for secure in-memory file handling (up to 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPG, PNG, and WEBP formats are accepted.'));
    }
  }
});

// ==========================================
// 1. POST /api/v1/advisory/crop-recommendation
// ==========================================
router.post('/crop-recommendation', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const validatedData = CropRecommendationSchema.parse(req.body);

    const result = await cropService.recommendCrops(userId, validatedData, userToken);

    res.json({
      success: true,
      message: 'Crop recommendations generated successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. POST /api/v1/advisory/soil-analysis
// ==========================================
router.post('/soil-analysis', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const validatedData = SoilAnalysisSchema.parse(req.body);

    const result = await soilService.analyzeSoil(userId, validatedData, userToken);

    res.json({
      success: true,
      message: 'Soil health analysis completed successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. POST /api/v1/advisory/fertilizer
// ==========================================
router.post('/fertilizer', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const validatedData = FertilizerAdvisorySchema.parse(req.body);

    const result = await fertilizerService.recommendFertilizer(userId, validatedData, userToken);

    res.json({
      success: true,
      message: 'Fertilizer guidance generated successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. POST /api/v1/advisory/irrigation
// ==========================================
router.post('/irrigation', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const validatedData = IrrigationAdvisorySchema.parse(req.body);

    const result = await irrigationService.recommendIrrigation(userId, validatedData, userToken);

    res.json({
      success: true,
      message: 'Irrigation guidance generated successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. POST /api/v1/advisory/disease-detection
// ==========================================
router.post(
  '/disease-detection',
  authenticateToken,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image uploaded',
          error: { code: 'MISSING_IMAGE', details: ['Please select a crop leaf photograph to inspect'] }
        });
        return;
      }

      const userId = req.user!.id;
      const userToken = req.user!.token;
      const metadata = DiseaseDetectionSchema.parse(req.body);

      const result = await diseaseService.analyzeDisease(userId, req.file, metadata, userToken);

      res.json({
        success: true,
        message: 'Disease analysis completed successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
