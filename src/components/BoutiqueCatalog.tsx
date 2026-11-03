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
import FlagIcon from '@/components/FlagIcon';
import { Product, Category, CompanyInfo } from '@/types';
import { formatPriceFCFA } from '@/lib/whatsapp';

// Liste des pays africains pour le défilement des drapeaux (en commençant impérativement par la Côte d'Ivoire)
const AFRICAN_COUNTRIES = [
  { name: "Côte d'Ivoire", flag: '🇨🇮', code: 'ci' },
  { name: 'Sénégal', flag: '🇸🇳', code: 'sn' },
  { name: 'Mali', flag: '🇲🇱', code: 'ml' },
  { name: 'Burkina Faso', flag: '🇧🇫', code: 'bf' },
  { name: 'Guinée', flag: '🇬🇳', code: 'gn' },
  { name: 'Ghana', flag: '🇬🇭', code: 'gh' },
  { name: 'Togo', flag: '🇹🇬', code: 'tg' },
  { name: 'Bénin', flag: '🇧🇯', code: 'bj' },
  { name: 'Cameroun', flag: '🇨🇲', code: 'cm' },
  { name: 'Gabon', flag: '🇬🇦', code: 'ga' },
  { name: 'Congo', flag: '🇨🇬', code: 'cg' },
  { name: 'RD Congo', flag: '🇨🇩', code: 'cd' },
  { name: 'Niger', flag: '🇳🇪', code: 'ne' },
  { name: 'Tchad', flag: '🇹🇩', code: 'td' },
  { name: 'Nigéria', flag: '🇳🇬', code: 'ng' },
  { name: 'Mauritanie', flag: '🇲🇷', code: 'mr' },
  { name: 'Maroc', flag: '🇲🇦', code: 'ma' },
  { name: 'Algérie', flag: '🇩🇿', code: 'dz' },
  { name: 'Tunisie', flag: '🇹🇳', code: 'tn' },
  { name: 'Égypte', flag: '🇪🇬', code: 'eg' },
  { name: 'Rwanda', flag: '🇷🇼', code: 'rw' },
  { name: 'Kenya', flag: '🇰🇪', code: 'ke' },
  { name: 'Afrique du Sud', flag: '🇿🇦', code: 'za' },
];

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
  // Données dynamiques avec auto-mise à jour en temps réel
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentCategories, setCurrentCategories] = useState<Category[]>(categories);
  const [currentCompanyInfo, setCurrentCompanyInfo] = useState<CompanyInfo>(companyInfo);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<number>(50000); // Max FCFA slider
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('all');
    setSortBy('newest');
    setPriceRange(maxProductPrice);
    setOnlyInStock(false);
    setCurrentPage(1);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
  };

  return (
    <div className="pb-24">
      {/* SECTION 1 : INTRODUCTION COMMERCIALE & BANNIÈRE VIVANTE COMPACTE ET SANS PARTIES SOMBRES INUTILES */}
      <section className="relative overflow-hidden border-b border-slate-800 min-h-[240px] sm:min-h-[280px] lg:min-h-[300px] flex items-center justify-center">
        {/* DRAPEAU DE L'AMÉRIQUE EN HAUT À DROITE DE L'IMAGE — AGRANDI & ANIMÉ SANS NUMÉRO */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-6 z-20">
          <div
            className="inline-flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-600/90 text-white shadow-2xl hover:scale-105 transition-all"
            title="États-Unis d'Amérique"
          >
            <div className="animate-flag-wave flex items-center justify-center">
              <FlagIcon code="us" size="2xl" />
            </div>
            <span className="text-sm sm:text-base font-black tracking-wider text-white">USA</span>
          </div>
        </div>

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

        {/* ÉCRITURES SANS CARTE DE FOND (PROPORTIONNÉES ET PARFAITEMENT LISIBLES) */}
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full py-8 sm:py-12 px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-sm border border-brand-400/50 text-brand-300 text-xs font-bold tracking-wider uppercase mb-2.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            {currentCompanyInfo.name || 'Les Laboratoires T. Wiley'}
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            Découvrez nos produits
          </h1>
          <p className="mt-2.5 text-sm sm:text-lg lg:text-xl text-amber-300 font-bold tracking-wide drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)]">
            {currentCompanyInfo.activities || 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique'}
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-100 max-w-2xl mx-auto font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Formulations certifiées, cosmétiques et solutions professionnelles répondant aux exigences professionnelles et internationales.
          </p>
        </div>
      </section>

      {/* DÉFILEMENT DES DRAPEAUX DE L'AFRIQUE (AVEC LEURS VRAIS DRAPEAUX EN COMMENÇANT PAR LA CÔTE D'IVOIRE) */}
      <section className="bg-slate-900 border-b border-slate-800 py-3.5 overflow-hidden shadow-inner relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-amber-400">
            <span className="text-sm">🌍</span>
            <span>Rayonnement & Distribution Panafricaine</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            🇨🇮 Depuis la Côte d'Ivoire vers toute l'Afrique
          </span>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-3 sm:gap-4 py-1">
            {[...AFRICAN_COUNTRIES, ...AFRICAN_COUNTRIES].map((country, idx) => (
              <div
                key={`${country.code}-${idx}`}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-200 font-medium whitespace-nowrap hover:bg-slate-700 transition-colors shadow-xs"
              >
                <FlagIcon code={country.code} size="md" />
                <span className="font-semibold text-slate-100">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* SECTION COMMERCIALE : VALEURS / ASSURANCES CLIENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Formules Certifiées</p>
              <p className="text-xs text-slate-500">Qualité professionnelle garantie</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Livraison Réactive</p>
              <p className="text-xs text-slate-500">Directement dans vos locaux</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Commande WhatsApp</p>
              <p className="text-xs text-slate-500">Simple, direct et sans intermédiaire</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Paiement Sécurisé</p>
              <p className="text-xs text-slate-500">À la réception de commande</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION CATALOGUE PLEINE LARGEUR AVEC BARRE DE RECHERCHE ET FILTRES INTÉGRÉS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {/* BARRE HORIZONTALE UNIFIÉE : RECHERCHE + SÉLECTEUR DE CATÉGORIES + TRI + PILLS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs mb-6 space-y-3.5">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* 1. CHAMP DE RECHERCHE PRINCIPAL */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher un produit (nom, détergent, lotion, gel, savon)..."
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
                <option value="all">Toutes les catégories ({products.length})</option>
                {currentCategories.map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({count})
                    </option>
                  );
                })}
              </select>

              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500 w-full sm:w-auto"
              >
                <option value="newest">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="name_asc">Nom (A-Z)</option>
              </select>

              {(selectedCategoryId !== 'all' || searchQuery !== '' || sortBy !== 'newest') && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-brand-600 hover:text-brand-800 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5 flex-shrink-0"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Effacer</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. FILTRES RAPIDES PAR BADGES / PILLS DE CATÉGORIES */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`px-3 py-1.5 rounded-full font-semibold flex-shrink-0 transition-all ${selectedCategoryId === 'all'
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              Tous ({products.length})
            </button>
            {currentCategories.map((cat) => {
              const active = selectedCategoryId === cat.id;
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3 py-1.5 rounded-full font-semibold flex-shrink-0 transition-all ${active
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* COMPTEUR DE PRODUITS TROUVÉS */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span className="font-bold text-slate-900">{sortedProducts.length}</span> produit(s)
              disponible(s)
              {selectedCategoryId !== 'all' && (
                <span className="ml-2 font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                  {categories.find((c) => c.id === selectedCategoryId)?.name}
                </span>
              )}
              {searchQuery && (
                <span className="ml-2 text-slate-400">pour &ldquo;{searchQuery}&rdquo;</span>
              )}
            </div>
          </div>
        </div>

        {/* GRILLE DES PRODUITS PLEINE LARGEUR (4 COLONNES COMPACTES ET ÉLÉGANTES) */}
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {paginatedProducts.map((product) => (
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
            <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun produit ne correspond</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Modifiez vos critères de recherche ou réinitialisez les filtres pour voir tous nos
              produits.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* PAGINATION PROGRESSIVE */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              ← Précédent
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === pageNumber
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Suivant →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

