# AgroGuide AI - Production Deployment Guide

## 1. Prerequisites
- Node.js LTS (v20+ or v24+)
- pnpm package manager (`npm install -g pnpm`)
- Supabase Project (free or pro tier)
- Google Gemini API Key from Google AI Studio
- (Optional) OpenWeatherMap API Key for live weather sensor telemetry

---

## 2. Supabase Setup
1. Create a new project in your Supabase Dashboard.
2. Open the **SQL Editor** in Supabase Studio.
3. Paste and run the entire migration file located at:
   `supabase/migrations/20260213000001_initial_schema.sql`
4. Verify that all 11 tables and Row Level Security policies have been created under the `public` schema.
5. In **Storage**, verify that the `crop-images` bucket exists with proper RLS policies.
6. Copy your project credentials:
   - Project URL -> `SUPABASE_URL`
   - Project anon / public API key -> `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - Project service_role secret -> `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Environment Variables Configuration

### Server (`server/.env` or root `.env`):
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-agroguide-frontend.vercel.app

SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

WEATHER_API_KEY=your_openweather_key
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5

MAX_UPLOAD_SIZE_MB=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Client (`client/.env`):
```env
VITE_API_BASE_URL=https://your-agroguide-backend.onrender.com/api/v1
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 4. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
- **Framework Preset:** Vite
- **Root Directory:** `client`
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Environment Variables:** Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 5. Backend Deployment (Render / Railway / Fly.io / AWS)
- **Root Directory:** `server`
- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start`
- **Environment Variables:** Set all server environment variables listed above.
