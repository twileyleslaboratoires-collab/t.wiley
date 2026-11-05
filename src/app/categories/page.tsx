import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Layers, ArrowRight } from 'lucide-react';
import { getLiveCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Catégories de Produits',
  description:
    'Découvrez toutes nos gammes de produits : entretien, détergents, cosmétiques et solutions industrielles.',
};

export default async function CategoriesPage() {
  const categories = await getLiveCategories();

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
        {categories.map((category) => (
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
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6">
              <Link
                href={`/?categorie=${category.id}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Découvrir les produits</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
