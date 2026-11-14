import { v4 as uuidv4 } from 'uuid';
import { geminiService } from './gemini.service.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { CropRecommendationResult } from '../types/index.js';

export class CropService {
  async recommendCrops(
    userId: string,
    input: any,
    userToken?: string
  ): Promise<{ id: string; recommendation: CropRecommendationResult }> {
    // 1. Generate AI recommendation with Gemini
    const recommendation = await geminiService.generateCropRecommendation(input);

    const recordId = uuidv4();
    const record = {
      id: recordId,
      user_id: userId,
      farm_id: input.farm_id || null,
      input_data: input,
      recommendations: recommendation,
      summary: recommendation.summary,
      language: input.language || 'en',
      model_name: env.GEMINI_MODEL,
      created_at: new Date().toISOString()
    };

    // 2. Persist to Supabase if configured and user is authenticated
    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          const { error } = await client.from('crop_recommendations').insert(record);
          if (error) {
            console.error('[CropService] Failed to insert into Supabase:', error);
          }
        } catch (err) {
          console.error('[CropService] Supabase insert error:', err);
        }
      }
    }

    // Always keep in local store for rapid recall / offline resilience
    localDb.insert('crop_recommendations', record);

    return {
      id: recordId,
      recommendation
    };
  }
}

export const cropService = new CropService();
