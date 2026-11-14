import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  Trees,
  Droplets,
  ScanLine,
  CloudSun,
  MessageSquareCode,
  History,
  Settings,
  Sparkles,
  Tractor
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav_dashboard') },
    { to: '/farm', icon: Tractor, label: t('nav_farms') },
    { to: '/crop-recommendation', icon: Sprout, label: t('nav_crops'), highlight: true },
    { to: '/soil-analysis', icon: FlaskConical, label: t('nav_soil') },
    { to: '/fertilizer-advisory', icon: Trees, label: t('nav_fertilizer') },
    { to: '/irrigation-advisory', icon: Droplets, label: t('nav_irrigation') },
    { to: '/disease-detection', icon: ScanLine, label: t('nav_disease'), highlight: true },
    { to: '/weather', icon: CloudSun, label: t('nav_weather') },
    { to: '/chatbot', icon: MessageSquareCode, label: t('nav_chat'), highlight: true },
    { to: '/history', icon: History, label: t('nav_history') },
    { to: '/settings', icon: Settings, label: t('nav_settings') },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 pt-16 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-6 overflow-y-auto space-y-1">
          <div className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Advisory Tools
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm shadow-brand-500/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="h-2 w-2 rounded-full bg-brand-500 ring-2 ring-brand-100" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer advisory badge */}
        <div className="p-4 border-t border-slate-100 m-3 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-100/60">
          <div className="flex items-center gap-2 text-brand-800 text-xs font-bold mb-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>Gemini 2.5 Powered</span>
          </div>
          <p className="text-[11px] text-brand-900/70 leading-relaxed">
            Responsible agro-intelligence calibrated for Indian farming conditions.
          </p>
        </div>
      </aside>
    </>
  );
};
