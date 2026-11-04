'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

/**
 * Gestionnaire intelligent du bouton retour mobile (Android & iOS).
 * - Empêche de quitter brutalement le site lors de l'appui sur le bouton retour du téléphone.
 * - Assure que l'appui sur retour depuis une page produit ou le panier ramène vers la boutique.
 * - Sur la page d'accueil, prévient l'utilisateur avec un message rassurant au lieu de fermer la page.
 */
export default function MobileNavigationGuard() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const lastBackPressRef = useRef<number>(0);

  // 1. Initialisation de l'historique : si l'utilisateur arrive directement sur une sous-page
  // (ex: lien direct vers un produit partagé sur WhatsApp), injecter la page d'accueil dans l'historique
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (pathname.startsWith('/gestionnaire') || pathname.startsWith('/admin')) {
      return;
    }

    // Si on arrive directement sur une sous-page sans historique interne
    if (pathname !== '/' && window.history.length <= 2) {
      try {
        const currentPath = window.location.pathname;
        window.history.replaceState({ appPage: 'home' }, '', '/');
        window.history.pushState({ appPage: currentPath }, '', currentPath);
      } catch {
        // Ignorer si non supporté
      }
    }
  }, [pathname]);

  // 2. Gestion de l'événement popstate déclenché par le bouton retour physique ou gestuel du téléphone
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Marquer l'état courant pour que l'historique reste toujours actif
    try {
      if (!window.history.state || !window.history.state.twileyApp) {
        window.history.replaceState({ ...window.history.state, twileyApp: true, path: pathname }, '');
      }
    } catch {
      // Ignorer
    }

    const handlePopState = () => {
      // Laisser l'espace administration sans intervention
      if (pathname.startsWith('/gestionnaire') || pathname.startsWith('/admin')) {
        return;
      }

      // Si l'utilisateur est sur la page d'accueil de la boutique
      if (pathname === '/') {
        const now = Date.now();
        // Si l'utilisateur réappuie rapidement (dans les 2.5 secondes), autoriser la sortie normale du site
        if (now - lastBackPressRef.current < 2500) {
          return;
        }

        // Première pression sur le bouton retour : conserver sur le site et prévenir courtoisement
        lastBackPressRef.current = now;
        try {
          window.history.pushState({ twileyApp: true, path: '/' }, '', '/');
        } catch {
          // Ignorer
        }
        showToast('Appuyez à nouveau pour quitter le site', 'info');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, showToast]);

  return null;
}
