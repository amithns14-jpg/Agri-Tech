-- AI-POWERED AGRICULTURE CROP ADVISORY ASSISTANT (AgroGuide AI)
-- Comprehensive Database Schema with Row Level Security (RLS)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    state TEXT,
    district TEXT,
    village TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. FARMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    location TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    village TEXT,
    land_area NUMERIC(12,2) NOT NULL CHECK (land_area > 0),
    land_unit TEXT NOT NULL DEFAULT 'acre',
    soil_type TEXT,
    water_availability TEXT,
    farming_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. SOIL RECORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.soil_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    soil_type TEXT,
    soil_ph NUMERIC(4,2) CHECK (soil_ph BETWEEN 0 AND 14),
    nitrogen NUMERIC(12,3),
    phosphorus NUMERIC(12,3),
    potassium NUMERIC(12,3),
    organic_carbon NUMERIC(8,3),
    soil_moisture NUMERIC(8,3),
    measurement_unit TEXT DEFAULT 'mg/kg',
    test_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. CROP RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    input_data JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    summary TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    model_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. SOIL ANALYSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.soil_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    input_data JSONB NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. DISEASE ANALYSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.disease_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT,
    image_path TEXT NOT NULL,
    image_analysis JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. FERTILIZER RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fertilizer_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    input_data JSONB NOT NULL,
    recommendation JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. IRRIGATION RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.irrigation_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    input_data JSONB NOT NULL,
    recommendation JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. CHAT CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. CHAT MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. WEATHER RECORDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.weather_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    location TEXT NOT NULL,
    temperature NUMERIC(6,2),
    humidity NUMERIC(6,2),
    rainfall NUMERIC(10,2),
    wind_speed NUMERIC(10,2),
    weather_condition TEXT,
    forecast_data JSONB,
    provider TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_records_user_id ON public.soil_records(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user_id ON public.crop_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_created_at ON public.crop_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soil_analyses_user_id ON public.soil_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_user_id ON public.disease_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_created_at ON public.disease_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fertilizer_user_id ON public.fertilizer_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_user_id ON public.irrigation_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_weather_records_user_id ON public.weather_records(user_id);

-- ============================================================================
-- 13. AUTOMATED UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_farms_updated_at ON public.farms;
CREATE TRIGGER set_farms_updated_at
BEFORE UPDATE ON public.farms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER set_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 14. AUTH USER PROFILE CREATION TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        state,
        district,
        preferred_language
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Farmer'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'state',
        NEW.raw_user_meta_data->>'district',
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        state = COALESCE(EXCLUDED.state, public.profiles.state),
        district = COALESCE(EXCLUDED.district, public.profiles.district),
        preferred_language = COALESCE(EXCLUDED.preferred_language, public.profiles.preferred_language);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Farms Policies
DROP POLICY IF EXISTS "Users manage their own farms" ON public.farms;
CREATE POLICY "Users manage their own farms"
    ON public.farms FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Soil Records Policies
DROP POLICY IF EXISTS "Users manage their own soil records" ON public.soil_records;
CREATE POLICY "Users manage their own soil records"
    ON public.soil_records FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Crop Recommendations Policies
DROP POLICY IF EXISTS "Users manage their own crop recommendations" ON public.crop_recommendations;
CREATE POLICY "Users manage their own crop recommendations"
    ON public.crop_recommendations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Soil Analyses Policies
DROP POLICY IF EXISTS "Users manage their own soil analyses" ON public.soil_analyses;
CREATE POLICY "Users manage their own soil analyses"
    ON public.soil_analyses FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Disease Analyses Policies
DROP POLICY IF EXISTS "Users manage their own disease analyses" ON public.disease_analyses;
CREATE POLICY "Users manage their own disease analyses"
    ON public.disease_analyses FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Fertilizer Recommendations Policies
DROP POLICY IF EXISTS "Users manage their own fertilizer recommendations" ON public.fertilizer_recommendations;
CREATE POLICY "Users manage their own fertilizer recommendations"
    ON public.fertilizer_recommendations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Irrigation Recommendations Policies
DROP POLICY IF EXISTS "Users manage their own irrigation recommendations" ON public.irrigation_recommendations;
CREATE POLICY "Users manage their own irrigation recommendations"
    ON public.irrigation_recommendations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Chat Conversations Policies
DROP POLICY IF EXISTS "Users manage their own chat conversations" ON public.chat_conversations;
CREATE POLICY "Users manage their own chat conversations"
    ON public.chat_conversations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users manage their own chat messages" ON public.chat_messages;
CREATE POLICY "Users manage their own chat messages"
    ON public.chat_messages FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Weather Records Policies
DROP POLICY IF EXISTS "Users manage their own weather records" ON public.weather_records;
CREATE POLICY "Users manage their own weather records"
    ON public.weather_records FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 16. STORAGE BUCKET FOR CROP DISEASE IMAGES
-- ============================================================================
-- Insert private storage bucket for uploaded crop photographs
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can upload and access images in their own folder (auth.uid()/*)
DROP POLICY IF EXISTS "Users can upload their own crop images" ON storage.objects;
CREATE POLICY "Users can upload their own crop images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'crop-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view their own crop images" ON storage.objects;
CREATE POLICY "Users can view their own crop images"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'crop-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own crop images" ON storage.objects;
CREATE POLICY "Users can delete their own crop images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'crop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
