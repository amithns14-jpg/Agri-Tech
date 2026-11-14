import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';

const router = Router();

// ==========================================
// GET /api/v1/history
// Query params: type (crop, soil, fertilizer, irrigation, disease), page, limit
// ==========================================
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const typeFilter = req.query.type as string | undefined;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    let allItems: any[] = [];

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          const promises = [];
          if (!typeFilter || typeFilter === 'crop') {
            promises.push(
              client.from('crop_recommendations').select('id, crop_name:input_data->>farming_preference, summary, created_at, language').eq('user_id', userId)
                .then(r => (r.data || []).map(x => ({ ...x, type: 'crop', title: 'Crop Recommendation' })))
            );
          }
          if (!typeFilter || typeFilter === 'soil') {
            promises.push(
              client.from('soil_analyses').select('id, analysis_result, created_at').eq('user_id', userId)
                .then(r => (r.data || []).map(x => ({ ...x, type: 'soil', title: 'Soil Health Analysis', summary: x.analysis_result?.summary })))
            );
          }
          if (!typeFilter || typeFilter === 'fertilizer') {
            promises.push(
              client.from('fertilizer_recommendations').select('id, crop_name, created_at, recommendation').eq('user_id', userId)
                .then(r => (r.data || []).map(x => ({ ...x, type: 'fertilizer', title: `Fertilizer Guidance (${x.crop_name})`, summary: `Fertilizer plan for ${x.crop_name}` })))
            );
          }
          if (!typeFilter || typeFilter === 'irrigation') {
            promises.push(
              client.from('irrigation_recommendations').select('id, crop_name, created_at, recommendation').eq('user_id', userId)
                .then(r => (r.data || []).map(x => ({ ...x, type: 'irrigation', title: `Irrigation Advisory (${x.crop_name})`, summary: `Water management for ${x.crop_name}` })))
            );
          }
          if (!typeFilter || typeFilter === 'disease') {
            promises.push(
              client.from('disease_analyses').select('id, crop_name, image_path, created_at, image_analysis').eq('user_id', userId)
                .then(r => (r.data || []).map(x => ({ ...x, type: 'disease', title: `Disease Inspection (${x.crop_name})`, summary: x.image_analysis?.disease_analysis?.possible_disease })))
            );
          }

          const results = await Promise.all(promises);
          allItems = results.flat();
        } catch (err) {
          console.warn('[HistoryRoute] Supabase fetch warning, using local store:', err);
        }
      }
    }

    if (allItems.length === 0) {
      // Local fallback store aggregation
      const crops = (!typeFilter || typeFilter === 'crop')
        ? localDb.find('crop_recommendations', c => c.user_id === userId).map(x => ({
            id: x.id,
            type: 'crop',
            title: 'Crop Recommendation',
            summary: x.summary,
            created_at: x.created_at,
            data: x
          }))
        : [];

      const soils = (!typeFilter || typeFilter === 'soil')
        ? localDb.find('soil_analyses', s => s.user_id === userId).map(x => ({
            id: x.id,
            type: 'soil',
            title: 'Soil Health Analysis',
            summary: x.analysis_result?.summary,
            created_at: x.created_at,
            data: x
          }))
        : [];

      const fertilizers = (!typeFilter || typeFilter === 'fertilizer')
        ? localDb.find('fertilizer_recommendations', f => f.user_id === userId).map(x => ({
            id: x.id,
            type: 'fertilizer',
            title: `Fertilizer Guidance (${x.crop_name})`,
            summary: `Nutrient guidance for ${x.crop_name}`,
            created_at: x.created_at,
            data: x
          }))
        : [];

      const irrigations = (!typeFilter || typeFilter === 'irrigation')
        ? localDb.find('irrigation_recommendations', i => i.user_id === userId).map(x => ({
            id: x.id,
            type: 'irrigation',
            title: `Irrigation Advisory (${x.crop_name})`,
            summary: `Water schedule for ${x.crop_name}`,
            created_at: x.created_at,
            data: x
          }))
        : [];

      const diseases = (!typeFilter || typeFilter === 'disease')
        ? localDb.find('disease_analyses', d => d.user_id === userId).map(x => ({
            id: x.id,
            type: 'disease',
            title: `Disease Inspection (${x.crop_name})`,
            summary: x.image_analysis?.disease_analysis?.possible_disease || 'Visual leaf inspection',
            image_path: x.image_path,
            created_at: x.created_at,
            data: x
          }))
        : [];

      allItems = [...crops, ...soils, ...fertilizers, ...irrigations, ...diseases];
    }

    // Sort descending by date
    allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = allItems.length;
    const startIndex = (page - 1) * limit;
    const paginated = allItems.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      message: 'History retrieved successfully',
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// GET /api/v1/history/:id
// ==========================================
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;

    // Check across collections in local store or Supabase
    const tables = [
      { name: 'crop_recommendations', type: 'crop' },
      { name: 'soil_analyses', type: 'soil' },
      { name: 'fertilizer_recommendations', type: 'fertilizer' },
      { name: 'irrigation_recommendations', type: 'irrigation' },
      { name: 'disease_analyses', type: 'disease' }
    ];

    for (const t of tables) {
      const record = localDb.findById(t.name, id);
      if (record && record.user_id === userId) {
        res.json({
          success: true,
          message: 'Record retrieved',
          data: { ...record, advisory_type: t.type }
        });
        return;
      }
    }

    res.status(404).json({
      success: false,
      message: 'Advisory record not found',
      error: { code: 'NOT_FOUND', details: ['Record does not exist or unauthorized'] }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DELETE /api/v1/history/:id
// ==========================================
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;

    const tables = [
      'crop_recommendations',
      'soil_analyses',
      'fertilizer_recommendations',
      'irrigation_recommendations',
      'disease_analyses'
    ];

    let deleted = false;
    for (const t of tables) {
      const record = localDb.findById(t, id);
      if (record && record.user_id === userId) {
        localDb.delete(t, id);
        deleted = true;
        break;
      }
    }

    res.json({
      success: true,
      message: deleted ? 'Record deleted successfully' : 'Record removed'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
