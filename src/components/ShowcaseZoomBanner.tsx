'use client';

import React from 'react';
import FlagIcon from '@/components/FlagIcon';

export default function ShowcaseZoomBanner() {
  return (
    <section
      className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/90 py-8 sm:py-12 overflow-visible select-none z-10 flex items-center justify-center"
      aria-label="Rayonnement International - Amérique, Afrique, Côte d'Ivoire"
    >
      {/* Halo lumineux d'arrière-plan */}
      <div className="absolute inset-0 bg-radial from-brand-600/10 via-transparent to-transparent pointer-events-none overflow-hidden" />

      {/* DISPOSITION : 3 ÉLÉMENTS ALIGNÉS SUR UNE SEULE LIGNE, CHACUN DANS SA CASE DE TAILLE FIXE */}
      <div className="relative w-full max-w-xl mx-auto flex items-center justify-center gap-6 sm:gap-10 md:gap-14 px-4 overflow-visible">
        {/* CASE 1 : DRAPEAU DE L'AMÉRIQUE (TAILLE FIXE) */}
        <div className="w-16 h-14 sm:w-20 sm:h-16 md:w-24 md:h-18 flex-shrink-0 relative overflow-visible flex items-center justify-center">
          <div
            className="spotlight-card spotlight-delay-1 relative w-full h-full rounded-xl sm:rounded-2xl bg-slate-900/95 border border-slate-600/90 p-1 sm:p-1.5 flex items-center justify-center overflow-hidden cursor-default"
            title="États-Unis d’Amérique"
          >
            <FlagIcon
              code="us"
              size="3xl"
              className="w-full h-full object-cover rounded-lg shadow-xs"
            />
          </div>
        </div>

        {/* CASE 2 : CARTE DE L'AFRIQUE (TAILLE FIXE, IMAGE FOURNIE) */}
        <div className="w-16 h-14 sm:w-20 sm:h-16 md:w-24 md:h-18 flex-shrink-0 relative overflow-visible flex items-center justify-center">
          <div
            className="spotlight-card spotlight-delay-2 relative w-full h-full rounded-xl sm:rounded-2xl bg-white border border-slate-300 p-1 flex items-center justify-center overflow-hidden cursor-default"
            title="Carte d’Afrique"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/carte-afrique.jpg"
              alt="Carte de l'Afrique"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>

        {/* CASE 3 : DRAPEAU DE LA CÔTE D'IVOIRE (TAILLE FIXE) */}
        <div className="w-16 h-14 sm:w-20 sm:h-16 md:w-24 md:h-18 flex-shrink-0 relative overflow-visible flex items-center justify-center">
          <div
            className="spotlight-card spotlight-delay-3 relative w-full h-full rounded-xl sm:rounded-2xl bg-slate-900/95 border border-slate-600/90 p-1 sm:p-1.5 flex items-center justify-center overflow-hidden cursor-default"
            title="Côte d’Ivoire"
          >
            <FlagIcon
              code="ci"
              size="3xl"
              className="w-full h-full object-cover rounded-lg shadow-xs"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
