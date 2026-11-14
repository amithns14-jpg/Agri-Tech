import { Request, Response, NextFunction } from 'express';
import { supabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  token?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication token required',
      error: { code: 'UNAUTHORIZED', details: ['Missing or malformed Authorization header'] }
    });
    return;
  }

  // 1. If real Supabase is configured, verify token with Supabase Auth
  if (env.isSupabaseConfigured && supabaseClient) {
    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication session',
          error: { code: 'INVALID_TOKEN', details: [error?.message || 'Token verification failed'] }
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email || '',
        token
      };
      next();
      return;
    } catch (err: any) {
      console.error('[Auth Middleware] Token verification error:', err);
      res.status(401).json({
        success: false,
        message: 'Authentication failure',
        error: { code: 'AUTH_ERROR', details: [err.message] }
      });
      return;
    }
  }

  // 2. Local fallback / demo mode authentication
  // Allows testing the complete full-stack app even before Supabase keys are provided
  if (token.startsWith('demo-token') || token === 'demo' || token.length > 10) {
    const demoUserId = '00000000-0000-0000-0000-000000000001';
    req.user = {
      id: demoUserId,
      email: 'ramesh.patel@farmer.in',
      token
    };
    next();
    return;
  }

  res.status(401).json({
    success: false,
    message: 'Invalid session token',
    error: { code: 'UNAUTHORIZED', details: ['Invalid credentials'] }
  });
}
