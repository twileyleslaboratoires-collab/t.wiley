'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, MessageCircle, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatPriceFCFA, generateSingleProductOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
}

export default function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleCardClick = () => {
    router.push(`/produit/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    showToast(`"${product.name}" ${t('card.added_toast', 'a été ajouté à votre panier !')}`, 'success');
  };

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${origin}/produit/${product.slug}`;
    const fullImageUrl = product.mainImage?.startsWith('http')
      ? product.mainImage
      : origin
      ? `${origin}${product.mainImage}`
      : '';
    const message = generateSingleProductOrderMessage(product, 1, productUrl, fullImageUrl);
    const url = buildWhatsAppUrl(whatsappNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-400 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Product Image (format compact et dynamique) */}
      <div className="relative aspect-[16/11] w-full bg-slate-100 overflow-hidden">
        <div className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-white/95 backdrop-blur-md text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
            {product.categoryName}
          </span>
        </div>
      </div>

      {/* Product Info (hauteur optimisée et compacte) */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-500 mb-1">
            <span className="truncate">{product.packaging}</span>
            <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded text-[10px] shrink-0">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
              <span>5.0</span>
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 hover:text-brand-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-normal">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100">
          {/* Price */}
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-base sm:text-lg font-black text-brand-700">
              {formatPriceFCFA(product.price)}
            </span>
          </div>

          {/* Action Buttons: "Ajouter" & "Commander WhatsApp" */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-all text-center"
              title={t('card.add', 'Ajouter au panier')}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('card.add', 'Ajouter')}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickWhatsApp}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs text-center"
              title={t('card.order', 'Commander sur WhatsApp')}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>{t('card.order', 'Commander')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

