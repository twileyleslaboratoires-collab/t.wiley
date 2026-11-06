'use client';

import React from 'react';
import FlagIcon from '@/components/FlagIcon';

export default function ShowcaseZoomBanner() {
  const introPresentationText = (
    <span className="inline-flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-200">
      <span className="font-extrabold text-amber-400 uppercase tracking-wider drop-shadow-sm flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
        Les Laboratoires T.WILEY
      </span>
      <span className="text-slate-500 font-bold">&bull;</span>
      <span>
        Unité spécialisée dans la fabrication des détergents et cosmétiques.
      </span>
      <span className="text-slate-500 font-bold">&bull;</span>
      <span>
        Entreprise créée par des Ivoiriens vivant aux US et des nationaux ayant
        capitalisé leur expérience dans la fabrication de produits de qualité.
      </span>
      <span className="text-slate-500 font-bold">&bull;</span>
      <span className="text-cyan-300 font-semibold">
        Normes environnementales et sanitaires américaines (EPA et OSHA).
      </span>
      <span className="text-slate-500 font-bold">&bull;</span>
      <span className="font-bold text-amber-300 tracking-wide uppercase">
        TOUS NOS PRODUITS SONT FORMULÉS ET FABRIQUÉS DANS LES PROPORTIONS
        STŒCHIOMÉTRIQUES CONFORMÉMENT AUX NORMES.
      </span>
      <span className="text-slate-500 font-bold mr-6 sm:mr-10">&bull;</span>
    </span>
  );

  return (
    <section
      className="bg-slate-900 border-b border-slate-800 select-none relative z-20 shadow-inner overflow-hidden flex items-center h-10 sm:h-12"
      aria-label="Présentation et Rayonnement International - Les Laboratoires T. Wiley"
    >
      <div className="w-full flex items-center justify-between h-full relative overflow-hidden">
        {/* ========================================================================= */}
        {/* BLOC GAUCHE : LES 3 ÉLÉMENTS FIXES (USA, CARTE AFRIQUE, CI) SANS ZOOM     */}
        {/* LE TEXTE DÉFILANT GLISSE SOUS CE BLOC (EFFET "RENTRE EN DESSOUS")         */}
        {/* ========================================================================= */}
        <div className="relative z-20 h-full flex items-center gap-2 sm:gap-3.5 px-3 sm:px-4 bg-slate-900 border-r border-slate-700/80 shadow-[6px_0_15px_rgba(0,0,0,0.65)] flex-shrink-0">
          {/* DRAPEAU 1 : AMÉRIQUE (FIXE, COMPACT, SANS ZOOM) */}
          <div
            className="w-8 h-5.5 sm:w-10 sm:h-6.5 rounded-sm bg-slate-950 border border-slate-600/90 p-0.5 flex items-center justify-center overflow-hidden shadow-xs cursor-default"
            title="États-Unis d’Amérique"
          >
            <FlagIcon
              code="us"
              size="2xl"
              className="w-full h-full object-cover rounded-xs"
            />
          </div>

          {/* ÉLÉMENT 2 : CARTE D'AFRIQUE AVEC LES DRAPEAUX (FIXE, COMPACT, SANS ZOOM) */}
          <div
            className="w-8 h-5.5 sm:w-10 sm:h-6.5 rounded-sm bg-white border border-slate-300 p-0.5 flex items-center justify-center overflow-hidden shadow-xs cursor-default"
            title="Carte d’Afrique avec drapeaux"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/carte-afrique.jpg"
              alt="Carte de l'Afrique"
              className="w-full h-full object-contain rounded-xs"
            />
          </div>

          {/* DRAPEAU 3 : CÔTE D'IVOIRE (FIXE, COMPACT, SANS ZOOM) */}
          <div
            className="w-8 h-5.5 sm:w-10 sm:h-6.5 rounded-sm bg-slate-950 border border-slate-600/90 p-0.5 flex items-center justify-center overflow-hidden shadow-xs cursor-default"
            title="Côte d’Ivoire"
          >
            <FlagIcon
              code="ci"
              size="2xl"
              className="w-full h-full object-cover rounded-xs"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOC DROIT : TEXTE DE PRÉSENTATION DÉFILANT EN BOUCLE CONTINUE            */}
        {/* LE TEXTE DÉFILE DE DROITE À GAUCHE ET RENTRE EN DESSOUS DES DRAPEAUX      */}
        {/* ========================================================================= */}
        <div className="relative z-10 flex-1 overflow-hidden h-full flex items-center">
          <div className="animate-marquee-track flex items-center whitespace-nowrap">
            {introPresentationText}
            {introPresentationText}
            {introPresentationText}
            {introPresentationText}
          </div>

          {/* Dégradé doux à droite pour une entrée naturelle du texte */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-900 to-transparent z-15" />
        </div>
      </div>
    </section>
  );
}
