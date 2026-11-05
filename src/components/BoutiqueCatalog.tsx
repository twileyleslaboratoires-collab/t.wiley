'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Truck,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ShowcaseZoomBanner from '@/components/ShowcaseZoomBanner';
import { useLanguage } from '@/context/LanguageContext';
import { Product, Category, CompanyInfo } from '@/types';
import { formatPriceFCFA } from '@/lib/whatsapp';

interface BoutiqueCatalogProps {
  initialProducts: Product[];
  categories: Category[];
  companyInfo: CompanyInfo;
}

export default function BoutiqueCatalog({
  initialProducts,
  categories,
  companyInfo,
}: BoutiqueCatalogProps) {
  const { t } = useLanguage();
  // Données dynamiques avec auto-mise à jour en temps réel
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentCategories, setCurrentCategories] = useState<Category[]>(categories);
  const [currentCompanyInfo, setCurrentCompanyInfo] = useState<CompanyInfo>(companyInfo);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<number>(50000); // Max FCFA slider
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Auto-mise à jour en temps réel (le site se met à jour seul en arrière-plan)
  useEffect(() => {
    let isMounted = true;
    const syncRealtime = async () => {
      try {
        const [prodRes, catRes, compRes] = await Promise.all([
          fetch('/api/products?includeUnpublished=false'),
          fetch('/api/categories'),
          fetch('/api/company'),
        ]);
        if (isMounted && prodRes.ok) {
          const freshProds = await prodRes.json();
          setProducts(freshProds);
        }
        if (isMounted && catRes.ok) {
          const freshCats = await catRes.json();
          setCurrentCategories(freshCats);
        }
        if (isMounted && compRes.ok) {
          const freshComp = await compRes.json();
          setCurrentCompanyInfo(freshComp);
        }
      } catch {
        // En cas de micro-coupure réseau
      }
    };

    const interval = setInterval(syncRealtime, 4000);
    window.addEventListener('focus', syncRealtime);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', syncRealtime);
    };
  }, []);

  // Calcul du prix maximum dans le catalogue pour initialiser le curseur
  const maxProductPrice = useMemo(() => {
    return products.reduce((max, p) => Math.max(max, p.price), 50000);
  }, [products]);

  // Les 4 catégories rapides demandées
  const quickCategories = useMemo(() => {
    return currentCategories.slice(0, 4);
  }, [currentCategories]);

  // Filtrage combiné et recherche
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtre catégorie
      if (selectedCategoryId !== 'all' && product.categoryId !== selectedCategoryId) {
        return false;
      }

      // Filtre stock
      if (onlyInStock && product.availability !== 'in_stock') {
        return false;
      }

      // Filtre prix
      if (product.price > priceRange) {
        return false;
      }

      // Recherche texte sur nom, description courte et longue
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesShort = product.shortDescription.toLowerCase().includes(query);
        const matchesFull = product.fullDescription.toLowerCase().includes(query);
        const matchesCategory = product.categoryName.toLowerCase().includes(query);
        if (!matchesName && !matchesShort && !matchesFull && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategoryId, onlyInStock, priceRange, searchQuery]);

  // Tri des produits
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [filteredProducts, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('all');
    setSortBy('newest');
    setPriceRange(maxProductPrice);
    setOnlyInStock(false);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
  };

  return (
    <div className="pb-4 sm:pb-8">
      {/* SECTION 1 : INTRODUCTION COMMERCIALE & BANNIÈRE VIVANTE */}
      <section className="relative overflow-hidden border-b border-slate-800 flex items-center justify-center">
        {/* IMAGE DE FOND RÉPÉTÉE SANS AGRANDISSEMENT POUR OCCUPER NATURELLEMENT TOUT L'ESPACE ET RENDUE VIVANTE */}
        <div
          key={currentCompanyInfo.banner}
          className="absolute inset-0 z-0 animate-live-bg"
          style={{
            backgroundImage: `url('${currentCompanyInfo.banner || '/hero-echangeur.jpg'}')`,
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
          }}
        />

        {/* Voile doux dégradé garantissant le contraste optimal tout en maintenant l'image bien visible */}
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/65" />

        {/* ÉCRITURES SANS CARTE DE FOND — HAUTEUR AJUSTÉE DIRECTEMENT AU NIVEAU DE L'ÉCRITURE */}
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full pt-12 pb-4 sm:pt-16 sm:pb-6 px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-sm border border-brand-400/50 text-brand-300 text-xs font-bold tracking-wider uppercase mb-2 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            {currentCompanyInfo.name || 'Les Laboratoires T. Wiley'}
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {t('hero.title', 'Découvrez Nos Produits')}
          </h1>
          <p className="mt-2 text-sm sm:text-lg lg:text-xl text-amber-300 font-bold tracking-wide drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)]">
            {currentCompanyInfo.activities || 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique'}
          </p>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-100 max-w-2xl mx-auto font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            {t(
              'hero.desc',
              'Formulations certifiées, cosmétiques et solutions professionnelles répondant aux exigences professionnelles et internationales.'
            )}
          </p>
        </div>
      </section>

      {/* BANNIÈRE INTERNATIONALE AVEC ZOOM AVANT SUCCESSIVE (USA, AFRIQUE, CÔTE D'IVOIRE) */}
      <ShowcaseZoomBanner />

      {/* SECTION 2 : CATÉGORIES RAPIDES COMPACTES ET HARMONIEUSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 relative z-20 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(isSelected ? 'all' : cat.id)}
                className={`group relative overflow-hidden rounded-2xl p-3 sm:p-3.5 text-left border transition-all duration-300 shadow-2xs hover:shadow-md flex flex-col justify-between ${isSelected
                    ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white hover:border-brand-300'
                  }`}
              >
                <div>
                  <div className="h-28 sm:h-32 lg:h-36 w-full rounded-xl overflow-hidden mb-2 bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.image || '/placeholder.png'}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-brand-700 transition-colors truncate">
                    {cat.name}
                  </h3>
                </div>
                <span className="text-[11px] text-brand-600 font-semibold mt-1 inline-flex items-center gap-1">
                  {isSelected ? '✓ Sélectionnée' : 'Explorer →'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION COMMERCIALE : VALEURS / ASSURANCES CLIENT (DÉFILEMENT PAR PETITES CARTES SUR MOBILE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-2.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:pb-0">
          <div className="flex-shrink-0 w-[170px] sm:w-auto snap-start bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">Formules Certifiées</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Qualité professionnelle</p>
            </div>
          </div>

          <div className="flex-shrink-0 w-[170px] sm:w-auto snap-start bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">Livraison Réactive</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Directement chez vous</p>
            </div>
          </div>

          <div className="flex-shrink-0 w-[170px] sm:w-auto snap-start bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">Commande WhatsApp</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Simple et direct</p>
            </div>
          </div>

          <div className="flex-shrink-0 w-[170px] sm:w-auto snap-start bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">Paiement Sécurisé</p>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">À la réception</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION CATALOGUE PLEINE LARGEUR AVEC BARRE DE RECHERCHE ET FILTRES INTÉGRÉS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        {/* BARRE HORIZONTALE UNIFIÉE : RECHERCHE + SÉLECTEUR DE CATÉGORIES + TRI */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* 1. CHAMP DE RECHERCHE PRINCIPAL */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('catalog.search_placeholder', 'Rechercher un produit (nom, détergent, lotion, gel, savon)...')}
                className="w-full py-2.5 pl-10 pr-9 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 bg-slate-50/70 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                  title="Effacer la recherche"
                >
                  ×
                </button>
              )}
            </div>

            {/* 2. SÉLECTEUR DE CATÉGORIES ET TRI */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500 w-full sm:w-auto"
              >
                <option value="all">{t('catalog.all_categories', 'Toutes les catégories')}</option>
                {currentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500 w-full sm:w-auto"
              >
                <option value="newest">{t('catalog.sort_newest', 'Nouveautés')}</option>
                <option value="price_asc">{t('catalog.sort_price_asc', 'Prix croissant')}</option>
                <option value="price_desc">{t('catalog.sort_price_desc', 'Prix décroissant')}</option>
                <option value="name_asc">{t('catalog.sort_name_asc', 'Nom (A-Z)')}</option>
              </select>

              {(selectedCategoryId !== 'all' || searchQuery !== '' || sortBy !== 'newest') && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-brand-600 hover:text-brand-800 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5 flex-shrink-0"
                  title={t('catalog.reset_all', 'Réinitialiser')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('catalog.reset_all', 'Effacer')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* GRILLE DES PRODUITS PLEINE LARGEUR EN CONTINU (SANS PAGINATION) */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={companyInfo.whatsappNumber}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('catalog.no_products', 'Aucun produit ne correspond')}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              {t('catalog.try_relaxing', 'Modifiez vos critères de recherche ou réinitialisez les filtres pour voir tous nos produits.')}
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              {t('catalog.reset_all', 'Réinitialiser les filtres')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

