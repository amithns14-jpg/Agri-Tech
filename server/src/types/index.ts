// AgroGuide AI - Data Models and Type Definitions

export type SoilType = 
  | 'Sandy'
  | 'Clay'
  | 'Silty'
  | 'Loamy'
  | 'Black soil'
  | 'Red soil'
  | 'Alluvial soil'
  | 'Laterite soil'
  | 'Other / Unknown';

export type WaterAvailability = 
  | 'Low'
  | 'Moderate'
  | 'High'
  | 'Rain-fed'
  | 'Irrigation available';

export type GrowingSeason = 
  | 'Kharif'
  | 'Rabi'
  | 'Zaid'
  | 'Year-round / Perennial';

export type LanguageCode = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  state?: string;
  district?: string;
  village?: string;
  preferred_language: LanguageCode;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  farm_name: string;
  location: string;
  state: string;
  district: string;
  village?: string;
  land_area: number;
  land_unit: string;
  soil_type?: SoilType;
  water_availability?: WaterAvailability;
  farming_method?: string;
  created_at: string;
  updated_at: string;
}

export interface SoilRecord {
  id: string;
  user_id: string;
  farm_id?: string;
  soil_type?: SoilType;
  soil_ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  organic_carbon?: number;
  soil_moisture?: number;
  measurement_unit?: string;
  test_date?: string;
  created_at: string;
}

export interface CropRecommendationItem {
  crop_name: string;
  suitability_score: number; // 0 - 100 qualitative AI assessment
  suitability_category: 'High' | 'Moderate' | 'Low';
  reason: string;
  soil_compatibility: string;
  climate_compatibility: string;
  water_requirement: string;
  growing_duration_days: number;
  recommended_sowing_period: string;
  precautions: string[];
  limitations?: string[];
}

export interface CropRecommendationResult {
  status: 'success' | 'partial' | 'insufficient_information';
  summary: string;
  input_quality: {
    is_sufficient: boolean;
    missing_information: string[];
    limitations: string[];
  };
  recommended_crops: CropRecommendationItem[];
  general_advice: string[];
  warnings: string[];
  next_steps: string[];
}

export interface SoilAnalysisResult {
  status: 'success' | 'partial' | 'insufficient_information';
  summary: string;
  soil_condition: string;
  ph_analysis: {
    value?: number;
    interpretation: string;
  };
  nutrient_analysis: {
    nitrogen: {
      status: string;
      recommendation: string;
    };
    phosphorus: {
      status: string;
      recommendation: string;
    };
    potassium: {
      status: string;
      recommendation: string;
    };
  };
  potential_issues: string[];
  improvement_suggestions: string[];
  recommended_tests: string[];
  warnings: string[];
}

export interface FertilizerRecommendationResult {
  status: 'success' | 'partial';
  crop_name: string;
  growth_stage: string;
  nutrient_requirements: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
  recommended_fertilizers: Array<{
    fertilizer_name: string;
    purpose: string;
    application_timing: string;
    application_method: string;
    application_rate: number | null;
    rate_unit: string | null;
    rate_basis: string;
  }>;
  organic_alternatives: string[];
  precautions: string[];
  warnings: string[];
  expert_verification_required: boolean;
}

export interface IrrigationRecommendationResult {
  status: 'success' | 'partial';
  crop_name: string;
  water_requirement: string;
  irrigation_guidance: {
    recommended_timing: string;
    frequency: string;
    method: string;
  };
  weather_considerations: string[];
  water_conservation_methods: string[];
  overwatering_risks: string[];
  warnings: string[];
  next_steps: string[];
}

export interface DiseaseDetectionResult {
  status: 'success' | 'insufficient_information';
  crop_identification: {
    crop_name: string;
    confidence: number;
  };
  disease_analysis: {
    possible_disease: string;
    confidence: number;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical' | 'Unknown';
    visible_symptoms: string[];
  };
  possible_alternatives: string[];
  immediate_actions: string[];
  prevention_methods: string[];
  treatment_guidance: string[];
  image_quality: 'Good' | 'Moderate' | 'Poor' | 'Blurry';
  expert_verification_required: boolean;
  warnings: string[];
}

export interface ChatbotResponseResult {
  answer: string;
  category: string;
  language: string;
  suggested_questions: string[];
  warnings: string[];
  requires_expert: boolean;
}
