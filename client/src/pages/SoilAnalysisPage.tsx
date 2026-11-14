import React, { useState } from 'react';
import { Api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  FlaskConical,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  TestTube2,
  FileCheck2
} from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../components/common/Components';

const SOIL_TYPES = [
  'Sandy', 'Clay', 'Silty', 'Loamy', 'Black soil', 'Red soil', 'Alluvial soil', 'Laterite soil', 'Other / Unknown'
];

export const SoilAnalysisPage: React.FC = () => {
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    soil_type: 'Black soil',
    soil_ph: 6.5,
    nitrogen: 240,
    phosphorus: 18,
    potassium: 290,
    organic_carbon: 0.55,
    soil_moisture: 22,
    crop_currently_cultivated: 'Cotton'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res: any = await Api.analyzeSoil({ ...formData, language });
      if (res.data) {
        setResult(res.data.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze soil data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-2">
          <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
          <span>Soil Health & Chemical Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          AI Soil Health & Nutrient Deficiency Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Diagnose soil pH imbalances, macro-nutrient availability, and organic matter status with tailored biological and mineral soil amendments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Soil Input Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-base text-slate-800 pb-3 border-b border-slate-100">
            Laboratory / Field Test Inputs
          </h2>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type *</label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                {SOIL_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Soil pH (0.0 - 14.0) *</label>
                <span className="text-xs font-bold text-brand-700">{formData.soil_ph}</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                step="0.1"
                value={formData.soil_ph}
                onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>4.0 (Acidic)</span>
                <span>7.0 (Neutral)</span>
                <span>10.0 (Alkaline)</span>
              </div>
            </div>

            {/* Nutrients N-P-K */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Available Nutrients (kg/ha or mg/kg)</span>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Nitrogen (N)</label>
                  <input
                    type="number"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Phosphorus (P)</label>
                  <input
                    type="number"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Potassium (K)</label>
                  <input
                    type="number"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organic Carbon (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.organic_carbon}
                  onChange={(e) => setFormData({ ...formData, organic_carbon: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Moisture (%)</label>
                <input
                  type="number"
                  value={formData.soil_moisture}
                  onChange={(e) => setFormData({ ...formData, soil_moisture: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currently Cultivated Crop</label>
              <input
                type="text"
                value={formData.crop_currently_cultivated}
                onChange={(e) => setFormData({ ...formData, crop_currently_cultivated: e.target.value })}
                placeholder="e.g. Cotton, Groundnut, Sugarcane"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 mt-2"
              rightIcon={<FlaskConical className="h-4 w-4" />}
            >
              Run Soil Health Diagnosis
            </Button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <LoadingSpinner text="Evaluating soil chemical equilibrium and nutrient deficiencies..." />
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Condition Banner */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="warning">Diagnostic Assessment</Badge>
                  <span className="text-xs text-slate-300">pH Value: <strong>{result.ph_analysis?.value || formData.soil_ph}</strong></span>
                </div>
                <h3 className="text-xl font-black">{result.soil_condition}</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {result.summary}
                </p>
                <div className="pt-2 text-xs text-brand-300 bg-white/5 p-3 rounded-xl border border-white/10">
                  <strong>pH Interpretation:</strong> {result.ph_analysis?.interpretation}
                </div>
              </div>

              {/* Nutrients Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nitrogen (N)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900">{formData.nitrogen} kg/ha</span>
                    <Badge variant={result.nutrient_analysis?.nitrogen?.status === 'High' ? 'danger' : result.nutrient_analysis?.nitrogen?.status === 'Low' ? 'warning' : 'success'}>
                      {result.nutrient_analysis?.nitrogen?.status || 'Moderate'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {result.nutrient_analysis?.nitrogen?.recommendation}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phosphorus (P)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900">{formData.phosphorus} kg/ha</span>
                    <Badge variant={result.nutrient_analysis?.phosphorus?.status === 'High' ? 'danger' : result.nutrient_analysis?.phosphorus?.status === 'Low' ? 'warning' : 'success'}>
                      {result.nutrient_analysis?.phosphorus?.status || 'Moderate'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {result.nutrient_analysis?.phosphorus?.recommendation}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potassium (K)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900">{formData.potassium} kg/ha</span>
                    <Badge variant={result.nutrient_analysis?.potassium?.status === 'High' ? 'danger' : result.nutrient_analysis?.potassium?.status === 'Low' ? 'warning' : 'success'}>
                      {result.nutrient_analysis?.potassium?.status || 'Moderate'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {result.nutrient_analysis?.potassium?.recommendation}
                  </p>
                </div>
              </div>

              {/* Improvement Suggestions */}
              {result.improvement_suggestions && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-brand-600" />
                    <span>Soil Health Improvement Guidance</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {result.improvement_suggestions.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Lab Tests & Warnings */}
              {result.recommended_tests && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs space-y-1.5 text-amber-900">
                  <span className="font-bold block flex items-center gap-1.5">
                    <TestTube2 className="h-3.5 w-3.5" />
                    Recommended Laboratory Tests for Confirmation:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                    {result.recommended_tests.map((test: string, idx: number) => (
                      <li key={idx}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Soil Information</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Provide your soil pH and nutrient values from your Soil Health Card or test report to compute detailed nutrient status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
