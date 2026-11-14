import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { geminiService } from './gemini.service.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { DiseaseDetectionResult } from '../types/index.js';

export class DiseaseService {
  async analyzeDisease(
    userId: string,
    file: Express.Multer.File,
    metadata: any,
    userToken?: string
  ): Promise<{ id: string; imagePath: string; analysis: DiseaseDetectionResult }> {
    // 1. Validate magic bytes / signature for JPEG, PNG, WEBP
    this.validateFileSignature(file.buffer, file.mimetype);

    // 2. Perform AI Disease Inspection with Gemini
    const analysis = await geminiService.analyzeCropDisease(file.buffer, file.mimetype, metadata);

    const recordId = uuidv4();
    const fileExt = path.extname(file.originalname) || '.jpg';
    const storageFilename = `${userId}/${recordId}${fileExt}`;

    let savedImagePath = storageFilename;

    // 3. Store in Supabase Storage if configured
    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          const { data, error } = await client.storage
            .from('crop-images')
            .upload(storageFilename, file.buffer, {
              contentType: file.mimetype,
              upsert: true
            });

          if (!error && data) {
            savedImagePath = data.path;
          }
        } catch (err) {
          console.warn('[DiseaseService] Supabase Storage upload failed, storing locally:', err);
        }
      }
    }

    // Save image to local uploads directory for local preview
    try {
      const uploadDir = path.resolve(process.cwd(), 'uploads', userId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, `${recordId}${fileExt}`);
      fs.writeFileSync(localFilePath, file.buffer);
      savedImagePath = `/uploads/${userId}/${recordId}${fileExt}`;
    } catch (err) {
      console.warn('[DiseaseService] Local disk write error:', err);
    }

    // 4. Save record in database
    const record = {
      id: recordId,
      user_id: userId,
      farm_id: metadata.farm_id || null,
      crop_name: analysis.crop_identification?.crop_name || metadata.crop_name || 'Crop',
      image_path: savedImagePath,
      image_analysis: analysis,
      created_at: new Date().toISOString()
    };

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          await client.from('disease_analyses').insert(record);
        } catch (err) {
          console.error('[DiseaseService] Supabase insert error:', err);
        }
      }
    }

    localDb.insert('disease_analyses', record);

    return {
      id: recordId,
      imagePath: savedImagePath,
      analysis
    };
  }

  private validateFileSignature(buffer: Buffer, mimetype: string): void {
    if (!buffer || buffer.length < 4) {
      throw new Error('Invalid image file or corrupted content');
    }

    // Check PNG: 89 50 4E 47
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    // Check JPEG: FF D8 FF
    const isJpg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    // Check WEBP: RIFF .... WEBP
    const isWebp = buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';

    if (!isPng && !isJpg && !isWebp) {
      throw new Error('Uploaded file signature does not match allowed image formats (JPEG, PNG, WEBP)');
    }
  }
}

export const diseaseService = new DiseaseService();
