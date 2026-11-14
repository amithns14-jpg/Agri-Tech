import React, { useState } from 'react';
import { Api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Trees,
  Sparkles,
  AlertTriangle,
  Calendar,
  Layers,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../components/common/Components';

const SOIL_TYPES = [
  'Sandy', 'Clay', 'Silty', 'Loamy', 'Black soil', 'Red soil', 'Alluvial soil', 'Laterite soil', 'Other / Unknown'
];

const GROWTH_STAGES = [
  'Basal / Sowing Preparation',
  'Seedling / Emergence',
  'Vegetative Growth & Tillering',
  'Flowering & Panicle Initiation',
  'Fruit / Pod Development',
  'Maturity / Pre-harvest'
];

export const FertilizerPage: React.FC = () => {
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    crop_name: 'Cotton',
    growth_stage: 'Vegetative Growth & Tillering',
    soil_type: 'Black soil',
    soil_ph: 7.2,
    nitrogen: 260,
    phosphorus: 20,
    potassium: 300,
    farm_area: 3.0,
    soil_test_available: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res: any = await Api.recommendFertilizer({ ...formData, language });
      if (res.data) {
        setResult(res.data.recommendation);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate fertilizer guidance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
          <Trees className="h-3.5 w-3.5 text-emerald-600" />
          <span>Nutrient & Fertilizer Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Crop-Specific Fertilizer & Soil Nutrition Guidance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Stage-specific nutrient schedules combining chemical fertilizer efficiency with biological and organic compost alternatives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-base text-slate-800 pb-3 border-b border-slate-100">
            Crop & Field Nutrient Parameters
          </h2>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop Name *</label>
              <input
                type="text"
                required
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                placeholder="e.g. Cotton, Maize, Groundnut, Wheat"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Growth Stage *</label>
              <select
                value={formData.growth_stage}
                onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                {GROWTH_STAGES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                <select
                  value={formData.soil_type}
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {SOIL_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Field Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.farm_area}
                  onChange={(e) => setFormData({ ...formData, farm_area: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="soil_test_cb"
                checked={formData.soil_test_available}
                onChange={(e) => setFormData({ ...formData, soil_test_available: e.target.checked })}
                className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="soil_test_cb" className="text-xs text-slate-700 font-medium">
                Soil Health Card / Lab test available
              </label>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 mt-2"
              rightIcon={<Trees className="h-4 w-4" />}
            >
              Generate Fertilizer Advisory
            </Button>
          </form>
        </div>

        {/* Advisory Output */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <LoadingSpinner text="Computing stage-specific nutrient requirements with Gemini AI..." />
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Overview Header */}
              <div className="bg-gradient-to-br from-emerald-900 to-brand-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="brand">{result.crop_name}</Badge>
                  <span className="text-xs text-emerald-200">Stage: <strong>{result.growth_stage}</strong></span>
                </div>
                <h3 className="text-xl font-black">Nutrient Absorption Priorities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-100 pt-2 border-t border-white/10">
                  <div>
                    <strong className="block text-white">Nitrogen Role:</strong>
                    <span>{result.nutrient_requirements?.nitrogen}</span>
                  </div>
                  <div>
                    <strong className="block text-white">Phosphorus Role:</strong>
                    <span>{result.nutrient_requirements?.phosphorus}</span>
                  </div>
                  <div>
                    <strong className="block text-white">Potassium Role:</strong>
                    <span>{result.nutrient_requirements?.potassium}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Fertilizers List */}
              <div className="space-y-4">
                <h4 className="font-bold text-base text-slate-900">Recommended Fertilizer Options & Application</h4>
                {result.recommended_fertilizers?.map((fert: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-base text-slate-900">{fert.fertilizer_name}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">{fert.purpose}</p>
                      </div>
                      <Badge variant="neutral">{fert.application_method}</Badge>
                    </div>

                    <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-slate-600">
                      <div>
                        <span className="text-slate-400">Timing: </span>
                        <strong className="text-slate-800">{fert.application_timing}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Dosage Note: </span>
                        <span className="text-slate-700 italic">{fert.rate_basis}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Organic Alternatives */}
              {result.organic_alternatives && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-emerald-600" />
                    <span>Biofertilizers & Organic Alternatives</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {result.organic_alternatives.map((alt: string, aIdx: number) => (
                      <li key={aIdx}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Important Warnings */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Important Safety & Environmental Notice:</span>
                </span>
                <p className="leading-relaxed">
                  Never apply chemical fertilizer right before heavy rains to prevent toxic runoff into water bodies. Consult your local agricultural university package of practices for calibrated dosage per acre.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Trees className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Fertilizer Request</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Select your cultivated crop and current growth stage on the left to receive optimized split-dose fertilizer timings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
