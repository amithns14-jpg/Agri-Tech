import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { ProfileUpdateSchema } from '../validators/advisory.validator.js';

const router = Router();

// ==========================================
// GET /api/v1/auth/me
// ==========================================
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userToken = req.user!.token;

  if (env.isSupabaseConfigured && userToken) {
    const client = getAuthenticatedSupabaseClient(userToken);
    if (client) {
      const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        res.json({
          success: true,
          message: 'Profile retrieved successfully',
          data
        });
        return;
      }
    }
  }

  // Fallback to local store
  let profile = localDb.findById('profiles', userId);
  if (!profile) {
    profile = {
      id: userId,
      full_name: 'Farmer User',
      email: req.user!.email,
      preferred_language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localDb.insert('profiles', profile);
  }

  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: profile
  });
});

export default router;
