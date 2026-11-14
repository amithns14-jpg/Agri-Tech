import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

// Initialize Supabase client
if (env.isSupabaseConfigured) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    }
  } catch (err) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err);
  }
}

export { supabaseClient, supabaseAdminClient };

// Helper to get authenticated client for a user's JWT
export function getAuthenticatedSupabaseClient(token: string): SupabaseClient | null {
  if (!env.isSupabaseConfigured) return null;
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

// In-Memory Dev Store for when Supabase credentials are in development/unconfigured mode
class LocalFallbackDatabase {
  private profiles = new Map<string, any>();
  private farms = new Map<string, any>();
  private soilRecords = new Map<string, any>();
  private cropRecommendations = new Map<string, any>();
  private soilAnalyses = new Map<string, any>();
  private diseaseAnalyses = new Map<string, any>();
  private fertilizerRecommendations = new Map<string, any>();
  private irrigationRecommendations = new Map<string, any>();
  private chatConversations = new Map<string, any>();
  private chatMessages = new Map<string, any>();
  private weatherRecords = new Map<string, any>();

  constructor() {
    // Seed default demo user
    const defaultUserId = '00000000-0000-0000-0000-000000000001';
    this.profiles.set(defaultUserId, {
      id: defaultUserId,
      full_name: 'Ramesh Patel',
      email: 'ramesh.patel@farmer.in',
      phone: '+91 98765 43210',
      state: 'Karnataka',
      district: 'Dharwad',
      village: 'Navalgund',
      preferred_language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const farmId = '11111111-1111-1111-1111-111111111111';
    this.farms.set(farmId, {
      id: farmId,
      user_id: defaultUserId,
      farm_name: 'Green Valley Plot 1',
      location: 'Near Malaprabha River Canal, Navalgund',
      state: 'Karnataka',
      district: 'Dharwad',
      village: 'Navalgund',
      land_area: 4.5,
      land_unit: 'acre',
      soil_type: 'Black soil',
      water_availability: 'Irrigation available',
      farming_method: 'Integrated Crop Management',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Generic helpers
  getCollection(name: string): Map<string, any> {
    switch (name) {
      case 'profiles': return this.profiles;
      case 'farms': return this.farms;
      case 'soil_records': return this.soilRecords;
      case 'crop_recommendations': return this.cropRecommendations;
      case 'soil_analyses': return this.soilAnalyses;
      case 'disease_analyses': return this.diseaseAnalyses;
      case 'fertilizer_recommendations': return this.fertilizerRecommendations;
      case 'irrigation_recommendations': return this.irrigationRecommendations;
      case 'chat_conversations': return this.chatConversations;
      case 'chat_messages': return this.chatMessages;
      case 'weather_records': return this.weatherRecords;
      default: throw new Error(`Unknown table: ${name}`);
    }
  }

  find(tableName: string, predicate: (item: any) => boolean): any[] {
    const col = this.getCollection(tableName);
    return Array.from(col.values()).filter(predicate);
  }

  findById(tableName: string, id: string): any | null {
    const col = this.getCollection(tableName);
    return col.get(id) || null;
  }

  insert(tableName: string, item: any): any {
    const col = this.getCollection(tableName);
    col.set(item.id, item);
    return item;
  }

  update(tableName: string, id: string, updates: any): any | null {
    const col = this.getCollection(tableName);
    const existing = col.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    col.set(id, updated);
    return updated;
  }

  delete(tableName: string, id: string): boolean {
    const col = this.getCollection(tableName);
    return col.delete(id);
  }
}

export const localDb = new LocalFallbackDatabase();
