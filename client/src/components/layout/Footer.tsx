import React from 'react';
import { Sprout, Heart, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sprout className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">{t('appName')}</span>
            <span className="text-xs text-slate-400">| Intelligent Crop Advisory Platform</span>
          </div>

          <div className="text-xs text-slate-500 text-center max-w-xl">
            <div className="flex items-center justify-center gap-1.5 font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-1">
              <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{t('disclaimer')}</span>
            </div>
            <span>Built with precision for Indian farmers. Always cross-verify chemical recommendations with local Krishi Vigyan Kendra (KVK).</span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span>© {new Date().getFullYear()} AgroGuide AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
