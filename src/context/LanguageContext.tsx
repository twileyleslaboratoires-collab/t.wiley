'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    // Nav
    'nav.boutique': 'BOUTIQUE',
    'nav.categories': 'CATÉGORIES',
    'nav.panier': 'PANIER',
    'nav.contact': 'CONTACT',
    'nav.apropos': 'À PROPOS',
    'nav.whatsapp': 'WhatsApp',
    'nav.whatsapp_title': 'Commander ou discuter sur WhatsApp',

    // Hero
    'hero.title': 'Découvrez Nos Produits',
    'hero.subtitle': 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique',
    'hero.desc': 'Formulations certifiées, cosmétiques et solutions professionnelles répondant aux exigences professionnelles et internationales.',

    // Showcase
    'showcase.usa.title': 'États-Unis d’Amérique',
    'showcase.usa.desc': 'Partenariats & Standards Internationaux de Formulation',
    'showcase.africa.title': 'Continent Africain',
    'showcase.africa.desc': 'Rayonnement Régional, Exportation & Présence Panafricaine',
    'showcase.ci.title': 'Côte d’Ivoire',
    'showcase.ci.desc': 'Siège Principal & Laboratoires de Fabrication Certifiés',

    // Catalog & Filters
    'catalog.search_placeholder': 'Rechercher un produit, formule, gamme...',
    'catalog.all_categories': 'Toutes les catégories',
    'catalog.in_stock_only': 'En stock uniquement',
    'catalog.filter_btn': 'Filtres',
    'catalog.sort_by': 'Trier par :',
    'catalog.sort_newest': 'Plus récents',
    'catalog.sort_price_asc': 'Prix croissant',
    'catalog.sort_price_desc': 'Prix décroissant',
    'catalog.sort_name_asc': 'Nom (A-Z)',
    'catalog.reset_all': 'Tout réinitialiser',
    'catalog.max_price': 'Prix maximum :',
    'catalog.products_available': 'produits disponibles',
    'catalog.no_products': 'Aucun produit ne correspond à vos critères',
    'catalog.try_relaxing': 'Essayez d’élargir vos filtres ou de modifier votre recherche.',

    // Product Card
    'card.add': 'Ajouter',
    'card.order': 'Commander',
    'card.in_stock': 'En stock',
    'card.out_of_stock': 'Rupture',
    'card.added_toast': 'a été ajouté à votre panier !',

    // Product Detail
    'detail.unit_price': 'Prix unitaire',
    'detail.estimated_total': 'Total estimé',
    'detail.quantity': 'QUANTITÉ :',
    'detail.order_whatsapp': 'COMMANDER SUR WHATSAPP',
    'detail.add_to_cart': 'Ajouter au panier (plusieurs articles)',
    'detail.quality_guarantee': 'Qualité professionnelle garantie',
    'detail.fast_delivery': 'Livraison rapide à Abidjan & intérieur',
    'detail.specs': 'CARACTÉRISTIQUES',
    'detail.description': 'Description & Conseils d’utilisation',
    'detail.back': 'Retour à la boutique',

    // Cart
    'cart.title': 'Votre Panier',
    'cart.empty_title': 'Votre panier est vide',
    'cart.empty_desc': 'Découvrez notre catalogue et ajoutez des produits à votre sélection.',
    'cart.continue': 'Continuer les achats',
    'cart.clear': 'Vider le panier',
    'cart.total': 'Total de la commande',
    'cart.order_whatsapp': 'Passer la commande via WhatsApp',

    // Common
    'common.fcfa': 'FCFA',
    'lang.fr': 'Français',
    'lang.en': 'English',
  },
  en: {
    // Nav
    'nav.boutique': 'SHOP',
    'nav.categories': 'CATEGORIES',
    'nav.panier': 'CART',
    'nav.contact': 'CONTACT',
    'nav.apropos': 'ABOUT US',
    'nav.whatsapp': 'WhatsApp',
    'nav.whatsapp_title': 'Order or chat on WhatsApp',

    // Hero
    'hero.title': 'Discover Our Products',
    'hero.subtitle': 'Cosmetics — Hospital Disinfectants — Domestic — Mechanics',
    'hero.desc': 'Certified formulations, cosmetics and professional solutions meeting international and professional requirements.',

    // Showcase
    'showcase.usa.title': 'United States of America',
    'showcase.usa.desc': 'International Partnerships & Formulation Standards',
    'showcase.africa.title': 'African Continent',
    'showcase.africa.desc': 'Regional Reach, Export & Pan-African Presence',
    'showcase.ci.title': 'Côte d’Ivoire',
    'showcase.ci.desc': 'Main Headquarters & Certified Manufacturing Laboratories',

    // Catalog & Filters
    'catalog.search_placeholder': 'Search products, formulas, ranges...',
    'catalog.all_categories': 'All Categories',
    'catalog.in_stock_only': 'In stock only',
    'catalog.filter_btn': 'Filters',
    'catalog.sort_by': 'Sort by:',
    'catalog.sort_newest': 'Newest',
    'catalog.sort_price_asc': 'Price: Low to High',
    'catalog.sort_price_desc': 'Price: High to Low',
    'catalog.sort_name_asc': 'Name (A-Z)',
    'catalog.reset_all': 'Reset all',
    'catalog.max_price': 'Maximum price:',
    'catalog.products_available': 'products available',
    'catalog.no_products': 'No products match your criteria',
    'catalog.try_relaxing': 'Try broadening your filters or editing your search term.',

    // Product Card
    'card.add': 'Add to Cart',
    'card.order': 'Order',
    'card.in_stock': 'In stock',
    'card.out_of_stock': 'Out of stock',
    'card.added_toast': 'has been added to your cart!',

    // Product Detail
    'detail.unit_price': 'Unit Price',
    'detail.estimated_total': 'Estimated Total',
    'detail.quantity': 'QUANTITY:',
    'detail.order_whatsapp': 'ORDER ON WHATSAPP',
    'detail.add_to_cart': 'Add to Cart (multiple items)',
    'detail.quality_guarantee': 'Guaranteed Professional Quality',
    'detail.fast_delivery': 'Fast delivery in Abidjan & nationwide',
    'detail.specs': 'SPECIFICATIONS',
    'detail.description': 'Description & Usage Instructions',
    'detail.back': 'Back to Shop',

    // Cart
    'cart.title': 'Your Shopping Cart',
    'cart.empty_title': 'Your cart is empty',
    'cart.empty_desc': 'Explore our catalog and add items to your selection.',
    'cart.continue': 'Continue Shopping',
    'cart.clear': 'Clear Cart',
    'cart.total': 'Order Total',
    'cart.order_whatsapp': 'Place Order via WhatsApp',

    // Common
    'common.fcfa': 'FCFA',
    'lang.fr': 'Français',
    'lang.en': 'English',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, defaultText) => defaultText || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  // Suppression continue et instantanée de tout bandeau Google Translate
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanGoogleBar = () => {
      const banners = document.querySelectorAll('iframe.goog-te-banner-frame, .goog-te-banner-frame, iframe.skiptranslate');
      banners.forEach((banner) => {
        const el = banner as HTMLElement;
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0px', 'important');
        el.style.setProperty('opacity', '0', 'important');
      });

      if (document.body && document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.setProperty('top', '0px', 'important');
      }
    };

    const interval = setInterval(cleanGoogleBar, 100);
    return () => clearInterval(interval);
  }, []);

  const clearGoogleTranslateCookies = () => {
    if (typeof document === 'undefined') return;
    const hostname = window.location.hostname;
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'googtrans=; path=/; domain=' + hostname + '; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'googtrans=/fr/fr; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'googtrans=/fr/en; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'googtrans=/fr/en; path=/; domain=' + hostname + '; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  };

  useEffect(() => {
    // Nettoyer d'anciens résidus localStorage globaux pour garantir l'isolation stricte par utilisateur / session
    try {
      localStorage.removeItem('twiley_language');
    } catch {
      // Ignorer
    }

    // Vérification de la langue de CET utilisateur uniquement (isolé par sessionStorage)
    try {
      const sessionLang = sessionStorage.getItem('twiley_language') as Language | null;
      if (sessionLang === 'en') {
        setLanguageState('en');
        applyDocumentLanguage('en');
      } else {
        // Par défaut strict : Français (fr) pour tout nouvel utilisateur ou nouvel onglet
        setLanguageState('fr');
        clearGoogleTranslateCookies();
      }
    } catch {
      setLanguageState('fr');
    }

    // Réalignement lors du focus de l'onglet : chaque utilisateur/onglet garde SA propre langue
    const handleTabFocus = () => {
      try {
        const sessionLang = sessionStorage.getItem('twiley_language') as Language | null;
        if (sessionLang === 'en') {
          if (language !== 'en') {
            setLanguageState('en');
            applyDocumentLanguage('en');
          }
        } else {
          if (language !== 'fr') {
            setLanguageState('fr');
            clearGoogleTranslateCookies();
            triggerGoogleTranslation('fr');
          }
        }
      } catch {
        // Ignorer
      }
    };

    window.addEventListener('focus', handleTabFocus);
    return () => window.removeEventListener('focus', handleTabFocus);
  }, []);

  const loadGoogleTranslateScript = () => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('google-translate-script')) return;

    // Déclaration callback globale
    // @ts-ignore
    window.googleTranslateElementInit = () => {
      try {
        // @ts-ignore
        if (window.google && window.google.translate) {
          // @ts-ignore
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'fr',
              includedLanguages: 'en,fr',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      } catch {
        // Ignorer
      }
    };

    const s = document.createElement('script');
    s.id = 'google-translate-script';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  };

  const triggerGoogleTranslation = (targetLang: 'fr' | 'en') => {
    if (typeof window === 'undefined') return;

    let attempts = 0;
    const maxAttempts = 40; // 4 secondes de tentative pour capter le combo
    const interval = setInterval(() => {
      attempts++;
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        if (combo.value !== targetLang) {
          combo.value = targetLang;
          combo.dispatchEvent(new Event('change'));
        }
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);
  };

  const applyDocumentLanguage = (lang: Language) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      if (lang === 'en') {
        document.cookie = 'googtrans=/fr/en; path=/';
        loadGoogleTranslateScript();
        triggerGoogleTranslation('en');
      } else {
        clearGoogleTranslateCookies();
        triggerGoogleTranslation('fr');
      }
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      sessionStorage.setItem('twiley_language', lang);
      localStorage.removeItem('twiley_language');
    } catch {
      // Ignorer
    }
    applyDocumentLanguage(lang);
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'fr' ? 'en' : 'fr';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      <div id="google_translate_element" className="hidden" style={{ display: 'none' }} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
