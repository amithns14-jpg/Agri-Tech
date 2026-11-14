import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { FarmCreateSchema } from '../validators/advisory.validator.js';

const router = Router();

// ==========================================
// GET /api/v1/farms
// ==========================================
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client
          .from('farms')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          res.json({ success: true, message: 'Farms retrieved', data });
          return;
        }
      }
    }

    const farms = localDb.find('farms', f => f.user_id === userId);
    res.json({ success: true, message: 'Farms retrieved', data: farms });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// POST /api/v1/farms
// ==========================================
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const validated = FarmCreateSchema.parse(req.body);

    const farmId = uuidv4();
    const newFarm = {
      id: farmId,
      user_id: userId,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client.from('farms').insert(newFarm).select().single();
        if (!error && data) {
          res.status(201).json({ success: true, message: 'Farm created successfully', data });
          return;
        }
      }
    }

    localDb.insert('farms', newFarm);
    res.status(201).json({ success: true, message: 'Farm created successfully', data: newFarm });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// GET /api/v1/farms/:id
// ==========================================
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const farmId = req.params.id;

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client
          .from('farms')
          .select('*')
          .eq('id', farmId)
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          res.json({ success: true, message: 'Farm details retrieved', data });
          return;
        }
      }
    }

    const farm = localDb.findById('farms', farmId);
    if (!farm || farm.user_id !== userId) {
      res.status(404).json({
        success: false,
        message: 'Farm not found or unauthorized access',
        error: { code: 'NOT_FOUND', details: ['No farm matching the specified ID'] }
      });
      return;
    }

    res.json({ success: true, message: 'Farm details retrieved', data: farm });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// PUT /api/v1/farms/:id
// ==========================================
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const farmId = req.params.id;
    const validated = FarmCreateSchema.partial().parse(req.body);

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client
          .from('farms')
          .update({ ...validated, updated_at: new Date().toISOString() })
          .eq('id', farmId)
          .eq('user_id', userId)
          .select()
          .single();

        if (!error && data) {
          res.json({ success: true, message: 'Farm updated successfully', data });
          return;
        }
      }
    }

    const farm = localDb.findById('farms', farmId);
    if (!farm || farm.user_id !== userId) {
      res.status(404).json({
        success: false,
        message: 'Farm not found or unauthorized access',
        error: { code: 'NOT_FOUND', details: ['Farm not found'] }
      });
      return;
    }

    const updated = localDb.update('farms', farmId, validated);
    res.json({ success: true, message: 'Farm updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DELETE /api/v1/farms/:id
// ==========================================
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const farmId = req.params.id;

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        await client.from('farms').delete().eq('id', farmId).eq('user_id', userId);
      }
    }

    const farm = localDb.findById('farms', farmId);
    if (farm && farm.user_id === userId) {
      localDb.delete('farms', farmId);
    }

    res.json({ success: true, message: 'Farm deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
