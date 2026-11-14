-- Sample Seed Data for AgroGuide AI Testing & Verification
-- Note: Replace demo user UUID with your registered Supabase Auth UID if testing directly in Supabase SQL editor

DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
    farm_id_1 UUID := '11111111-1111-1111-1111-111111111111';
    farm_id_2 UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- Verify if profiles table exists and insert demo profile if not present
    INSERT INTO public.profiles (id, full_name, email, phone, state, district, village, preferred_language)
    VALUES (
        demo_user_id,
        'Ramesh Patel',
        'ramesh.patel@farmer.in',
        '+91 98765 43210',
        'Karnataka',
        'Dharwad',
        'Navalgund',
        'en'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert Sample Farm 1
    INSERT INTO public.farms (id, user_id, farm_name, location, state, district, village, land_area, land_unit, soil_type, water_availability, farming_method)
    VALUES (
        farm_id_1,
        demo_user_id,
        'Green Valley Farm - North Plot',
        'Near Malaprabha River Canal, Navalgund',
        'Karnataka',
        'Dharwad',
        'Navalgund',
        4.5,
        'acre',
        'Black soil',
        'Irrigation available',
        'Conventional with organic compost'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert Sample Farm 2
    INSERT INTO public.farms (id, user_id, farm_name, location, state, district, village, land_area, land_unit, soil_type, water_availability, farming_method)
    VALUES (
        farm_id_2,
        demo_user_id,
        'Patel Homestead Plot',
        'Village Outer Ring, Dharwad Rural',
        'Karnataka',
        'Dharwad',
        'Navalgund',
        2.0,
        'acre',
        'Red soil',
        'Rain-fed',
        'Integrated Pest Management'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert Sample Soil Record
    INSERT INTO public.soil_records (user_id, farm_id, soil_type, soil_ph, nitrogen, phosphorus, potassium, organic_carbon, soil_moisture, measurement_unit, test_date)
    VALUES (
        demo_user_id,
        farm_id_1,
        'Black soil',
        7.2,
        280.5,
        22.4,
        310.0,
        0.58,
        24.5,
        'mg/kg',
        CURRENT_DATE - INTERVAL '15 days'
    )
    ON CONFLICT DO NOTHING;

END $$;
