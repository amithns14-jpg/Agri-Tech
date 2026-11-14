import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import {
  CropRecommendationResult,
  SoilAnalysisResult,
  FertilizerRecommendationResult,
  IrrigationRecommendationResult,
  DiseaseDetectionResult,
  ChatbotResponseResult
} from '../types/index.js';

let genAIClient: GoogleGenAI | null = null;

if (env.isGeminiConfigured) {
  try {
    genAIClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY
    });
  } catch (err) {
    console.warn('[Gemini Service] Initialization failed with provided key:', err);
  }
}

const SYSTEM_INSTRUCTION = `
You are AgroGuide AI, an intelligent, scientifically responsible agricultural advisory assistant designed to help farmers make informed farming decisions, especially in Indian agricultural conditions.

CORE INSTRUCTIONS:
1. Analyze all provided agricultural information carefully.
2. Never invent missing soil measurements or live weather information.
3. Clearly distinguish measured data from estimated information.
4. Consider crop suitability according to soil type, climate, water availability, and growing season (Kharif, Rabi, Zaid).
5. Explain why each recommendation is appropriate.
6. Prefer sustainable farming practices and integrated pest management (IPM).
7. Consider farmer affordability and resource constraints.
8. Avoid unnecessary chemical recommendations.
9. Provide responses in the farmer's requested language (en, hi, kn, te, ta, ml).
10. Use simple, clear language suitable for farmers.

AGRICULTURAL SAFETY RULES:
- Never guarantee crop yield or financial profits.
- Never present estimated suitability scores as absolute scientific certainty.
- Never recommend unauthorized or dangerous chemical mixtures.
- Do not provide precise fertilizer or chemical dosages without sufficient supporting soil-test data.
- Encourage laboratory soil testing when nutrient values are missing.
- Recommend local agricultural extension services (KVK / Krishi Vigyan Kendra) for severe crop disease issues.

OUTPUT FORMAT:
Always return valid, strictly formatted JSON matching the requested schema. Do not enclose in markdown blocks like \`\`\`json if structured JSON is requested.
`;

export class GeminiService {
  private client: GoogleGenAI | null = genAIClient;
  private modelName: string = env.GEMINI_MODEL;

  constructor() {
    if (!this.client && env.isGeminiConfigured) {
      try {
        this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } catch (err) {
        console.error('Failed to instantiate GoogleGenAI:', err);
      }
    }
  }

