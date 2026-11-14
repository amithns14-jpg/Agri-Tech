import React, { useState, useRef } from 'react';
import { Api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  ScanLine,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Info,
  X,
  FileQuestion
} from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../components/common/Components';

export const DiseaseDetectionPage: React.FC = () => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [cropName, setCropName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [location, setLocation] = useState('Dharwad, Karnataka');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5 MB limit. Please select a smaller photo.');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or capture a photograph of the infected plant leaf.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (cropName) formData.append('crop_name', cropName);
      if (symptoms) formData.append('visible_symptoms', symptoms);
      if (location) formData.append('location', location);
      formData.append('language', language);

      const res: any = await Api.detectDisease(formData);
      if (res.data) {
        setResult(res.data.analysis);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze crop photograph');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2">
          <ScanLine className="h-3.5 w-3.5 text-rose-600" />
          <span>Computer Vision & Pathology Diagnostic</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          AI Plant Disease & Pest Symptom Identification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Upload or capture a close-up photograph of discolored, spotted, or wilted crop leaves for multi-modal Gemini AI diagnosis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-base text-slate-800 pb-3 border-b border-slate-100">
            Upload Crop Photograph
          </h2>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Dropzone */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                id="crop_image_input"
              />

              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Uploaded Crop Preview"
                    className="object-contain max-h-64 w-full"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="crop_image_input"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl bg-slate-50/50 hover:bg-brand-50/30 cursor-pointer transition-all text-center"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600 mb-3 border border-slate-200">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">Click or Drag to Upload Crop Photo</span>
                  <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP (Max 5 MB)</span>
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Presumed Crop Name (Optional)</label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Tomato, Cotton, Chilli, Paddy"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observed Symptoms (Optional)</label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Yellowing margins, concentric brown spots, white powdery coating on underside"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-3 mt-2"
              rightIcon={<ScanLine className="h-4 w-4" />}
            >
              Analyze Leaf with Gemini Vision
            </Button>
          </form>
        </div>

        {/* Diagnosis Output */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <LoadingSpinner text="Gemini AI is scanning pixel textures for leaf pathology, fungus, and pest markers..." />
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Main Diagnosis Card */}
              <div className="bg-gradient-to-br from-slate-900 to-rose-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={result.disease_analysis?.severity === 'Critical' ? 'danger' : 'warning'}>
                    Severity: {result.disease_analysis?.severity || 'Moderate'}
                  </Badge>
                  <span className="text-xs text-slate-300">
                    AI Confidence: <strong>{Math.round((result.disease_analysis?.confidence || 0.85) * 100)}%</strong>
                  </span>
                </div>

                <div>
                  <span className="text-xs text-rose-300 uppercase tracking-wider block font-semibold">
                    Identified Pathology
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {result.disease_analysis?.possible_disease}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Crop Identified: <strong>{result.crop_identification?.crop_name}</strong>
                  </p>
                </div>

                {/* Visible Symptoms */}
                {result.disease_analysis?.visible_symptoms && (
                  <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-200">
                    <span className="font-bold text-white block">Detected Visual Markers:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {result.disease_analysis.visible_symptoms.map((sym: string, sIdx: number) => (
                        <li key={sIdx}>{sym}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Immediate First Aid Actions */}
              {result.immediate_actions && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Immediate Containment Actions</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {result.immediate_actions.map((act: string, aIdx: number) => (
                      <li key={aIdx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment & Organic Control */}
              {result.treatment_guidance && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-600" />
                    <span>Treatment & Integrated Pest Management (IPM)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {result.treatment_guidance.map((trt: string, tIdx: number) => (
                      <li key={tIdx}>{trt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mandatory Responsible AI Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Important Diagnostic Notice:</span>
                </span>
                <p className="leading-relaxed">
                  Visual AI analysis provides initial symptom evaluation and cannot replace microscopic lab testing. Before purchasing commercial fungicides, confirm with your local Krishi Vigyan Kendra (KVK) or block agricultural officer.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ScanLine className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Awaiting Crop Photograph</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Take a clear, well-lit photo of the affected plant leaf and submit it to receive instant symptom breakdown and organic treatment steps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
