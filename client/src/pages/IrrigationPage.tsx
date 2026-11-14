import React, { useState } from 'react';
import { Api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Droplets,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Waves,
  Sun,
  CheckCircle2
} from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../components/common/Components';

const SOIL_TYPES = [
  'Sandy', 'Clay', 'Silty', 'Loamy', 'Black soil', 'Red soil', 'Alluvial soil', 'Laterite soil', 'Other / Unknown'
];

const WATER_TYPES = [
  'Low', 'Moderate', 'High', 'Rain-fed', 'Irrigation available'
];

export const IrrigationPage: React.FC = () => {
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    crop_name: 'Sugarcane',
    growth_stage: 'Formative / Tillering Stage',
    soil_type: 'Black soil',
    water_availability: 'Irrigation available',
    temperature: 32,
    humidity: 60,
    rainfall: 0,
    irrigation_method: 'Drip Irrigation'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res: any = await Api.recommendIrrigation({ ...formData, language });
      if (res.data) {
        setResult(res.data.recommendation);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate irrigation advisory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold mb-2">
          <Droplets className="h-3.5 w-3.5 text-cyan-600" />
          <span>Water Resource & Moisture Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Smart Irrigation & Water Scheduling Advisory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Conserve groundwater and prevent waterlogging root asphyxiation with evapotranspiration-aware irrigation scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-base text-slate-800 pb-3 border-b border-slate-100">
            Water Management Inputs
          </h2>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Cultivated *</label>
              <input
                type="text"
                required
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                placeholder="e.g. Rice, Cotton, Maize, Tomato"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage *</label>
              <input
                type="text"
                required
                value={formData.growth_stage}
                onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                placeholder="e.g. Flowering, Vegetative, Seedling"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Water Source</label>
                <select
                  value={formData.water_availability}
                  onChange={(e) => setFormData({ ...formData, water_availability: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {WATER_TYPES.map(wt => <option key={wt} value={wt}>{wt}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Temp (°C)</label>
                <input
                  type="number"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Humidity (%)</label>
                <input
                  type="number"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Rainfall (mm)</label>
                <input
                  type="number"
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation Method Used</label>
              <select
                value={formData.irrigation_method}
                onChange={(e) => setFormData({ ...formData, irrigation_method: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                <option value="Drip Irrigation">Drip Irrigation (Micro-irrigation)</option>
                <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                <option value="Furrow / Ridge Irrigation">Furrow / Ridge Irrigation</option>
                <option value="Flood / Basin Irrigation">Flood / Basin Irrigation</option>
                <option value="Rain-fed / Natural">Rain-fed / Natural</option>
              </select>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 mt-2"
              rightIcon={<Droplets className="h-4 w-4" />}
            >
              Compute Water Management Plan
            </Button>
          </form>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <LoadingSpinner text="Calculating evapotranspiration and soil water depletion rates..." />
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Timing Card */}
              <div className="bg-gradient-to-br from-cyan-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="info">Water Requirement: {result.water_requirement}</Badge>
                  <span className="text-xs text-cyan-200">{result.crop_name}</span>
                </div>
                <h3 className="text-xl font-black">Irrigation Timing & Frequency</h3>
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div>
                    <span className="text-cyan-300 block font-semibold">Recommended Hours:</span>
                    <span>{result.irrigation_guidance?.recommended_timing}</span>
                  </div>
                  <div>
                    <span className="text-cyan-300 block font-semibold">Application Frequency:</span>
                    <span>{result.irrigation_guidance?.frequency}</span>
                  </div>
                </div>
              </div>

              {/* Water Conservation Methods */}
              {result.water_conservation_methods && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Waves className="h-4 w-4 text-cyan-600" />
                    <span>Water Conservation Strategies</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {result.water_conservation_methods.map((method: string, mIdx: number) => (
                      <li key={mIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span>{method}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overwatering Hazards */}
              {result.overwatering_risks && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Overwatering Risks to Avoid:
                  </span>
                  <ul className="list-disc list-inside text-rose-800 space-y-0.5">
                    {result.overwatering_risks.map((risk: string, rIdx: number) => (
                      <li key={rIdx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Irrigation Inquiry</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Provide your crop and weather values on the left to receive a scientific watering schedule and water-saving measures.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
