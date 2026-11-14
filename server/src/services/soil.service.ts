import { v4 as uuidv4 } from 'uuid';
import { geminiService } from './gemini.service.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { SoilAnalysisResult } from '../types/index.js';

export class SoilService {
  async analyzeSoil(
    userId: string,
    input: any,
    userToken?: string
  ): Promise<{ id: string; analysis: SoilAnalysisResult }> {
    const analysis = await geminiService.analyzeSoil(input);

    const recordId = uuidv4();
    const record = {
      id: recordId,
      user_id: userId,
      farm_id: input.farm_id || null,
      input_data: input,
      analysis_result: analysis,
      created_at: new Date().toISOString()
    };

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          await client.from('soil_analyses').insert(record);

          // Also save as a soil record if pH and nutrients are provided
          if (input.soil_ph !== undefined) {
            await client.from('soil_records').insert({
              user_id: userId,
              farm_id: input.farm_id || null,
              soil_type: input.soil_type,
              soil_ph: input.soil_ph,
              nitrogen: input.nitrogen || null,
              phosphorus: input.phosphorus || null,
              potassium: input.potassium || null,
              organic_carbon: input.organic_carbon || null,
              soil_moisture: input.soil_moisture || null,
              measurement_unit: 'mg/kg'
            });
          }
        } catch (err) {
          console.error('[SoilService] Supabase insert error:', err);
        }
      }
    }

    localDb.insert('soil_analyses', record);

    return {
      id: recordId,
      analysis
    };
  }
}

export const soilService = new SoilService();
