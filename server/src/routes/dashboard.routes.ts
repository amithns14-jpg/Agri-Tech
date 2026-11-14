import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';

const router = Router();

// ==========================================
// GET /api/v1/dashboard/stats
// ==========================================
router.get('/stats', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;

    let farmsCount = 0;
    let cropsCount = 0;
    let soilsCount = 0;
    let diseasesCount = 0;
    let fertilizersCount = 0;
    let irrigationsCount = 0;
    let recentActivities: any[] = [];

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          const [f, c, s, d, fert, irr] = await Promise.all([
            client.from('farms').select('id', { count: 'exact', head: true }).eq('user_id', userId),
            client.from('crop_recommendations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
            client.from('soil_analyses').select('id', { count: 'exact', head: true }).eq('user_id', userId),
            client.from('disease_analyses').select('id', { count: 'exact', head: true }).eq('user_id', userId),
            client.from('fertilizer_recommendations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
            client.from('irrigation_recommendations').select('id', { count: 'exact', head: true }).eq('user_id', userId)
          ]);

          farmsCount = f.count || 0;
          cropsCount = c.count || 0;
          soilsCount = s.count || 0;
          diseasesCount = d.count || 0;
          fertilizersCount = fert.count || 0;
          irrigationsCount = irr.count || 0;
        } catch (err) {
          console.warn('[DashboardStats] Supabase count error, using local counts:', err);
        }
      }
    }

    if (farmsCount === 0 && cropsCount === 0 && soilsCount === 0) {
      // Local fallback counts
      farmsCount = localDb.find('farms', f => f.user_id === userId).length;
      cropsCount = localDb.find('crop_recommendations', c => c.user_id === userId).length;
      soilsCount = localDb.find('soil_analyses', s => s.user_id === userId).length;
      diseasesCount = localDb.find('disease_analyses', d => d.user_id === userId).length;
      fertilizersCount = localDb.find('fertilizer_recommendations', f => f.user_id === userId).length;
      irrigationsCount = localDb.find('irrigation_recommendations', i => i.user_id === userId).length;
    }

    const totalAdvisories = cropsCount + soilsCount + diseasesCount + fertilizersCount + irrigationsCount;

    // Pull recent activities from local store
    const crops = localDb.find('crop_recommendations', c => c.user_id === userId).map(x => ({
      id: x.id,
      type: 'crop',
      title: 'Crop Recommendation',
      description: x.summary,
      created_at: x.created_at
    }));

    const soils = localDb.find('soil_analyses', s => s.user_id === userId).map(x => ({
      id: x.id,
      type: 'soil',
      title: 'Soil Health Analysis',
      description: x.analysis_result?.soil_condition || 'Soil test completed',
      created_at: x.created_at
    }));

    const diseases = localDb.find('disease_analyses', d => d.user_id === userId).map(x => ({
      id: x.id,
      type: 'disease',
      title: `Disease Inspection (${x.crop_name})`,
      description: x.image_analysis?.disease_analysis?.possible_disease || 'Visual inspection',
      created_at: x.created_at
    }));

    recentActivities = [...crops, ...soils, ...diseases]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    res.json({
      success: true,
      message: 'Dashboard statistics calculated from database records',
      data: {
        total_advisories: totalAdvisories,
        crop_recommendations_count: cropsCount,
        soil_analyses_count: soilsCount,
        disease_analyses_count: diseasesCount,
        fertilizer_recommendations_count: fertilizersCount,
        irrigation_recommendations_count: irrigationsCount,
        active_farms_count: farmsCount,
        recent_activities: recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
