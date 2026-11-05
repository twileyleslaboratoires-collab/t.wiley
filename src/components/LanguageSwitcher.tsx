'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'compact' | 'full';
  className?: string;
}

export default function LanguageSwitcher({
  variant = 'navbar',
  className = '',
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs ${className}`}
        title={language === 'fr' ? 'Switch to English' : 'Passer en Français'}
        aria-label="Changer de langue"
      >
        <span className="text-sm">{language === 'fr' ? '🇬🇧' : '🇫🇷'}</span>
        <span className="font-extrabold uppercase">{language === 'fr' ? 'EN' : 'FR'}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/90 shadow-2xs ${className}`}
      role="group"
      aria-label="Sélection de la langue"
    >
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
          language === 'fr'
            ? 'bg-white text-brand-700 shadow-xs ring-1 ring-slate-200'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Site en Français"
      >
        <span className="text-sm">🇫🇷</span>
        <span>FR</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
          language === 'en'
            ? 'bg-white text-brand-700 shadow-xs ring-1 ring-slate-200'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Website in English"
      >
        <span className="text-sm">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}

