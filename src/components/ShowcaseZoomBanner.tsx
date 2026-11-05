'use client';

import React, { useState, useEffect } from 'react';
import FlagIcon from '@/components/FlagIcon';
import { useLanguage } from '@/context/LanguageContext';

interface ShowcaseItem {
  id: 'usa' | 'africa' | 'ci';
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  badge: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'usa',
    titleKey: 'showcase.usa.title',
    defaultTitle: 'États-Unis d’Amérique',
    descKey: 'showcase.usa.desc',
    defaultDesc: 'Partenariats & Standards Internationaux de Formulation',
    badge: 'USA • STANDARDS',
  },
  {
    id: 'africa',
    titleKey: 'showcase.africa.title',
    defaultTitle: 'Continent Africain',
    descKey: 'showcase.africa.desc',
    defaultDesc: 'Rayonnement Régional, Exportation & Présence Panafricaine',
    badge: 'AFRIQUE • EXPORT',
  },
  {
    id: 'ci',
    titleKey: 'showcase.ci.title',
    defaultTitle: 'Côte d’Ivoire',
    descKey: 'showcase.ci.desc',
    defaultDesc: 'Siège Principal & Laboratoires de Fabrication Certifiés',
    badge: 'CÔTE D’IVOIRE • SIÈGE',
  },
];

export default function ShowcaseZoomBanner() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Défilement automatique tour à tour avec rythme élégant
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [isHovered]);

  const currentItem = SHOWCASE_ITEMS[currentIndex];

  return (
    <section
      className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/90 py-2.5 sm:py-3 overflow-hidden shadow-inner select-none z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Rayonnement International"
    >
      {/* Halo lumineux doux d'arrière-plan sans dépasser */}
      <div className="absolute inset-0 bg-radial from-brand-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Contenu principal : Élément animé avec zoom vers l'avant et retour lent */}
        <div className="flex-1 w-full flex items-center justify-center sm:justify-start gap-3.5 sm:gap-5 min-h-[52px]">
          {/* VISUEL AVEC EFFET DE ZOOM AVANT CONTRÔLÉ (ne ferme pas l'écran, retour lent) */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-14 h-12 sm:w-16 sm:h-14">
            {SHOWCASE_ITEMS.map((item, index) => {
              const isActive = index === currentIndex;

              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-[1300ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isActive
                      ? 'opacity-100 scale-110 sm:scale-120 drop-shadow-[0_8px_16px_rgba(2,106,200,0.45)] z-20 pointer-events-auto'
                      : 'opacity-0 scale-75 blur-[1px] -translate-y-1 z-0 pointer-events-none'
                  }`}
                  style={{
                    // Transition un peu plus lente au retour
                    transitionDuration: isActive ? '900ms' : '1400ms',
                  }}
                >
                  {/* Visuel 1 : Drapeau de l'Amérique */}
                  {item.id === 'usa' && (
                    <div className="p-1 rounded-xl bg-slate-800/90 border border-slate-600/90 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
                      <FlagIcon code="us" size="xl" className="rounded-md shadow-md" />
                    </div>
                  )}

                  {/* Visuel 2 : Carte d'Afrique stylisée */}
                  {item.id === 'africa' && (
                    <div className="p-1.5 rounded-xl bg-slate-800/90 border border-emerald-500/50 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
                      <svg
                        viewBox="0 0 200 200"
                        className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient id="africaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                        {/* Silhouette continentale de l'Afrique */}
                        <path
                          d="M 52,24 C 64,22 75,21 84,20 C 89,22 93,26 97,28 C 107,31 118,31 127,27 C 133,26 138,29 140,34 C 142,39 148,47 154,54 C 160,58 171,61 176,64 C 178,67 176,73 170,77 C 161,84 156,95 152,106 C 148,119 143,132 135,145 C 127,157 117,169 105,173 C 96,171 92,163 89,153 C 86,139 84,125 82,111 C 80,103 74,99 65,99 C 55,99 46,102 37,101 C 29,100 23,94 21,85 C 19,76 22,67 27,58 C 33,48 39,37 47,28 Z"
                          fill="url(#africaGrad)"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                        {/* Madagascar */}
                        <path
                          d="M 160,118 C 164,115 169,117 172,123 C 175,131 173,142 168,149 C 165,152 161,150 160,145 C 158,136 157,126 160,118 Z"
                          fill="url(#africaGrad)"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Visuel 3 : Drapeau de la Côte d'Ivoire */}
                  {item.id === 'ci' && (
                    <div className="p-1 rounded-xl bg-slate-800/90 border border-orange-500/60 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
                      <FlagIcon code="ci" size="xl" className="rounded-md shadow-md" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Textes descriptifs synchronisés avec animation douce */}
          <div className="flex-1 text-center sm:text-left overflow-hidden min-h-[42px] flex flex-col justify-center">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700/80">
                {currentItem.badge}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide transition-all duration-500 line-clamp-1">
                {t(currentItem.titleKey, currentItem.defaultTitle)}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium transition-all duration-500 line-clamp-1 mt-0.5">
              {t(currentItem.descKey, currentItem.defaultDesc)}
            </p>
          </div>
        </div>

        {/* Puces de sélection interactive pour naviguer tour à tour */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {SHOWCASE_ITEMS.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-slate-700 text-white shadow-xs border border-slate-500 scale-105'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-800'
                }`}
                title={t(item.titleKey, item.defaultTitle)}
              >
                <span>{item.id === 'usa' ? '🇺🇸' : item.id === 'africa' ? '🌍' : '🇨🇮'}</span>
                <span className="hidden md:inline">
                  {item.id === 'usa' ? 'USA' : item.id === 'africa' ? 'Afrique' : 'Côte d’Ivoire'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
