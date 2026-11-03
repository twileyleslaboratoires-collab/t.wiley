import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Layers, ArrowRight, ShoppingBag } from 'lucide-react';
import { getDatabase } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Catégories de Produits',
  description:
    'Découvrez toutes nos gammes de produits : entretien, détergents, cosmétiques et solutions industrielles.',
};

export default function CategoriesPage() {
  const db = getDatabase();
  const publishedProducts = db.products.filter((p) => p.isPublished);

  // Compter les produits par catégorie
  const categoriesWithCounts = db.categories.map((cat) => {
    const count = publishedProducts.filter((p) => p.categoryId === cat.id).length;
    return {
      ...cat,
      productCount: count,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* En-tête */}
      <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4 border border-brand-100">
          <Layers className="w-4 h-4 text-brand-600" />
          Nos Familles de Produits
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Toutes les Catégories
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Explorez nos solutions ciblées formulées pour les collectivités, entreprises, usines et
          ménages soucieux d'une hygiène irréprochable.
        </p>
      </div>

      {/* Grille des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoriesWithCounts.map((category) => (
          <div
            key={category.id}
            className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                  <span>
                    {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2">
              <Link
                href={`/?category=${category.id}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-brand-600 text-slate-700 hover:text-white font-bold text-xs py-3 rounded-xl border border-slate-200 hover:border-transparent transition-all"
              >
                <span>Voir les produits associés</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

