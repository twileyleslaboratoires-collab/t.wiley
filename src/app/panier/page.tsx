'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import {
  formatPriceFCFA,
  generateCartOrderMessage,
  buildWhatsAppUrl,
} from '@/lib/whatsapp';
import { CompanyInfo } from '@/types';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalCount, isInitialized } =
    useCart();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.json())
      .then((data) => setCompanyInfo(data))
      .catch((err) => console.error('Erreur chargement info entreprise:', err));
  }, []);

  const handleWhatsAppCheckout = () => {
    if (!companyInfo || items.length === 0) return;
    const message = generateCartOrderMessage(items);
    const url = buildWhatsAppUrl(companyInfo.whatsappNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isInitialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continuer mes achats dans la boutique
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-6">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              Mon Panier de commande
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Chargement de votre sélection...</p>
          </div>
        </div>
        <div className="py-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent mb-4"></div>
          <p className="text-sm font-medium">Chargement des articles du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Bouton retour placé tout en haut de l'encadrement */}
      <div className="mb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continuer mes achats dans la boutique
        </Link>
      </div>

      {/* En-tête de la page avec écriture compacte et adaptée */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-6">
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            Mon Panier de commande
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalCount > 0
              ? `Vous avez ${totalCount} article(s) dans votre panier`
              : 'Votre panier est actuellement vide'}
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold self-start sm:self-auto inline-flex items-center gap-1 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vider le panier
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* État Panier vide */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 mx-auto mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Votre panier est vide</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
            Vous n'avez pas encore sélectionné de produit. Parcourez notre boutique pour découvrir
            nos solutions d'entretien et détergents de qualité.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4" />
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        /* Grille du Panier : Liste à gauche, Résumé & WhatsApp à droite */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Liste des articles */}
          <div className="lg:col-span-8 space-y-4">
            {items.map(({ product, quantity }) => {
              const itemTotal = product.price * quantity;
              const maxStock =
                product.availability === 'in_stock' && product.stockQuantity > 0
                  ? product.stockQuantity
                  : 9999;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
                >
                  {/* Photo & Nom */}
                  <div className="flex items-center gap-4 flex-1">
                    <Link
                      href={`/produit/${product.slug}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div>
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md uppercase">
                        {product.categoryName}
                      </span>
                      <Link
                        href={`/produit/${product.slug}`}
                        className="block font-bold text-slate-900 text-sm sm:text-base hover:text-brand-600 transition-colors mt-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Format : <span className="text-slate-700 font-medium">{product.packaging}</span>
                      </p>
                      <p className="text-xs font-semibold text-slate-800 mt-1 sm:hidden">
                        Prix unitaire : {formatPriceFCFA(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantité & Prix & Suppression */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="hidden sm:block text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">Prix unitaire</span>
                      <span className="text-xs font-bold text-slate-700">
                        {formatPriceFCFA(product.price)}
                      </span>
                    </div>

                    {/* Sélecteur de quantité */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= maxStock}
                        className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Sous-total */}
                    <div className="text-right min-w-[90px]">
                      <span className="text-[11px] text-slate-400 block font-medium">Sous-total</span>
                      <span className="text-sm font-extrabold text-brand-700">
                        {formatPriceFCFA(itemTotal)}
                      </span>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer cet article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RÉSUMÉ DE LA COMMANDE ET ACTION WHATSAPP */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm sticky top-28 space-y-6">
              <h2 className="text-lg font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                Récapitulatif de commande
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Articles sélectionnés</span>
                  <span className="font-semibold text-slate-900">{totalCount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Modalités de paiement</span>
                  <span className="font-semibold text-brand-700">À discuter</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Livraison</span>
                  <span className="font-semibold text-slate-900">Calculée sur WhatsApp</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-black text-slate-900 block">Total estimé</span>
                    <span className="text-[11px] text-slate-400">TVA comprise</span>
                  </div>
                  <span className="text-2xl font-black text-brand-700">
                    {formatPriceFCFA(totalAmount)}
                  </span>
                </div>
              </div>

              {/* BOUTON OBLIGATOIRE DU CAHIER DES CHARGES : COMMANDER VIA WHATSAPP */}
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl text-sm font-extrabold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                COMMANDER VIA WHATSAPP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