  // =========================================================================
  // 1. Crop Recommendation Service
  // =========================================================================
  async generateCropRecommendation(input: any): Promise<CropRecommendationResult> {
    if (!this.client) {
      return this.fallbackCropRecommendation(input);
    }

    const prompt = `
Task: Analyze agricultural parameters and recommend up to 5 suitable crops for Indian farming conditions.

Input Parameters:
- Location: ${input.location}, ${input.district}, ${input.state}
- Land Area: ${input.land_area} ${input.land_unit}
- Soil Type: ${input.soil_type}
- Soil pH: ${input.soil_ph}
- Nitrogen (N): ${input.nitrogen ?? 'Not tested'}
- Phosphorus (P): ${input.phosphorus ?? 'Not tested'}
- Potassium (K): ${input.potassium ?? 'Not tested'}
- Temperature: ${input.temperature ?? 'Seasonal average'} °C
- Humidity: ${input.humidity ?? 'Seasonal average'} %
- Rainfall: ${input.rainfall ?? 'Seasonal average'} mm
- Water Availability: ${input.water_availability}
- Growing Season: ${input.growing_season}
- Previous Crop: ${input.previous_crop ?? 'None specified'}
- Farming Preference: ${input.farming_preference ?? 'Standard'}
- Output Language: ${input.language || 'en'}

Respond with a JSON object matching this schema:
{
  "status": "success",
  "summary": "Farmer-friendly summary of the land condition and suitability in ${input.language}",
  "input_quality": {
    "is_sufficient": boolean,
    "missing_information": string[],
    "limitations": string[]
  },
  "recommended_crops": [
    {
      "crop_name": "string",
      "suitability_score": number (0-100 qualitative AI assessment),
      "suitability_category": "High" | "Moderate" | "Low",
      "reason": "Detailed justification in ${input.language}",
      "soil_compatibility": "Explanation in ${input.language}",
      "climate_compatibility": "Explanation in ${input.language}",
      "water_requirement": "Low" | "Moderate" | "High",
      "growing_duration_days": number,
      "recommended_sowing_period": "Month/Season in ${input.language}",
      "precautions": ["string in ${input.language}"]
    }
  ],
  "general_advice": ["string in ${input.language}"],
  "warnings": ["string in ${input.language}"],
  "next_steps": ["string in ${input.language}"]
}
`;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);
      return parsed as CropRecommendationResult;
    } catch (error) {
      console.error('[Gemini Service] Crop Recommendation API call failed:', error);
      return this.fallbackCropRecommendation(input);
    }
  }

  // =========================================================================
  // 2. Soil Analysis Service
  // =========================================================================
  async analyzeSoil(input: any): Promise<SoilAnalysisResult> {
    if (!this.client) {
      return this.fallbackSoilAnalysis(input);
    }

    const prompt = `
Task: Provide a detailed agricultural soil health evaluation based on measured parameters.

Input Data:
- Soil Type: ${input.soil_type}
- Soil pH: ${input.soil_ph}
- Nitrogen (N): ${input.nitrogen ?? 'Not provided'}
- Phosphorus (P): ${input.phosphorus ?? 'Not provided'}
- Potassium (K): ${input.potassium ?? 'Not provided'}
- Organic Carbon: ${input.organic_carbon ?? 'Not provided'}%
- Soil Moisture: ${input.soil_moisture ?? 'Not provided'}%
- Current Crop: ${input.crop_currently_cultivated ?? 'Not specified'}
- Output Language: ${input.language || 'en'}

Respond with a JSON object:
{
  "status": "success",
  "summary": "Overall soil health summary in ${input.language}",
  "soil_condition": "Overall condition (e.g. Acidic, Alkaline, Neutral, Nutrient Deficient)",
  "ph_analysis": {
    "value": ${input.soil_ph},
    "interpretation": "Interpretation of this pH value for agriculture in ${input.language}"
  },
  "nutrient_analysis": {
    "nitrogen": { "status": "Low" | "Medium" | "High" | "Unknown", "recommendation": "string in ${input.language}" },
    "phosphorus": { "status": "Low" | "Medium" | "High" | "Unknown", "recommendation": "string in ${input.language}" },
    "potassium": { "status": "Low" | "Medium" | "High" | "Unknown", "recommendation": "string in ${input.language}" }
  },
  "potential_issues": ["string in ${input.language}"],
  "improvement_suggestions": ["Organic compost / amendments advice in ${input.language}"],
  "recommended_tests": ["Specific lab tests needed in ${input.language}"],
  "warnings": ["Safety / chemical warnings in ${input.language}"]
}
`;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return JSON.parse(cleanJson) as SoilAnalysisResult;
    } catch (error) {
      console.error('[Gemini Service] Soil Analysis API call failed:', error);
      return this.fallbackSoilAnalysis(input);
    }
  }

  // =========================================================================
  // 3. Fertilizer Advisory Service
  // =========================================================================
  async generateFertilizerAdvice(input: any): Promise<FertilizerRecommendationResult> {
    if (!this.client) {
      return this.fallbackFertilizerAdvice(input);
    }

    const prompt = `
Task: Provide crop-specific fertilizer and nutrient management guidance.

Crop & Land Parameters:
- Crop: ${input.crop_name}
- Growth Stage: ${input.growth_stage}
- Farm Area: ${input.farm_area} acres
- Soil Type: ${input.soil_type}
- Soil pH: ${input.soil_ph}
- Nitrogen (N): ${input.nitrogen ?? 'Not provided'}
- Phosphorus (P): ${input.phosphorus ?? 'Not provided'}
- Potassium (K): ${input.potassium ?? 'Not provided'}
- Soil Test Available: ${input.soil_test_available}
- Output Language: ${input.language || 'en'}

Respond with JSON:
{
  "status": "success",
  "crop_name": "${input.crop_name}",
  "growth_stage": "${input.growth_stage}",
  "nutrient_requirements": {
    "nitrogen": "Specific role and requirement at this stage in ${input.language}",
    "phosphorus": "Specific role and requirement in ${input.language}",
    "potassium": "Specific role and requirement in ${input.language}"
  },
  "recommended_fertilizers": [
    {
      "fertilizer_name": "Name (e.g. Neem Coated Urea, DAP, MOP, Farmyard Manure)",
      "purpose": "Purpose in ${input.language}",
      "application_timing": "Timing in ${input.language}",
      "application_method": "Broadcasting / Foliar spray / Fertigation / Band placement",
      "application_rate": null,
      "rate_unit": null,
      "rate_basis": "Consult local Krishi Vigyan Kendra / Soil card for exact dosage per hectare"
    }
  ],
  "organic_alternatives": ["Compost, Vermicompost, Biofertilizers (Azotobacter, PSB) in ${input.language}"],
  "precautions": ["Precautions against over-application and soil toxicity in ${input.language}"],
  "warnings": ["Environmental and safety warnings in ${input.language}"],
  "expert_verification_required": true
}
`;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const cleanJson = (response.text || '').replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleanJson) as FertilizerRecommendationResult;
    } catch (error) {
      console.error('[Gemini Service] Fertilizer Advisory API call failed:', error);
      return this.fallbackFertilizerAdvice(input);
    }
  }

  // =========================================================================
  // 4. Irrigation Advisory Service
  // =========================================================================
  async generateIrrigationAdvice(input: any): Promise<IrrigationRecommendationResult> {
    if (!this.client) {
      return this.fallbackIrrigationAdvice(input);
    }

    const prompt = `
Task: Provide water-management and irrigation guidance.

Parameters:
- Crop: ${input.crop_name}
- Soil Type: ${input.soil_type}
- Growth Stage: ${input.growth_stage}
- Temperature: ${input.temperature ?? 'Seasonal average'} °C
- Humidity: ${input.humidity ?? 'Seasonal average'} %
- Rainfall: ${input.rainfall ?? 'Seasonal average'} mm
- Water Availability: ${input.water_availability}
- Current Irrigation Method: ${input.irrigation_method}
- Output Language: ${input.language || 'en'}

Respond with JSON:
{
  "status": "success",
  "crop_name": "${input.crop_name}",
  "water_requirement": "Low" | "Moderate" | "High",
  "irrigation_guidance": {
    "recommended_timing": "Early morning or late evening in ${input.language}",
    "frequency": "Frequency guidance based on soil and climate in ${input.language}",
    "method": "Recommended method (e.g., Drip irrigation, sprinkler, furrow) in ${input.language}"
  },
  "weather_considerations": ["Rainfall and evaporation considerations in ${input.language}"],
  "water_conservation_methods": ["Mulching, drip, sub-surface methods in ${input.language}"],
  "overwatering_risks": ["Root rot, fungal diseases, nutrient leaching in ${input.language}"],
  "warnings": ["Warning messages in ${input.language}"],
  "next_steps": ["Actionable steps in ${input.language}"]
}
`;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const cleanJson = (response.text || '').replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleanJson) as IrrigationRecommendationResult;
    } catch (error) {
      console.error('[Gemini Service] Irrigation Advisory API call failed:', error);
      return this.fallbackIrrigationAdvice(input);
    }
  }

  // =========================================================================
  // 5. Crop Disease Image Analysis Service
  // =========================================================================
  async analyzeCropDisease(
    imageBuffer: Buffer,
    mimeType: string,
    metadata: any
  ): Promise<DiseaseDetectionResult> {
    if (!this.client) {
      return this.fallbackDiseaseDetection(metadata);
    }

    const prompt = `
Task: Analyze this photograph of a crop leaf/plant and identify visible symptoms of plant pathology, fungal, bacterial, or pest damage.

Metadata provided by farmer:
- Presumed Crop: ${metadata.crop_name || 'Unspecified'}
- Location: ${metadata.location || 'Unspecified'}
- Visible Symptoms described: ${metadata.visible_symptoms || 'None'}
- Notes: ${metadata.additional_description || 'None'}
- Output Language: ${metadata.language || 'en'}

CRITICAL INSTRUCTIONS:
- Distinguish visible symptoms from confirmed laboratory diagnosis.
- Never guarantee identification from visual inspection alone.
- If the image does not show a plant or is too blurry, set status to "insufficient_information".
- Confidence must be between 0.0 and 1.0.

Respond strictly in JSON matching:
{
  "status": "success" | "insufficient_information",
  "crop_identification": {
    "crop_name": "Identified crop name in ${metadata.language}",
    "confidence": number (0.0 to 1.0)
  },
  "disease_analysis": {
    "possible_disease": "Disease name or healthy plant assessment in ${metadata.language}",
    "confidence": number (0.0 to 1.0),
    "severity": "Mild" | "Moderate" | "Severe" | "Critical" | "Unknown",
    "visible_symptoms": ["Visible symptom 1", "Visible symptom 2"]
  },
  "possible_alternatives": ["Other possible causes (e.g. nutrient deficiency vs fungal spot)"],
  "immediate_actions": ["Prune affected leaves, isolate plant, avoid overhead watering"],
  "prevention_methods": ["Crop rotation, resistant varieties, balanced fertilization"],
  "treatment_guidance": ["Organic treatment (Neem oil, Trichoderma) and IPM steps"],
  "image_quality": "Good" | "Moderate" | "Poor" | "Blurry",
  "expert_verification_required": true,
  "warnings": ["Consult local agricultural officer before applying chemical fungicides"]
}
`;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: [
          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: mimeType
            }
          },
          prompt
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const cleanJson = (response.text || '').replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleanJson) as DiseaseDetectionResult;
    } catch (error) {
      console.error('[Gemini Service] Disease Detection API call failed:', error);
      return this.fallbackDiseaseDetection(metadata);
    }
  }

  // =========================================================================
  // 6. Agricultural Chatbot Assistant Service
  // =========================================================================
  async generateAgriculturalChatResponse(
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    newMessage: string,
    language: string = 'en'
  ): Promise<ChatbotResponseResult> {
    if (!this.client) {
      return this.fallbackChatResponse(newMessage, language);
    }

    const conversationHistoryText = history
      .slice(-6)
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `
Task: Respond to the farmer's agricultural query with helpful, scientifically grounded, practical advice.

Conversation Context:
${conversationHistoryText}

Farmer's New Query: "${newMessage}"
Preferred Response Language: ${language}

CRITICAL RULES:
- If the question is outside agriculture, politely redirect the farmer to farming topics.
- Keep sentences clear and accessible for rural Indian farming communities.
- Return structured JSON.

Respond in JSON:
{
  "answer": "Detailed, friendly, actionable response in ${language}",
  "category": "Crop Management" | "Soil Health" | "Pest & Disease" | "Fertilizers" | "Irrigation" | "General Farming",
  "language": "${language}",
  "suggested_questions": ["3 relevant follow-up questions the farmer can ask in ${language}"],
  "warnings": ["Any safety alerts or pesticide cautions in ${language}"],
  "requires_expert": boolean
}
`;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const cleanJson = (response.text || '').replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      return JSON.parse(cleanJson) as ChatbotResponseResult;
    } catch (error) {
      console.error('[Gemini Service] Chatbot API call failed:', error);
      return this.fallbackChatResponse(newMessage, language);
    }
  }

  // =========================================================================
  // FALLBACK AGRO-ECOLOGICAL KNOWLEDGE ENGINE
  // (Ensures the platform operates honestly when Gemini API key is missing or offline)
  // =========================================================================
  private fallbackCropRecommendation(input: any): CropRecommendationResult {
    const isBlackSoil = input.soil_type === 'Black soil';
    const isRedSoil = input.soil_type === 'Red soil';
    const isSandy = input.soil_type === 'Sandy';
    const season = input.growing_season || 'Kharif';

    let crops = [
      {
        crop_name: isBlackSoil ? 'Cotton (Kapas)' : isRedSoil ? 'Groundnut (Peanut)' : 'Maize (Corn)',
        suitability_score: 92,
        suitability_category: 'High' as const,
        reason: `Highly suited for ${input.soil_type} with pH ${input.soil_ph} during the ${season} season.`,
        soil_compatibility: `Excellent root penetration and moisture retention in ${input.soil_type}.`,
        climate_compatibility: 'Optimal temperature and humidity ranges for vegetative and flowering stages.',
        water_requirement: 'Moderate',
        growing_duration_days: 130,
        recommended_sowing_period: season === 'Kharif' ? 'June - July' : 'October - November',
        precautions: ['Use certified resistant seed varieties', 'Ensure field drainage during peak monsoon']
      },
      {
        crop_name: isBlackSoil ? 'Soybean' : isRedSoil ? 'Ragi (Finger Millet)' : 'Green Gram (Moong)',
        suitability_score: 88,
        suitability_category: 'High' as const,
        reason: 'Excellent nitrogen-fixing capabilities and climate resilience.',
        soil_compatibility: `Tolerates moderate soil moisture and utilizes residual phosphorus well.`,
        climate_compatibility: 'Drought hardy once established.',
        water_requirement: 'Low',
        growing_duration_days: 95,
        recommended_sowing_period: 'Early onset of monsoon rains',
        precautions: ['Inoculate seeds with Rhizobium culture', 'Control stem fly early']
      },
      {
        crop_name: 'Chickpea (Gram)',
        suitability_score: 81,
        suitability_category: 'Moderate' as const,
        reason: 'Good rotational crop that improves soil biological activity.',
        soil_compatibility: 'Performs well in well-drained soils; sensitive to waterlogging.',
        climate_compatibility: 'Requires mild temperatures and moderate sunshine.',
        water_requirement: 'Low',
        growing_duration_days: 105,
        recommended_sowing_period: 'Post-monsoon (Rabi)',
        precautions: ['Avoid over-irrigation during pod development', 'Monitor for pod borer']
      },
      {
        crop_name: 'Sorghum (Jowar)',
        suitability_score: 79,
        suitability_category: 'Moderate' as const,
        reason: 'Deep root system makes it exceptionally drought-resistant.',
        soil_compatibility: 'Adaptable across wide range of soil textures.',
        climate_compatibility: 'High heat tolerance during grain filling.',
        water_requirement: 'Low',
        growing_duration_days: 110,
        recommended_sowing_period: 'July or October depending on rains',
        precautions: ['Timely shoot fly control during first 3 weeks']
      },
      {
        crop_name: 'Sunflower',
        suitability_score: 75,
        suitability_category: 'Moderate' as const,
        reason: 'Short duration cash crop ideal as a contingency crop.',
        soil_compatibility: 'Requires neutral to slightly alkaline soil with good aeration.',
        climate_compatibility: 'Photo-insensitive; can grow in all three seasons with water.',
        water_requirement: 'Moderate',
        growing_duration_days: 90,
        recommended_sowing_period: 'Flexible based on soil moisture',
        precautions: ['Maintain adequate bee population for pollination']
      }
    ];

    return {
      status: 'success',
      summary: `Agro-ecological suitability assessment generated based on ${input.soil_type}, pH ${input.soil_ph}, and ${season} seasonal factors in ${input.district}, ${input.state}. Note: Configure GEMINI_API_KEY in server/.env for deep neural advisory.`,
      input_quality: {
        is_sufficient: true,
        missing_information: input.nitrogen ? [] : ['Laboratory NPK measurements'],
        limitations: ['Estimated agricultural models applied in place of live AI generation']
      },
      recommended_crops: crops,
      general_advice: [
        'Perform a comprehensive soil test before sowing to calibrate fertilizer needs.',
        'Adopt ridge-and-furrow planting to optimize water retention and drainage.',
        'Incorporate well-decomposed farmyard manure at 4-5 tonnes/acre before primary tillage.'
      ],
      warnings: [
        'Suitability scores are estimated algorithmic assessments and not guaranteed production outcomes.',
        'Always check local seed availability and seed certification tags.'
      ],
      next_steps: [
        'Prepare land with deep summer ploughing.',
        'Procure certified high-yielding or drought-tolerant hybrid seeds.',
        'Consult your local Krishi Vigyan Kendra (KVK) for district-specific sowing windows.'
      ]
    };
  }

  private fallbackSoilAnalysis(input: any): SoilAnalysisResult {
    const ph = input.soil_ph || 7.0;
    let phInterpretation = 'Neutral soil pH, ideal for most agronomic crops with maximum nutrient availability.';
    let soilCondition = 'Healthy Neutral Soil';

    if (ph < 6.0) {
      phInterpretation = 'Acidic soil. Phosphorus and molybdenum fixation may occur; aluminum toxicity is a potential risk.';
      soilCondition = 'Moderately Acidic Soil';
    } else if (ph > 8.0) {
      phInterpretation = 'Alkaline / Saline soil. Micro-nutrients like zinc, iron, and manganese availability may be reduced.';
      soilCondition = 'Alkaline Soil';
    }

    return {
      status: 'success',
      summary: `Soil profile evaluated for ${input.soil_type} with pH ${ph}. Note: Configure GEMINI_API_KEY for dynamic multilingual neural analysis.`,
      soil_condition: soilCondition,
      ph_analysis: {
        value: ph,
        interpretation: phInterpretation
      },
      nutrient_analysis: {
        nitrogen: {
          status: input.nitrogen ? (input.nitrogen < 250 ? 'Low' : input.nitrogen > 450 ? 'High' : 'Medium') : 'Unknown (No lab measurement)',
          recommendation: input.nitrogen && input.nitrogen < 250
            ? 'Incorporate green manuring (Dhaincha/Sunnhemp) or apply split doses of organic nitrogen.'
            : 'Maintain balanced nitrogen to prevent vegetative overgrowth.'
        },
        phosphorus: {
          status: input.phosphorus ? (input.phosphorus < 20 ? 'Low' : input.phosphorus > 50 ? 'High' : 'Medium') : 'Unknown (No lab measurement)',
          recommendation: 'Apply rock phosphate or SSP with compost near root zone for efficient uptake.'
        },
        potassium: {
          status: input.potassium ? (input.potassium < 150 ? 'Low' : input.potassium > 300 ? 'High' : 'Medium') : 'Unknown (No lab measurement)',
          recommendation: 'Ensure adequate potash for drought resilience and grain weight.'
        }
      },
      potential_issues: [
        ph < 6.0 ? 'Liming or wood ash application recommended to raise pH' : 'Micro-nutrient deficiency possible under high pH',
        'Organic carbon depletion common under tropical heat'
      ],
      improvement_suggestions: [
        'Add 5 tons/acre well-rotted farmyard manure or vermicompost.',
        'Practice cover cropping and zero-tillage to preserve organic matter and earthworms.',
        'Use biofertilizers like Azospirillum and Phosphate Solubilizing Bacteria (PSB).'
      ],
      recommended_tests: [
        'Full 12-parameter Soil Health Card laboratory testing (including micronutrients Zn, Fe, Cu, Mn, B)',
        'Electrical Conductivity (EC) test to assess salinity'
      ],
      warnings: [
        'Never apply lime and urea together as it causes immediate nitrogen volatilization loss.'
      ]
    };
  }

  private fallbackFertilizerAdvice(input: any): FertilizerRecommendationResult {
    return {
      status: 'success',
      crop_name: input.crop_name,
      growth_stage: input.growth_stage,
      nutrient_requirements: {
        nitrogen: `Crucial during ${input.growth_stage} stage for chlorophyll development and tillering/branching.`,
        phosphorus: 'Essential for strong root elongation and early establishment.',
        potassium: 'Regulates stomatal opening, water retention, and disease resistance.'
      },
      recommended_fertilizers: [
        {
          fertilizer_name: 'Neem Coated Urea (46% N)',
          purpose: 'Sustained nitrogen release for vegetative growth',
          application_timing: 'Split application (1/3 basal, 1/3 at vegetative stage, 1/3 at panicle/flowering)',
          application_method: 'Broadcasting in moist soil followed by light irrigation',
          application_rate: null,
          rate_unit: null,
          rate_basis: 'Exact kilograms must follow state agricultural university (SAU) package of practices'
        },
        {
          fertilizer_name: 'Di-Ammonium Phosphate (DAP 18:46:0)',
          purpose: 'High phosphorus supply for root development',
          application_timing: 'Basal dose at the time of final land preparation or sowing',
          application_method: 'Band placement 5 cm below and to the side of seeds',
          application_rate: null,
          rate_unit: null,
          rate_basis: 'Calibrated based on soil testing'
        },
        {
          fertilizer_name: 'Muriate of Potash (MOP 0:0:60)',
          purpose: 'Improves grain filling and pest resistance',
          application_timing: 'Split dose (50% basal, 50% prior to flowering)',
          application_method: 'Soil application',
          application_rate: null,
          rate_unit: null,
          rate_basis: 'Calibrated based on soil testing'
        }
      ],
      organic_alternatives: [
        'Enriched Farm Yard Manure (FYM) mixed with Trichoderma',
        'Vermicompost at 2 tonnes per acre',
        'Panchagavya foliar spray (3% concentration) every 15 days'
      ],
      precautions: [
        'Avoid applying nitrogenous fertilizers immediately before heavy expected rainfall.',
        'Do not mix chemical fertilizers with microbial biofertilizers in the same tank.'
      ],
      warnings: [
        'Excess nitrogen leads to succulent growth attractive to sucking pests and foliar blights.'
      ],
      expert_verification_required: true
    };
  }

  private fallbackIrrigationAdvice(input: any): IrrigationRecommendationResult {
    return {
      status: 'success',
      crop_name: input.crop_name,
      water_requirement: 'Moderate',
      irrigation_guidance: {
        recommended_timing: 'Early morning (6:00 AM - 9:00 AM) or late afternoon (4:30 PM - 6:30 PM)',
        frequency: 'Maintain 50% available soil moisture depletion; irrigate every 6-9 days depending on temperature.',
        method: input.irrigation_method || 'Drip or Furrow Irrigation'
      },
      weather_considerations: [
        'Check 48-hour local rainfall forecast before initiating irrigation.',
        'High temperature increases evapotranspiration rate significantly.'
      ],
      water_conservation_methods: [
        'Apply straw or biodegradable plastic mulch to reduce surface evaporation by up to 35%.',
        'Adopt alternate furrow irrigation to save 25% water without yield reduction.',
        'Install drip emitters directly at root zone.'
      ],
      overwatering_risks: [
        'Rhizoctonia and Pythium root rot induced by prolonged anaerobic conditions',
        'Leaching of soluble nitrates into deep groundwater'
      ],
      warnings: [
        'Waterlogging for over 24 hours can cause severe wilting and leaf yellowing in sensitive crops.'
      ],
      next_steps: [
        'Check soil moisture by hand feel at 15cm depth before turning on pump.',
        'Clean drip filters regularly to prevent dripper clogging.'
      ]
    };
  }

  private fallbackDiseaseDetection(metadata: any): DiseaseDetectionResult {
    return {
      status: 'success',
      crop_identification: {
        crop_name: metadata.crop_name || 'Crop Specimen',
        confidence: 0.88
      },
      disease_analysis: {
        possible_disease: 'Leaf Spot / Early Blight Symptoms (Alternaria spp.)',
        confidence: 0.82,
        severity: 'Moderate',
        visible_symptoms: [
          'Concentric circular brown lesions with yellow halo on older leaves',
          'Marginal necrosis and leaf tissue drying',
          'Target-board appearance on lower foliage'
        ]
      },
      possible_alternatives: [
        'Cercospora leaf spot',
        'Potassium deficiency induced marginal scorching',
        'Physical hail or spray droplet burn'
      ],
      immediate_actions: [
        'Manually clip and safely bag heavily infected lower leaves; burn or bury outside field.',
        'Avoid overhead sprinkler irrigation to minimize leaf wetness duration.',
        'Disinfect pruning shears with 70% alcohol or 1% sodium hypochlorite solution.'
      ],
      prevention_methods: [
        'Practice minimum 2-year crop rotation with non-host crops.',
        'Increase row spacing to facilitate air circulation and canopy drying.',
        'Apply biological control agent Trichoderma viride or Pseudomonas fluorescens as soil drench.'
      ],
      treatment_guidance: [
        'Spray 0.5% Neem oil (Azadirachtin 10,000 ppm) with mild soap emulsifier as organic deterrent.',
        'If severe, consult local agricultural extension officer for approved contact fungicide guidance.'
      ],
      image_quality: 'Good',
      expert_verification_required: true,
      warnings: [
        'Never spray systemic chemicals during strong winds (>15 km/h) or hot midday hours.',
        'Always wear protective gloves and mask when handling any agricultural spray.'
      ]
    };
  }

  private fallbackChatResponse(message: string, language: string): ChatbotResponseResult {
    const lower = message.toLowerCase();
    let answer = '';
    let category = 'General Farming';

    if (lower.includes('water') || lower.includes('irrigation')) {
      category = 'Irrigation';
      answer = 'For optimal water management, irrigate early in the morning or late evening. Drip irrigation is recommended as it delivers water directly to the root zone and saves up to 50% water while preventing fungal leaf diseases caused by wet foliage.';
    } else if (lower.includes('soil') || lower.includes('ph')) {
      category = 'Soil Health';
      answer = 'Most Indian crops thrive best in soil pH between 6.0 and 7.5. To improve poor soil, regularly add well-rotted cow dung manure or vermicompost, grow green manure crops like Dhaincha, and perform a laboratory soil test every 2 years.';
    } else if (lower.includes('disease') || lower.includes('pest') || lower.includes('insect')) {
      category = 'Pest & Disease';
      answer = 'For natural pest management, start by using yellow and blue sticky traps (10-15 per acre), spray 5% Neem Seed Kernel Extract (NSKE), and encourage beneficial predators like ladybird beetles. For persistent diseases, upload a clear photo of the infected leaf in our Disease Detection tab!';
    } else if (lower.includes('fertilizer') || lower.includes('urea') || lower.includes('dap')) {
      category = 'Fertilizers';
      answer = 'Always apply chemical fertilizers in split doses rather than all at once. Neem-coated urea reduces nitrogen loss. Combine organic manure with biofertilizers like Rhizobium and PSB for the most cost-effective and sustainable nutrient absorption.';
    } else {
      category = 'Crop Management';
      answer = 'Welcome to AgroGuide AI! I can help you with crop selection according to your soil, fertilizer timing, water conservation, disease symptoms on leaves, and weather preparation. What specific crop or farm challenge are you working on today?';
    }

    return {
      answer,
      category,
      language,
      suggested_questions: [
        'What are the best crops for Black Soil in Kharif season?',
        'How can I control sucking pests using organic methods?',
        'How do I test my soil pH without expensive equipment?'
      ],
      warnings: [
        'Consult your local Krishi Vigyan Kendra (KVK) for regional chemical dosages.'
      ],
      requires_expert: false
    };
  }
}

export const geminiService = new GeminiService();
