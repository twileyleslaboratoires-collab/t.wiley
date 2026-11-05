'use client';

import React, { useState, useEffect } from 'react';
import FlagIcon from '@/components/FlagIcon';

type ShowcaseId = 'usa' | 'africa' | 'ci';

interface ShowcaseItem {
  id: ShowcaseId;
  label: string;
}

const ITEMS: ShowcaseItem[] = [
  { id: 'usa', label: 'États-Unis d’Amérique' },
  { id: 'africa', label: 'Carte d’Afrique' },
  { id: 'ci', label: 'Côte d’Ivoire' },
];

export default function ShowcaseZoomBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Défilement automatique tour à tour : USA -> Afrique -> Côte d'Ivoire -> USA...
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ITEMS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/90 py-8 sm:py-12 overflow-hidden shadow-inner select-none z-10 flex items-center justify-center min-h-[190px] sm:min-h-[260px]"
      aria-label="Animation Internationale Centrée"
    >
      {/* Halo lumineux doux au centre */}
      <div className="absolute inset-0 bg-radial from-brand-600/15 via-transparent to-transparent pointer-events-none" />

      {/* ZONE CENTRÉE UNIQUE — STRICTEMENT AUCUNE ÉCRITURE */}
      <div className="relative w-full max-w-xl mx-auto flex items-center justify-center px-4">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          {ITEMS.map((item, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                key={item.id}
                className={`absolute inset-0 flex items-center justify-center will-change-transform ${
                  isActive
                    ? 'opacity-100 scale-[1.75] sm:scale-[2.15] md:scale-[2.35] z-20 pointer-events-auto'
                    : 'opacity-0 scale-[0.35] z-0 pointer-events-none'
                }`}
                style={{
                  // Entrée dynamique en avant, et retour ralenti et très doux
                  transitionProperty: 'transform, opacity',
                  transitionDuration: isActive ? '1100ms' : '1750ms',
                  transitionTimingFunction: isActive
                    ? 'cubic-bezier(0.16, 1, 0.3, 1)' // Zoom rapide et percutant vers l'utilisateur
                    : 'cubic-bezier(0.4, 0, 0.2, 1)', // Retour lent et progressif
                }}
              >
                {/* 1. DRAPEAU DE L'AMÉRIQUE (USA) */}
                {item.id === 'usa' && (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-900/95 border-2 border-slate-600/90 shadow-[0_20px_45px_rgba(0,0,0,0.85)] flex items-center justify-center p-3 overflow-hidden">
                    <FlagIcon
                      code="us"
                      size="3xl"
                      className="w-full h-auto aspect-[3/2] rounded-lg shadow-md"
                    />
                  </div>
                )}

                {/* 2. CARTE D'AFRIQUE (Image exacte fournie avec tous les drapeaux intégrés) */}
                {item.id === 'africa' && (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border-2 border-slate-300 shadow-[0_20px_45px_rgba(0,0,0,0.85)] flex items-center justify-center p-1.5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/carte-afrique.jpg"
                      alt="Carte d'Afrique"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* 3. DRAPEAU DE LA CÔTE D'IVOIRE */}
                {item.id === 'ci' && (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-900/95 border-2 border-slate-600/90 shadow-[0_20px_45px_rgba(0,0,0,0.85)] flex items-center justify-center p-3 overflow-hidden">
                    <FlagIcon
                      code="ci"
                      size="3xl"
                      className="w-full h-auto aspect-[3/2] rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
