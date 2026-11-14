import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  FlaskConical,
  Trees,
  Droplets,
  ScanLine,
  CloudSun,
  MessageSquareCode,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const features = [
    {
      icon: Sprout,
      title: 'AI Crop Recommendation',
      desc: 'Matches your specific soil pH, N-P-K nutrients, climate, and season to the top 5 highest potential crops.',
      to: '/crop-recommendation',
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: FlaskConical,
      title: 'Soil Health Analysis',
      desc: 'Evaluates nutrient deficiencies, soil acidity/alkalinity, and recommends targeted organic amendments.',
      to: '/soil-analysis',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      icon: ScanLine,
      title: 'Crop Disease Detection',
      desc: 'Upload a smartphone photo of damaged crop leaves for instant visual diagnosis, severity rating, and IPM cure.',
      to: '/disease-detection',
      color: 'from-rose-500 to-red-600'
    },
    {
      icon: Trees,
      title: 'Fertilizer Optimization',
      desc: 'Crop-growth stage fertilizer guidance with timing, methods, and biofertilizer alternatives.',
      to: '/fertilizer-advisory',
      color: 'from-lime-500 to-emerald-600'
    },
    {
      icon: Droplets,
      title: 'Smart Irrigation Advisory',
      desc: 'Weather-aware water requirements, conservation methods, and overwatering hazard alerts.',
      to: '/irrigation-advisory',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: MessageSquareCode,
      title: 'Multilingual AI Chatbot',
      desc: 'Ask any farming query in English, Hindi, Kannada, Telugu, Tamil, or Malayalam and get instant expert answers.',
      to: '/chatbot',
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-200 border border-white/15 text-xs font-semibold">
            <Sparkles className="h-4 w-4 text-brand-300" />
            <span>Official Google Gemini 2.5 Agricultural Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {t('hero_title')}
          </h1>

          <p className="text-base sm:text-lg text-brand-100/90 leading-relaxed max-w-2xl">
            {t('hero_subtitle')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-brand-900 font-bold hover:bg-brand-50 shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{user ? t('nav_dashboard') : t('get_started')}</span>
              <ArrowRight className="h-5 w-5 text-brand-700" />
            </Link>

            <Link
              to="/crop-recommendation"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-700/60 hover:bg-brand-700 text-white font-semibold border border-white/20 backdrop-blur-sm transition-all"
            >
              <Sprout className="h-5 w-5 text-brand-300" />
              <span>{t('nav_crops')}</span>
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-brand-100">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">6</p>
              <p className="text-xs text-brand-200">Indian Languages</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Top 5</p>
              <p className="text-xs text-brand-200">Suitable Crops</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">5 MB</p>
              <p className="text-xs text-brand-200">Disease Photo Scan</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-brand-200">Scientific Calibration</p>
            </div>
          </div>
        </div>

        {/* Decorative background blurs */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 top-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      </section>

      {/* Feature Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Complete Agricultural Intelligence Suite
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Designed to eliminate guesswork from Indian farming, from pre-sowing soil prep to post-harvest management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link
                key={idx}
                to={feat.to}
                className="group relative p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-700 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore Tool</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How AgroGuide AI Works for You
          </h2>
          <p className="text-sm text-slate-600">
            Four simple steps tailored for first-time smartphone users and experienced cultivators alike.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-black text-brand-100 absolute top-4 right-4">01</span>
            <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-3">1</div>
            <h4 className="font-bold text-slate-800 text-base">Setup Farm Profile</h4>
            <p className="text-xs text-slate-500 mt-1">Specify your district, soil type, land area, and available water resources.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-black text-brand-100 absolute top-4 right-4">02</span>
            <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-3">2</div>
            <h4 className="font-bold text-slate-800 text-base">Enter Soil or Photo</h4>
            <p className="text-xs text-slate-500 mt-1">Input test parameters or upload a photograph of an affected crop leaf.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-black text-brand-100 absolute top-4 right-4">03</span>
            <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-3">3</div>
            <h4 className="font-bold text-slate-800 text-base">Gemini AI Synthesis</h4>
            <p className="text-xs text-slate-500 mt-1">Our server validates data and runs agro-ecological models with Gemini.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
            <span className="text-3xl font-black text-brand-100 absolute top-4 right-4">04</span>
            <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold mb-3">4</div>
            <h4 className="font-bold text-slate-800 text-base">Actionable Advice</h4>
            <p className="text-xs text-slate-500 mt-1">Receive structured recommendations, warnings, and local language guidance.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
