import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Also attempt loading from parent if in server subdirectory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Google Gemini AI SDK
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',

  // Weather API
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  WEATHER_API_BASE_URL: process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5',

  // Security and Uploads
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'authenticated',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Helper getters
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  isSupabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
  isGeminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key'),
  isWeatherConfigured: Boolean(process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY !== 'your-weather-api-key')
};

export function validateRequiredEnv(): { isValid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!env.isSupabaseConfigured) {
    warnings.push('SUPABASE_URL and SUPABASE_ANON_KEY are not configured. Operating in local sandbox store mode.');
  }

  if (!env.isGeminiConfigured) {
    warnings.push('GEMINI_API_KEY is not configured or uses placeholder value. AI services will operate in guided expert simulation fallback mode.');
  }

  if (!env.isWeatherConfigured) {
    warnings.push('WEATHER_API_KEY is not configured. Weather service will provide regional agro-climatic estimates and manual input.');
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}
