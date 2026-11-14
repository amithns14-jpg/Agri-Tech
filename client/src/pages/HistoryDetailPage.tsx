import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Api } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  Trash2,
  Sprout,
  FlaskConical,
  Trees,
  Droplets,
  ScanLine,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../components/common/Components';

export const HistoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      try {
        const res: any = await Api.getHistoryDetail(id);
        if (res.data) setRecord(res.data);
      } catch (err: any) {
        setError(err.message || 'Advisory record not found');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this advisory permanently?')) return;
    try {
      await Api.deleteHistoryItem(id);
      navigate('/history');
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving complete advisory document..." />;

  if (error || !record) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-600 font-medium">{error || 'Record not found'}</p>
        <Link to="/history">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  const type = record.advisory_type || 'crop';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Advisory History</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(record.created_at).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="Delete Advisory"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advisory Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              {type === 'crop' && <Sprout className="h-5 w-5" />}
              {type === 'soil' && <FlaskConical className="h-5 w-5" />}
              {type === 'fertilizer' && <Trees className="h-5 w-5" />}
              {type === 'irrigation' && <Droplets className="h-5 w-5" />}
              {type === 'disease' && <ScanLine className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 capitalize">
                {type} Advisory Record
              </h2>
              <p className="text-xs text-slate-400">ID: {record.id}</p>
            </div>
          </div>
          <Badge variant="brand">{type.toUpperCase()}</Badge>
        </div>

        {/* CROP RECOMMENDATION VIEW */}
        {type === 'crop' && record.recommendations && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>Summary:</strong> {record.summary || record.recommendations?.summary}
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-base text-slate-900">Recommended Crops:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {record.recommendations.recommended_crops?.map((c: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{c.crop_name}</h4>
                      <Badge variant="success">{c.suitability_score} / 100</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{c.reason}</p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Duration: <strong>{c.growing_duration_days} days</strong> | Water: <strong>{c.water_requirement}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SOIL ANALYSIS VIEW */}
        {type === 'soil' && record.analysis_result && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
              <h3 className="font-black text-lg">{record.analysis_result.soil_condition}</h3>
              <p className="text-xs text-slate-200">{record.analysis_result.summary}</p>
            </div>
            {record.analysis_result.improvement_suggestions && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-bold text-xs text-slate-800 block">Soil Amendments:</span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {record.analysis_result.improvement_suggestions.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* FERTILIZER ADVISORY VIEW */}
        {type === 'fertilizer' && record.recommendation && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-emerald-900 text-white space-y-2">
              <h3 className="font-bold text-lg">Crop: {record.crop_name}</h3>
              <p className="text-xs text-emerald-100">Growth Stage: {record.recommendation.growth_stage}</p>
            </div>
            <div className="space-y-3">
              {record.recommendation.recommended_fertilizers?.map((f: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 text-sm">
                    <span>{f.fertilizer_name}</span>
                    <Badge variant="neutral">{f.application_method}</Badge>
                  </div>
                  <p className="text-slate-500">{f.purpose}</p>
                  <p className="text-slate-600 pt-1">Timing: <strong>{f.application_timing}</strong></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IRRIGATION VIEW */}
        {type === 'irrigation' && record.recommendation && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-cyan-900 text-white space-y-2">
              <h3 className="font-bold text-lg">{record.crop_name} Water Management</h3>
              <p className="text-xs text-cyan-200">Water Requirement: {record.recommendation.water_requirement}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 text-xs space-y-1.5 text-slate-700">
              <p>Timing: <strong>{record.recommendation.irrigation_guidance?.recommended_timing}</strong></p>
              <p>Frequency: <strong>{record.recommendation.irrigation_guidance?.frequency}</strong></p>
            </div>
          </div>
        )}

        {/* DISEASE VIEW */}
        {type === 'disease' && record.image_analysis && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-rose-950 text-white space-y-2">
              <h3 className="font-black text-xl">{record.image_analysis.disease_analysis?.possible_disease}</h3>
              <p className="text-xs text-rose-200">
                Confidence: {Math.round((record.image_analysis.disease_analysis?.confidence || 0.8) * 100)}% | Severity: {record.image_analysis.disease_analysis?.severity}
              </p>
            </div>
            {record.image_path && (
              <div className="rounded-2xl overflow-hidden max-h-64 border border-slate-200 bg-slate-100 flex items-center justify-center">
                <img src={record.image_path} alt="Infected leaf" className="object-contain max-h-64" />
              </div>
            )}
            {record.image_analysis.immediate_actions && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Actions:</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {record.image_analysis.immediate_actions.map((act: string, idx: number) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Input Parameters Snapshot */}
        {record.input_data && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Historical Farm Parameters Snapshot
            </span>
            <pre className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 overflow-x-auto">
              {JSON.stringify(record.input_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
