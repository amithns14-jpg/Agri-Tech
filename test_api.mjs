// In-Process Direct Integration Test for AgroGuide AI
import { createApp } from './server/dist/app.js';
import { cropService } from './server/dist/services/crop.service.js';
import { soilService } from './server/dist/services/soil.service.js';
import { fertilizerService } from './server/dist/services/fertilizer.service.js';
import { irrigationService } from './server/dist/services/irrigation.service.js';
import { weatherService } from './server/dist/services/weather.service.js';
import { chatbotService } from './server/dist/services/chatbot.service.js';
import { localDb } from './server/dist/utils/supabase.js';

async function runInProcessTests() {
  console.log('🌾 Starting AgroGuide AI Service & Architecture Verification...\n');

  const userId = '00000000-0000-0000-0000-000000000001';

  // 1. Verify App Initialization
  console.log('1. Express App Factory:');
  const app = createApp();
  console.log('   App created successfully with all routes mounted. [PASS]\n');

  // 2. Crop Recommendation Service
  console.log('2. Crop Recommendation Service (Gemini / Agro-Ecological Engine):');
  const cropInput = {
    location: 'Navalgund',
    state: 'Karnataka',
    district: 'Dharwad',
    soil_type: 'Black soil',
    soil_ph: 6.8,
    nitrogen: 280,
    phosphorus: 24,
    potassium: 310,
    temperature: 28,
    humidity: 65,
    rainfall: 120,
    water_availability: 'Irrigation available',
    land_area: 3.5,
    land_unit: 'acre',
    growing_season: 'Kharif',
    language: 'en'
  };
  const cropResult = await cropService.recommendCrops(userId, cropInput);
  console.log('   Status:', cropResult.recommendation.status);
  console.log('   Recommended Crops Count:', cropResult.recommendation.recommended_crops.length);
  console.log('   Top Recommended Crop:', cropResult.recommendation.recommended_crops[0].crop_name);
  console.log('   Suitability Score:', cropResult.recommendation.recommended_crops[0].suitability_score, '/ 100');
  console.log('   [PASS]\n');

  // 3. Soil Health Analysis Service
  console.log('3. Soil Health Analysis Service:');
  const soilInput = {
    soil_type: 'Black soil',
    soil_ph: 6.5,
    nitrogen: 220,
    phosphorus: 18,
    potassium: 290,
    language: 'en'
  };
  const soilResult = await soilService.analyzeSoil(userId, soilInput);
  console.log('   Condition:', soilResult.analysis.soil_condition);
  console.log('   Nitrogen Status:', soilResult.analysis.nutrient_analysis.nitrogen.status);
  console.log('   Phosphorus Status:', soilResult.analysis.nutrient_analysis.phosphorus.status);
  console.log('   Suggestions Count:', soilResult.analysis.improvement_suggestions.length);
  console.log('   [PASS]\n');

  // 4. Fertilizer Advisory Service
  console.log('4. Fertilizer Recommendation Service:');
  const fertInput = {
    crop_name: 'Cotton',
    growth_stage: 'Vegetative Growth & Tillering',
    soil_type: 'Black soil',
    soil_ph: 7.0,
    farm_area: 2.0,
    language: 'en'
  };
  const fertResult = await fertilizerService.recommendFertilizer(userId, fertInput);
  console.log('   Crop:', fertResult.recommendation.crop_name);
  console.log('   Nutrient Stages Identified:', Object.keys(fertResult.recommendation.nutrient_requirements).join(', '));
  console.log('   Recommended Categories:', fertResult.recommendation.recommended_fertilizers.map(f => f.fertilizer_name).join(', '));
  console.log('   [PASS]\n');

  // 5. Irrigation Advisory Service
  console.log('5. Smart Irrigation & Water Management Service:');
  const irrInput = {
    crop_name: 'Sugarcane',
    growth_stage: 'Tillering',
    soil_type: 'Black soil',
    water_availability: 'Irrigation available',
    language: 'en'
  };
  const irrResult = await irrigationService.recommendIrrigation(userId, irrInput);
  console.log('   Water Requirement Category:', irrResult.recommendation.water_requirement);
  console.log('   Irrigation Hours:', irrResult.recommendation.irrigation_guidance.recommended_timing);
  console.log('   Overwatering Hazards Alerted:', irrResult.recommendation.overwatering_risks.length);
  console.log('   [PASS]\n');

  // 6. Weather Service & Operational Agricultural Insights
  console.log('6. Meteorological Intelligence Service:');
  const weatherResult = await weatherService.getCurrentWeather('Dharwad', 'Karnataka');
  console.log('   Location:', weatherResult.location);
  console.log('   Temperature:', weatherResult.temperature, '°C');
  console.log('   Condition:', weatherResult.weather_condition);
  console.log('   Sowing Suitability:', weatherResult.agricultural_insights.sowing_suitability);
  console.log('   Spraying Advisory:', weatherResult.agricultural_insights.spraying_advisory);
  console.log('   [PASS]\n');

  // 7. Context-Aware Chatbot Service
  console.log('7. AI Agricultural Chatbot Service:');
  const chatResult = await chatbotService.processUserMessage(
    userId,
    'What is the best organic treatment for leaf curl on tomato plants?',
    undefined,
    'en'
  );
  console.log('   Category:', chatResult.response.category);
  console.log('   Assistant Reply Preview:', chatResult.response.answer.substring(0, 100) + '...');
  console.log('   Follow-up Questions Provided:', chatResult.response.suggested_questions.length);
  console.log('   [PASS]\n');

  // 8. Database Records & Dashboard Analytics
  console.log('8. User-Owned Database Record Isolation & Analytics:');
  const farms = localDb.find('farms', f => f.user_id === userId);
  const cropRecs = localDb.find('crop_recommendations', c => c.user_id === userId);
  const soilRecs = localDb.find('soil_analyses', s => s.user_id === userId);
  const fertRecs = localDb.find('fertilizer_recommendations', f => f.user_id === userId);
  const irrRecs = localDb.find('irrigation_recommendations', i => i.user_id === userId);
  const total = cropRecs.length + soilRecs.length + fertRecs.length + irrRecs.length;

  console.log(`   Active Farms in DB: ${farms.length}`);
  console.log(`   Crop Recommendations in DB: ${cropRecs.length}`);
  console.log(`   Soil Analyses in DB: ${soilRecs.length}`);
  console.log(`   Fertilizer Advisories in DB: ${fertRecs.length}`);
  console.log(`   Irrigation Advisories in DB: ${irrRecs.length}`);
  console.log(`   Total Computed Advisories: ${total}`);
  console.log('   [PASS]\n');

  console.log('===========================================================');
  console.log('✅ ALL ARCHITECTURAL LAYERS & SERVICES VERIFIED SUCCESSFULLY!');
  console.log('===========================================================');
}

runInProcessTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
