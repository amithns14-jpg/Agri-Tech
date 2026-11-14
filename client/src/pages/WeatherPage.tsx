import React, { useState, useEffect } from 'react';
import { Api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Compass,
  AlertTriangle,
  Calendar,
  Search,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button, Badge, LoadingSpinner } from '../components/common/Components';

export const WeatherPage: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.district || 'Dharwad');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [weather, setWeather] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  async function fetchWeather() {
    setLoading(true);
    try {
      const res: any = await Api.getWeatherForecast(location, state);
      if (res.data) setWeather(res.data);
    } catch (err: any) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-2">
            <CloudSun className="h-3.5 w-3.5 text-sky-600" />
            <span>Agro-Meteorological Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Weather Radar & Agricultural Farming Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time and seasonal meteorological forecasts translated into field operations advice.
          </p>
        </div>

        {/* Location Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search District..."
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white shadow-sm"
          />
          <Button type="submit" size="sm" leftIcon={<Search className="h-3.5 w-3.5" />}>
            Search
          </Button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving atmospheric telemetry and agro-climatic indices..." />
      ) : weather ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Current Conditions Card */}
          <div className="bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={weather.is_live ? 'success' : 'neutral'}>
                    {weather.is_live ? 'Live Station' : 'Agro-Climatic Baseline'}
                  </Badge>
                  <span className="text-xs text-slate-300">{weather.provider}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">{weather.location}</h2>
                <p className="text-sm text-sky-200 mt-0.5">{weather.weather_condition}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black">{weather.temperature}</span>
                <span className="text-2xl text-sky-300 font-semibold">°C</span>
              </div>
            </div>

            {/* Environmental Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-sky-300 text-xs mb-1">
                  <Droplets className="h-4 w-4" />
                  <span>Humidity</span>
                </div>
                <p className="text-xl font-bold">{weather.humidity}%</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-sky-300 text-xs mb-1">
                  <Droplets className="h-4 w-4" />
                  <span>Rainfall Gauge</span>
                </div>
                <p className="text-xl font-bold">{weather.rainfall} mm</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-sky-300 text-xs mb-1">
                  <Wind className="h-4 w-4" />
                  <span>Wind Velocity</span>
                </div>
                <p className="text-xl font-bold">{weather.wind_speed} km/h</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-sky-300 text-xs mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Recorded</span>
                </div>
                <p className="text-xs font-semibold truncate">
                  {new Date(weather.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Agricultural Decision Matrix */}
          {weather.agricultural_insights && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-600" />
                <span>Weather-Driven Farming Decision Guide</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">Sowing & Land Prep Suitability:</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {weather.agricultural_insights.sowing_suitability}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">Irrigation Adjustment:</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {weather.agricultural_insights.irrigation_adjustment}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">Foliar & Chemical Spraying:</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {weather.agricultural_insights.spraying_advisory}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">Fertilizer Application Safety:</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {weather.agricultural_insights.fertilizer_advisory}
                  </p>
                </div>
              </div>

              {weather.agricultural_insights.extreme_weather_alert && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                  <span className="font-bold">{weather.agricultural_insights.extreme_weather_alert}</span>
                </div>
              )}
            </div>
          )}

          {/* 5-Day Outlook */}
          {weather.forecast && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">5-Day Agricultural Weather Outlook</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {weather.forecast.map((day: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                    <span className="text-xs font-bold text-slate-700 block">
                      {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <CloudSun className="h-6 w-6 text-brand-600 mx-auto my-2" />
                    <p className="text-sm font-extrabold text-slate-900">{day.temperature_max}° / {day.temperature_min}°</p>
                    <p className="text-[11px] text-slate-500">{day.condition}</p>
                    <span className="text-[10px] text-sky-600 font-semibold block pt-1">
                      Rain: {day.rainfall_chance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
