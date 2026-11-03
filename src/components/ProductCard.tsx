'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye, MessageCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatPriceFCFA, generateSingleProductOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
}

export default function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    showToast(`"${product.name}" a été ajouté à votre panier !`, 'success');
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
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-400 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Product Image (format compact et dynamique) */}
      <div className="relative aspect-[16/11] w-full bg-slate-100 overflow-hidden">
        <Link href={`/produit/${product.slug}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-white/95 backdrop-blur-md text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
            {product.categoryName}
          </span>
        </div>
      </div>

      {/* Product Info (hauteur optimisée et compacte) */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-medium text-slate-500 truncate mb-1">
            {product.packaging}
          </div>
          <Link href={`/produit/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 hover:text-brand-600 transition-colors" title={product.name}>
              {product.name}
            </h3>
          </Link>
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

          {/* Action Buttons: "Voir" & "Commander WhatsApp" */}
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href={`/produit/${product.slug}`}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:text-brand-700 transition-all text-center"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Voir
            </Link>

            <button
              onClick={handleQuickWhatsApp}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
              title="Commander directement via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              Commander
            </button>
          </div>

          {/* Secondary Quick Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="w-full mt-1.5 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}

