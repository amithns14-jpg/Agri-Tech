import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sprout,
  Sparkles,
  Info,
  Calendar,
  Droplets,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Compass
} from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../components/common/Components';

const SOIL_TYPES = [
  'Sandy', 'Clay', 'Silty', 'Loamy', 'Black soil', 'Red soil', 'Alluvial soil', 'Laterite soil', 'Other / Unknown'
];

const WATER_TYPES = [
  'Low', 'Moderate', 'High', 'Rain-fed', 'Irrigation available'
];

const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Year-round / Perennial'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const CropRecommendationPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');

  const [formData, setFormData] = useState({
    location: user?.district || 'Dharwad',
    state: user?.state || 'Karnataka',
    district: user?.district || 'Dharwad',
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
    previous_crop: 'Pigeon pea (Tur)',
    farming_preference: 'Standard high-yield IPM'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    async function loadFarms() {
      try {
        const res: any = await Api.getFarms();
        if (res.data && res.data.length > 0) {
          setFarms(res.data);
          const first = res.data[0];
          setSelectedFarmId(first.id);
          applyFarm(first);
        }
      } catch (err) {
        console.warn('Could not fetch farms:', err);
      }
    }
    loadFarms();
  }, []);

  const applyFarm = (farm: any) => {
    setFormData(prev => ({
      ...prev,
      location: farm.location,
      state: farm.state,
      district: farm.district,
      soil_type: farm.soil_type || prev.soil_type,
      land_area: farm.land_area,
      land_unit: farm.land_unit,
      water_availability: farm.water_availability || prev.water_availability
    }));
  };

  const handleFarmSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedFarmId(id);
    const farm = farms.find(f => f.id === id);
    if (farm) applyFarm(farm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        farm_id: selectedFarmId || undefined,
        language
      };
      const res: any = await Api.recommendCrops(payload);
      if (res.data) {
        setResult(res.data.recommendation);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
          <span>Gemini Agricultural Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          AI Crop Suitability & Recommendation Advisory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Enter your soil chemical parameters and climatic conditions to discover the top 5 scientifically recommended crops for your land.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-base text-slate-800">Agricultural Input Parameters</h2>
            {farms.length > 0 && (
              <select
                value={selectedFarmId}
                onChange={handleFarmSelect}
                className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="">Load from saved plot...</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.farm_name}</option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location & Season */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Soil Type & pH */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type *</label>
                <select
                  required
                  value={formData.soil_type}
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {SOIL_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Soil pH (0 - 14) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  required
                  value={formData.soil_ph}
                  onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) || 7 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Nutrients N-P-K */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">Soil Nutrients (mg/kg or kg/ha)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Nitrogen (N)</label>
                  <input
                    type="number"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Phosphorus (P)</label>
                  <input
                    type="number"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Potassium (K)</label>
                  <input
                    type="number"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Water & Season */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Growing Season *</label>
                <select
                  value={formData.growing_season}
                  onChange={(e) => setFormData({ ...formData, growing_season: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Water Source *</label>
                <select
                  value={formData.water_availability}
                  onChange={(e) => setFormData({ ...formData, water_availability: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {WATER_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {/* Land Area & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Land Area *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.land_area}
                  onChange={(e) => setFormData({ ...formData, land_area: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit *</label>
                <select
                  value={formData.land_unit}
                  onChange={(e) => setFormData({ ...formData, land_unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="acre">Acres</option>
                  <option value="hectare">Hectares</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Crop Cultivated</label>
              <input
                type="text"
                value={formData.previous_crop}
                onChange={(e) => setFormData({ ...formData, previous_crop: e.target.value })}
                placeholder="Soybean, Cotton, Wheat..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 mt-2"
              rightIcon={<Sprout className="h-4 w-4" />}
            >
              Generate AI Crop Advisory
            </Button>
          </form>
        </div>

        {/* Advisory Output Column */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <LoadingSpinner text="Gemini AI is analyzing soil chemistry, season, and regional agro-ecological models..." />
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-brand-900 to-emerald-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-2 text-brand-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Agricultural Suitability Synthesis</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-brand-50">
                  {result.summary}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-brand-200">
                  <span>Soil: <strong>{formData.soil_type}</strong> (pH {formData.soil_ph})</span>
                  <span>Season: <strong>{formData.growing_season}</strong></span>
                  <span>Region: <strong>{formData.district}, {formData.state}</strong></span>
                </div>
              </div>

              {/* Recommended Crops Cards (Top 5) */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-brand-600" />
                  <span>Top Suitable Crops for Your Farm</span>
                </h3>

                {result.recommended_crops?.map((crop: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <h4 className="text-xl font-black text-slate-900">{crop.crop_name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{crop.reason}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Score</span>
                          <span className="text-2xl font-black text-brand-700">{crop.suitability_score} / 100</span>
                        </div>
                        <Badge variant={crop.suitability_category === 'High' ? 'success' : 'warning'}>
                          {crop.suitability_category} Suitability
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Growing Duration</span>
                        <strong className="text-slate-800">{crop.growing_duration_days} Days</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Sowing Period</span>
                        <strong className="text-slate-800">{crop.recommended_sowing_period}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Water Need</span>
                        <strong className="text-slate-800">{crop.water_requirement}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Soil Affinity</span>
                        <strong className="text-slate-800">{crop.soil_compatibility}</strong>
                      </div>
                    </div>

                    {/* Precautions */}
                    {crop.precautions && crop.precautions.length > 0 && (
                      <div className="text-xs space-y-1">
                        <span className="font-semibold text-slate-700 block">Critical Precautions:</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {crop.precautions.map((p: string, pIdx: number) => (
                            <li key={pIdx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* General Advice & Warnings */}
              {result.general_advice && (
                <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-200/60 text-xs space-y-2">
                  <span className="font-bold text-brand-900 block">Agronomic Recommendations & Next Steps:</span>
                  <ul className="list-disc list-inside text-brand-800 space-y-1">
                    {result.general_advice.map((adv: string, aIdx: number) => (
                      <li key={aIdx}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Farm Input Data</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Fill in your soil parameters on the left and click "Generate AI Crop Advisory" to compute customized crop rankings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
