import { v4 as uuidv4 } from 'uuid';
import { geminiService } from './gemini.service.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { FertilizerRecommendationResult } from '../types/index.js';

export class FertilizerService {
  async recommendFertilizer(
    userId: string,
    input: any,
    userToken?: string
  ): Promise<{ id: string; recommendation: FertilizerRecommendationResult }> {
    const recommendation = await geminiService.generateFertilizerAdvice(input);

    const recordId = uuidv4();
    const record = {
      id: recordId,
      user_id: userId,
      farm_id: input.farm_id || null,
      crop_name: input.crop_name,
      input_data: input,
      recommendation: recommendation,
      created_at: new Date().toISOString()
    };

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          await client.from('fertilizer_recommendations').insert(record);
        } catch (err) {
          console.error('[FertilizerService] Supabase insert error:', err);
        }
      }
    }

    localDb.insert('fertilizer_recommendations', record);

    return {
      id: recordId,
      recommendation
    };
  }
}

export const fertilizerService = new FertilizerService();
