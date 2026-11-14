import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { ProfileUpdateSchema } from '../validators/advisory.validator.js';

const router = Router();

// ==========================================
// GET /api/v1/profile
// ==========================================
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
        if (!error && data) {
          res.json({ success: true, message: 'Profile retrieved', data });
          return;
        }
      }
    }

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

    res.json({ success: true, message: 'Profile retrieved', data: profile });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// PUT /api/v1/profile
// ==========================================
router.put('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const validated = ProfileUpdateSchema.parse(req.body);

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client
          .from('profiles')
          .update({ ...validated, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) {
          res.json({ success: true, message: 'Profile updated successfully', data });
          return;
        }
      }
    }

    const updated = localDb.update('profiles', userId, validated);
    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
