import { z } from 'zod';

export const SoilTypeEnum = z.enum([
  'Sandy',
  'Clay',
  'Silty',
  'Loamy',
  'Black soil',
  'Red soil',
  'Alluvial soil',
  'Laterite soil',
  'Other / Unknown'
]);

export const WaterAvailabilityEnum = z.enum([
  'Low',
  'Moderate',
  'High',
  'Rain-fed',
  'Irrigation available'
]);

export const GrowingSeasonEnum = z.enum([
  'Kharif',
  'Rabi',
  'Zaid',
  'Year-round / Perennial'
]);

export const LanguageEnum = z.enum(['en', 'hi', 'kn', 'te', 'ta', 'ml']);

// ==========================================
// 1. Crop Recommendation Input Schema
// ==========================================
export const CropRecommendationSchema = z.object({
  farm_id: z.string().uuid().optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100),
  state: z.string().min(2, 'State is required').max(100),
  district: z.string().min(2, 'District is required').max(100),
  soil_type: SoilTypeEnum,
  soil_ph: z.number().min(0, 'pH cannot be less than 0').max(14, 'pH cannot exceed 14'),
  nitrogen: z.number().min(0).max(2000).optional().nullable(),
  phosphorus: z.number().min(0).max(2000).optional().nullable(),
  potassium: z.number().min(0).max(2000).optional().nullable(),
  temperature: z.number().min(-10).max(60).optional().nullable(),
  humidity: z.number().min(0).max(100).optional().nullable(),
  rainfall: z.number().min(0).max(10000).optional().nullable(),
  water_availability: WaterAvailabilityEnum,
  land_area: z.number().positive('Land area must be greater than 0'),
  land_unit: z.enum(['acre', 'hectare', 'bigha', 'guntha']).default('acre'),
  growing_season: GrowingSeasonEnum,
  previous_crop: z.string().max(100).optional().nullable(),
  farming_preference: z.string().max(200).optional().nullable(),
  language: LanguageEnum.default('en')
});

// ==========================================
// 2. Soil Analysis Input Schema
// ==========================================
export const SoilAnalysisSchema = z.object({
  farm_id: z.string().uuid().optional(),
  soil_type: SoilTypeEnum,
  soil_ph: z.number().min(0).max(14),
  nitrogen: z.number().min(0).optional().nullable(),
  phosphorus: z.number().min(0).optional().nullable(),
  potassium: z.number().min(0).optional().nullable(),
  organic_carbon: z.number().min(0).max(100).optional().nullable(),
  soil_moisture: z.number().min(0).max(100).optional().nullable(),
  crop_currently_cultivated: z.string().max(100).optional().nullable(),
  language: LanguageEnum.default('en')
});

// ==========================================
// 3. Fertilizer Advisory Input Schema
// ==========================================
export const FertilizerAdvisorySchema = z.object({
  farm_id: z.string().uuid().optional(),
  crop_name: z.string().min(2, 'Crop name is required').max(100),
  growth_stage: z.string().min(2, 'Growth stage is required').max(100),
  soil_type: SoilTypeEnum,
  soil_ph: z.number().min(0).max(14),
  nitrogen: z.number().min(0).optional().nullable(),
  phosphorus: z.number().min(0).optional().nullable(),
  potassium: z.number().min(0).optional().nullable(),
  farm_area: z.number().positive('Farm area must be greater than 0'),
  soil_test_available: z.boolean().default(false),
  language: LanguageEnum.default('en')
});

// ==========================================
// 4. Irrigation Advisory Input Schema
// ==========================================
export const IrrigationAdvisorySchema = z.object({
  farm_id: z.string().uuid().optional(),
  crop_name: z.string().min(2, 'Crop name is required').max(100),
  soil_type: SoilTypeEnum,
  growth_stage: z.string().min(2, 'Growth stage is required').max(100),
  temperature: z.number().min(-10).max(60).optional().nullable(),
  humidity: z.number().min(0).max(100).optional().nullable(),
  rainfall: z.number().min(0).max(1000).optional().nullable(),
  water_availability: WaterAvailabilityEnum,
  irrigation_method: z.string().max(100).default('Drip / Furrow'),
  language: LanguageEnum.default('en')
});

// ==========================================
// 5. Disease Detection Input Schema
// ==========================================
export const DiseaseDetectionSchema = z.object({
  crop_name: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  visible_symptoms: z.string().max(500).optional().nullable(),
  additional_description: z.string().max(1000).optional().nullable(),
  language: LanguageEnum.default('en')
});

// ==========================================
// 6. Farm Management Schema
// ==========================================
export const FarmCreateSchema = z.object({
  farm_name: z.string().min(2, 'Farm name must be at least 2 characters').max(100),
  location: z.string().min(2, 'Location is required').max(200),
  state: z.string().min(2, 'State is required').max(100),
  district: z.string().min(2, 'District is required').max(100),
  village: z.string().max(100).optional().nullable(),
  land_area: z.number().positive('Land area must be greater than 0'),
  land_unit: z.enum(['acre', 'hectare', 'bigha', 'guntha']).default('acre'),
  soil_type: SoilTypeEnum.optional().nullable(),
  water_availability: WaterAvailabilityEnum.optional().nullable(),
  farming_method: z.string().max(200).optional().nullable()
});

// ==========================================
// 7. Profile Update Schema
// ==========================================
export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  village: z.string().max(100).optional().nullable(),
  preferred_language: LanguageEnum.optional()
});

// ==========================================
// 8. Chat Message Schema
// ==========================================
export const ChatMessageSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  language: LanguageEnum.default('en')
});
