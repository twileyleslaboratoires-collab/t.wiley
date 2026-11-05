'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import FlagIcon from '@/components/FlagIcon';

interface IntroScreenProps {
  logoUrl?: string;
}

export default function IntroScreen({
  logoUrl = '/logo-laboratoires-t-wiley.jpg',
}: IntroScreenProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissIntro = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsFadingOut(true);
    try {
      sessionStorage.setItem('twiley_intro_seen', 'true');
    } catch {
      // sessionStorage unavailable (incognito restrictions)
    }

    // Allow 600ms for smooth exit transition before unmounting
    setTimeout(() => {
      setShouldRender(false);
      document.body.style.overflow = '';
      document.documentElement.classList.remove('twiley-intro-active');
    }, 600);
  }, []);

  useEffect(() => {
    // Ne pas afficher sur les routes d'administration privée
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/gestionnaire') ||
        window.location.pathname.startsWith('/admin'))
    ) {
      return;
    }

    try {
      const alreadySeen = sessionStorage.getItem('twiley_intro_seen');
      if (alreadySeen === 'true') {
        return;
      }
    } catch {
      // ignore
    }

    // Préchargement immédiat des images pour un affichage instantané et fluide
    const preload1 = new Image();
    preload1.src = logoUrl;
    const preload2 = new Image();
    preload2.src = '/carte-afrique.jpg';

    // Activer l'affichage de l'intro
    setShouldRender(true);
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('twiley-intro-active');

    // Vérification de la préférence d'accessibilité utilisateur (prefers-reduced-motion)
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // En mode mouvement réduit : affichage statique court (1.8s) sans zooms
      timerRef.current = setTimeout(() => {
        dismissIntro();
      }, 1800);
      return;
    }

    // Durée totale calculée de la séquence (3 éléments x 3.3s + temps de fondu)
    // Élément 1 (USA) : 0.3s -> 3.5s
    // Élément 2 (Afrique) : 3.6s -> 6.8s
    // Élément 3 (Côte d'Ivoire) : 6.9s -> 10.1s
    // Fin et fondu de sortie automatique à 10.5s
    timerRef.current = setTimeout(() => {
      dismissIntro();
    }, 10500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.body.style.overflow = '';
      document.documentElement.classList.remove('twiley-intro-active');
    };
  }, [dismissIntro, logoUrl]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      id="twiley-intro-screen"
      role="dialog"
      aria-modal="true"
      aria-label="Introduction - Les Laboratoires T. Wiley"
      className={`fixed inset-0 z-[9999] flex flex-col justify-between items-center select-none bg-slate-950 transition-opacity duration-700 ease-out overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 45%, #0b1a32 0%, #030712 70%, #020408 100%)',
      }}
    >
      {/* Bouton discret "Passer" en haut à droite */}
      <div className="w-full max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6 flex justify-end z-50">
        <button
          type="button"
          onClick={dismissIntro}
          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-xs sm:text-sm font-medium text-slate-300 hover:text-white border border-white/15 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer"
          aria-label="Passer l'introduction"
        >
          <span>Passer</span>
          <span className="text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        </button>
      </div>

      {/* SECTION DU HAUT : LOGO DES LABORATOIRES T. WILEY (STATIQUE, BIEN VISIBLE, SANS ZOOM) */}
      <div className="flex flex-col items-center text-center px-4 pt-2 sm:pt-4 z-20">
        <div className="relative p-1.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Laboratoires T. Wiley Logo"
            className="h-14 sm:h-18 md:h-22 w-auto object-contain rounded-xl shadow-md"
          />
        </div>
        <h1 className="mt-3 text-lg sm:text-2xl font-bold tracking-wider text-white drop-shadow-md uppercase">
          Les Laboratoires T. Wiley
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-cyan-200/80 font-medium tracking-wide">
          Excellence, Savoir-faire &amp; Qualité Internationale
        </p>
      </div>

      {/* SECTION CENTRALE : LES 3 ÉLÉMENTS ALIGNÉS SUR UNE LIGNE (TAILLE FIXE, ZOOM TOUR À TOUR) */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-8 sm:py-12 z-30 overflow-visible">
        <div
          className="relative flex items-center justify-center gap-6 sm:gap-10 md:gap-14 overflow-visible px-4"
          style={{ width: 'auto' }}
        >
          {/* 1. ÉLÉMENT : DRAPEAU DE L'AMÉRIQUE */}
          <div className="w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-15 flex-shrink-0 relative overflow-visible flex items-center justify-center">
            <div
              className="intro-animated-card intro-step-1 relative w-full h-full rounded-lg bg-slate-900 border-2 border-slate-600/90 p-1 flex items-center justify-center overflow-hidden shadow-xl"
              title="États-Unis d’Amérique"
            >
              <FlagIcon
                code="us"
                size="2xl"
                className="w-full h-full object-cover rounded-sm shadow-inner"
              />
            </div>
          </div>

          {/* 2. ÉLÉMENT : CARTE DE L'AFRIQUE (IMAGE FOURNIE PAR L'UTILISATEUR) */}
          <div className="w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-15 flex-shrink-0 relative overflow-visible flex items-center justify-center">
            <div
              className="intro-animated-card intro-step-2 relative w-full h-full rounded-lg bg-white border-2 border-slate-300 p-1 flex items-center justify-center overflow-hidden shadow-xl"
              title="Carte de l'Afrique"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/carte-afrique.jpg"
                alt="Carte de l'Afrique"
                className="w-full h-full object-contain rounded-sm"
              />
            </div>
          </div>

          {/* 3. ÉLÉMENT : DRAPEAU DE LA CÔTE D'IVOIRE */}
          <div className="w-16 h-10 sm:w-20 sm:h-12 md:w-24 md:h-15 flex-shrink-0 relative overflow-visible flex items-center justify-center">
            <div
              className="intro-animated-card intro-step-3 relative w-full h-full rounded-lg bg-slate-900 border-2 border-slate-600/90 p-1 flex items-center justify-center overflow-hidden shadow-xl"
              title="Côte d’Ivoire"
            >
              <FlagIcon
                code="ci"
                size="2xl"
                className="w-full h-full object-cover rounded-sm shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Sous-titre élégant sous la ligne des drapeaux */}
        <p className="mt-8 text-xs sm:text-sm text-slate-400 font-light tracking-widest uppercase">
          Amérique &bull; Afrique &bull; Côte d&apos;Ivoire
        </p>
      </div>

      {/* SECTION DU BAS : MENTION DISCRÈTE */}
      <div className="w-full pb-5 sm:pb-7 text-center z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] sm:text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Bienvenue sur notre plateforme officielle</span>
        </div>
      </div>
    </div>
  );
}

