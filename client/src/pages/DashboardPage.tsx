import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Api } from '../services/api';
import {
  Sprout,
  FlaskConical,
  ScanLine,
  Trees,
  Droplets,
  CloudSun,
  MessageSquareCode,
  Tractor,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { Badge, Button, LoadingSpinner } from '../components/common/Components';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, weatherRes, farmsRes]: any[] = await Promise.all([
          Api.getDashboardStats().catch(() => ({ data: {} })),
          Api.getCurrentWeather(user?.district || 'Dharwad', user?.state || 'Karnataka').catch(() => ({ data: null })),
          Api.getFarms().catch(() => ({ data: [] }))
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (weatherRes.data) setWeather(weatherRes.data);
        if (farmsRes.data) setFarms(farmsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  if (loading) {
    return <LoadingSpinner text="Computing dashboard metrics from database records..." />;
  }

  const statCards = [
    {
      title: t('total_advisories'),
      count: stats?.total_advisories || 0,
      icon: TrendingUp,
      color: 'text-brand-600',
      bg: 'bg-brand-50'
    },
    {
      title: t('crop_recommendations'),
      count: stats?.crop_recommendations_count || 0,
      icon: Sprout,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: t('soil_analyses'),
      count: stats?.soil_analyses_count || 0,
      icon: FlaskConical,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: t('disease_scans'),
      count: stats?.disease_analyses_count || 0,
      icon: ScanLine,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    }
  ];

  const quickActions = [
    {
      to: '/crop-recommendation',
      title: 'Run Crop Advisory',
      desc: 'Top 5 suitable crops based on soil pH, N-P-K, and climate',
      icon: Sprout,
      color: 'bg-emerald-600'
    },
    {
      to: '/disease-detection',
      title: 'Scan Plant Leaf Disease',
      desc: 'Instant AI leaf pathology diagnosis & organic cure',
      icon: ScanLine,
      color: 'bg-rose-600'
    },
    {
      to: '/soil-analysis',
      title: 'Analyze Soil Health',
      desc: 'Evaluate nutrient deficiencies & soil amendments',
      icon: FlaskConical,
      color: 'bg-amber-600'
    },
    {
      to: '/chatbot',
      title: 'Ask AI Agricultural Expert',
      desc: 'Live interactive problem solving in 6 languages',
      icon: MessageSquareCode,
      color: 'bg-indigo-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-800 via-brand-700 to-emerald-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-100 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-brand-300" />
              <span>Namaste, {user?.full_name || 'Farmer'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Farm Management Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-brand-100/80 max-w-xl">
              Location: <strong>{user?.district || 'Dharwad'}, {user?.state || 'Karnataka'}</strong>. Your AI agricultural advisory records are up to date.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/farm"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <Tractor className="h-4 w-4" />
              <span>Manage Plots ({farms.length})</span>
            </Link>
            <Link
              to="/crop-recommendation"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-brand-50 text-brand-900 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Sprout className="h-4 w-4 text-brand-700" />
              <span>New Advisory</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Analytics Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{card.count}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weather & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weather Radar Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <CloudSun className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Local Agro-Weather</h3>
                  <p className="text-xs text-slate-400">{weather?.location || 'Regional'}</p>
                </div>
              </div>
              <Badge variant={weather?.is_live ? 'success' : 'neutral'}>
                {weather?.is_live ? 'Live Sensor' : 'Agro-Climate'}
              </Badge>
            </div>

            <div className="py-6 flex items-center justify-between">
              <div>
                <div className="text-4xl font-extrabold text-slate-900">
                  {weather?.temperature || 28}°C
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {weather?.weather_condition || 'Partly Cloudy'}
                </p>
              </div>
              <div className="text-right space-y-1 text-xs text-slate-600">
                <p>Humidity: <strong className="text-slate-900">{weather?.humidity || 60}%</strong></p>
                <p>Rainfall: <strong className="text-slate-900">{weather?.rainfall || 0} mm</strong></p>
                <p>Wind: <strong className="text-slate-900">{weather?.wind_speed || 10} km/h</strong></p>
              </div>
            </div>

            {/* Weather Agro-Advisory Note */}
            {weather?.agricultural_insights && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2 text-slate-700">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-brand-600" />
                  <span>Sowing Suitability</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  {weather.agricultural_insights.sowing_suitability}
                </p>
                {weather.agricultural_insights.extreme_weather_alert && (
                  <div className="pt-2 text-rose-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{weather.agricultural_insights.extreme_weather_alert}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/weather"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-between"
            >
              <span>View 5-Day Rainfall & Spray Forecast</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Agricultural Tools Launchpad</h3>
            <span className="text-xs text-slate-400">One-click recommendations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  to={action.to}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all group flex items-start gap-4"
                >
                  <div className={`h-11 w-11 rounded-xl ${action.color} text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-brand-700 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Recent Activity List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Recent Advisory History
                </h4>
              </div>
              <Link to="/history" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View All
              </Link>
            </div>

            {stats?.recent_activities && stats.recent_activities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.recent_activities.map((act: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{act.title}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">{act.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                      {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                No previous advisories recorded yet. Run a crop recommendation or soil test to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
