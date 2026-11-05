'use client';

import React from 'react';
import FlagIcon from '@/components/FlagIcon';

export default function ShowcaseZoomBanner() {
  return (
    <section
      className="bg-slate-900 border-b border-slate-800 py-1 sm:py-1.5 overflow-visible select-none relative z-20 flex items-center justify-center shadow-inner"
      aria-label="Rayonnement International - Amérique, Afrique, Côte d'Ivoire"
    >
      {/* DISPOSITION : 3 ÉLÉMENTS ALIGNÉS SUR UNE SEULE LIGNE, DISCRETS ET DANS LEUR CASE DE TAILLE FIXE */}
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-center gap-6 sm:gap-10 md:gap-12 px-4 overflow-visible">
        {/* CASE 1 : DRAPEAU DE L'AMÉRIQUE (TAILLE FIXE COMPACTE) */}
        <div className="w-10 h-6.5 sm:w-12 sm:h-7.5 md:w-13 md:h-8 flex-shrink-0 relative overflow-visible flex items-center justify-center">
          <div
            className="spotlight-card spotlight-delay-1 relative w-full h-full rounded-md bg-slate-950/95 border border-slate-600/90 p-0.5 flex items-center justify-center overflow-hidden cursor-default shadow-xs"
            title="États-Unis d’Amérique"
          >
            <FlagIcon
              code="us"
              size="2xl"
              className="w-full h-full object-cover rounded-xs"
            />
          </div>
        </div>

        {/* CASE 2 : CARTE DE L'AFRIQUE (TAILLE FIXE COMPACTE, IMAGE FOURNIE) */}
        <div className="w-10 h-6.5 sm:w-12 sm:h-7.5 md:w-13 md:h-8 flex-shrink-0 relative overflow-visible flex items-center justify-center">
          <div
            className="spotlight-card spotlight-delay-2 relative w-full h-full rounded-md bg-white border border-slate-300 p-0.5 flex items-center justify-center overflow-hidden cursor-default shadow-xs"
            title="Carte d’Afrique"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/carte-afrique.jpg"
              alt="Carte de l'Afrique"
              className="w-full h-full object-contain rounded-xs"
            />
          </div>
        </div>

        {/* CASE 3 : DRAPEAU DE LA CÔTE D'IVOIRE (TAILLE FIXE COMPACTE) */}
        <div className="w-10 h-6.5 sm:w-12 sm:h-7.5 md:w-13 md:h-8 flex-shrink-0 relative overflow-visible flex items-center justify-center">
          <div
            className="spotlight-card spotlight-delay-3 relative w-full h-full rounded-md bg-slate-950/95 border border-slate-600/90 p-0.5 flex items-center justify-center overflow-hidden cursor-default shadow-xs"
            title="Côte d’Ivoire"
          >
            <FlagIcon
              code="ci"
              size="2xl"
              className="w-full h-full object-cover rounded-xs"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
