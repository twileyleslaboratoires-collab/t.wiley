'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  Video,
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, CompanyInfo } from '@/types';
import {
  formatPriceFCFA,
  generateSingleProductOrderMessage,
  buildWhatsAppUrl,
  sanitizeWhatsAppNumber,
} from '@/lib/whatsapp';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  sameCategoryProducts?: Product[];
  similarProducts?: Product[];
  companyInfo: CompanyInfo;
}

export default function ProductDetailClient({
  product: initialProduct,
  sameCategoryProducts = [],
  similarProducts = [],
  companyInfo: initialCompanyInfo,
}: ProductDetailClientProps) {
  // Données dynamiques avec auto-mise à jour en temps réel
  const [product, setProduct] = useState<Product>(initialProduct);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);

  // Synchronisation immédiate quand les props changent
  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    setCompanyInfo(initialCompanyInfo);
  }, [initialCompanyInfo]);

  useEffect(() => {
    let isMounted = true;
    const syncProduct = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/products/${initialProduct.id}?_t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/company?_t=${Date.now()}`, { cache: 'no-store' }),
        ]);
        if (isMounted && pRes.ok) {
          const fresh = await pRes.json();
          if (fresh && fresh.id) {
            setProduct(fresh);
          }
        }
        if (isMounted && cRes.ok) {
          const comp = await cRes.json();
          if (comp) {
            setCompanyInfo(comp);
          }
        }
      } catch {
        // Ignorer
      }
    };

    // Synchro immédiate dès le montage
    syncProduct();

    const interval = setInterval(syncProduct, 4000);
    window.addEventListener('focus', syncProduct);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', syncProduct);
    };
  }, [initialProduct.id]);
  // Liste des images
  const allImages = React.useMemo(() => {
    const list = product.images && product.images.length > 0 ? [...product.images] : [];
    if (product.mainImage && !list.includes(product.mainImage)) {
      list.unshift(product.mainImage);
    }
    return list.length > 0 ? list : [product.mainImage || '/placeholder.png'];
  }, [product.images, product.mainImage]);

  // Liste des vidéos
  const allVideos = React.useMemo(() => {
    if (Array.isArray(product.videos) && product.videos.length > 0) {
      return product.videos.filter(Boolean);
    }
    return product.videoUrl ? [product.videoUrl] : [];
  }, [product.videos, product.videoUrl]);

  // Règles exigées par le client :
  // - 1 seule vidéo : intégrée directement au même niveau que les images (dans la galerie)
  // - 2 ou 3+ vidéos : 1ère vidéo au niveau des images, les autres (2ème, 3ème...) dans la description longue
  const galleryVideo = (allVideos.length > 0 && product.showVideo !== false) ? allVideos[0] : null;
  const descriptionVideos = (allVideos.length > 1 && product.showVideo !== false) ? allVideos.slice(1) : [];

  // Éléments du carrousel multimédia principal (Photos + 1ère Vidéo si présente)
  const mediaItems = React.useMemo(() => {
    const items: Array<{ type: 'image' | 'video'; url: string }> = allImages.map((img) => ({
      type: 'image',
      url: img,
    }));
    if (galleryVideo) {
      items.push({ type: 'video', url: galleryVideo });
    }
    return items;
  }, [allImages, galleryVideo]);

  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const maxStock = 999;

  // Défilement direct sans cliquer sur les miniatures en dessous
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  // Support du glisser tactile sur mobile (Swipe)
  const touchStartX = React.useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 45) {
      handlePrev();
    } else if (deltaX < -45) {
      handleNext();
    }
    touchStartX.current = null;
  };

  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => Math.min(maxStock, q + 1));
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast(`${quantity}x "${product.name}" ajouté(s) à votre panier !`, 'success');
  };

  // Commande directe WhatsApp pour ce produit et cette quantité
  const handleOrderWhatsApp = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${origin}/produit/${product.slug}`;
    const fullImageUrl = product.mainImage?.startsWith('http')
      ? product.mainImage
      : origin
      ? `${origin}${product.mainImage}`
      : '';
    const message = generateSingleProductOrderMessage(product, quantity, productUrl, fullImageUrl);
    const url = buildWhatsAppUrl(companyInfo.whatsappNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Question / Renseignement sur WhatsApp
  const handleAskQuestionsWhatsApp = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${origin}/produit/${product.slug}`;
    const fullImageUrl = product.mainImage?.startsWith('http')
      ? product.mainImage
      : origin
      ? `${origin}${product.mainImage}`
      : '';
    let msg = `Bonjour, je souhaite avoir des renseignements sur le produit : "${product.name}".\n\n`;
    if (fullImageUrl) {
      msg += `📸 Photo : ${fullImageUrl}\n`;
    }
    if (productUrl) {
      msg += `🔗 Fiche : ${productUrl}\n\n`;
    }
    msg += `Pouvez-vous m'apporter plus de précisions ?`;
    const url = buildWhatsAppUrl(companyInfo.whatsappNumber, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Lecteur vidéo responsive universel (YouTube ou MP4 local)
  const renderVideoPlayer = (url: string, title: string = 'Vidéo produit') => {
    if (!url) return null;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYouTube) {
      let embedUrl = url;
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/');
      }
      return (
        <div className="aspect-16/9 w-full rounded-2xl overflow-hidden bg-black shadow-md">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-200">
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="w-full max-h-[380px] sm:max-h-[460px] object-contain mx-auto"
        >
          Votre navigateur ne supporte pas la lecture de cette vidéo.
        </video>
      </div>
    );
  };

  const currentMedia = mediaItems[currentMediaIndex] || mediaItems[0] || { type: 'image', url: product.mainImage };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Fil d'ariane & bouton retour */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour à la boutique
        </Link>
        <span>/</span>
        <Link href={`/categories`} className="hover:text-brand-600">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Grille principale : Galerie à gauche, Infos à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
        {/* GALERIE MULTIMÉDIA : DÉFILEMENT DIRECT SANS SÉLECTIONNER L'IMAGE EN DESSOUS */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-xs group select-none flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Badge indicateur de vidéo disponible */}
            {allVideos.length > 0 && product.showVideo !== false && (
              <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-amber-500/95 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1.5 backdrop-blur-xs pointer-events-none">
                <Play className="w-3 h-3 fill-slate-950" />
                <span>{allVideos.length > 1 ? `${allVideos.length} vidéos disponibles` : 'Vidéo disponible'}</span>
              </div>
            )}

            {/* Contenu visuel actif (Photo ou Vidéo au même niveau) */}
            {currentMedia.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentMedia.url}
                src={currentMedia.url}
                alt={`${product.name} - Vue ${currentMediaIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black p-2">
                {renderVideoPlayer(currentMedia.url, `${product.name} - Vidéo de démonstration`)}
              </div>
            )}

            {/* BOUTONS FLÈCHES POUR DÉFILER DIRECTEMENT SUR L'IMAGE (SANS CLIQUER LES MINIATURES) */}
            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-xl backdrop-blur-xs flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 border border-white/20"
                  aria-label="Média précédent"
                  title="Précédent"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-xl backdrop-blur-xs flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 border border-white/20"
                  aria-label="Média suivant"
                  title="Suivant"
                >
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>

                {/* Badge indicateur de position */}
                <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold tracking-wider shadow-lg flex items-center gap-1.5 border border-white/20">
                  {currentMedia.type === 'video' ? (
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <span>
                    {currentMediaIndex + 1} / {mediaItems.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Miniatures si multiples médias (synchronisées avec le carrousel) */}
          {mediaItems.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentMediaIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${currentMediaIndex === idx
                      ? 'border-brand-600 ring-2 ring-brand-500/30 opacity-100 scale-102'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  title={item.type === 'video' ? 'Vidéo démonstration' : `Vue ${idx + 1}`}
                >
                  {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={`Vue ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white gap-1 p-1">
                      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-xs">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-tight">Vidéo</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFORMATIONS COMMERCIALES (Droite sur Desktop, En-dessous sur Mobile) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-lg">
                {product.categoryName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Conditionnement & Format & Référence */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                Conditionnement : <span className="text-slate-900 font-bold">{product.packaging}</span>
              </div>
              {product.sku && (
                <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500">
                  Réf : <span className="text-slate-800 font-mono font-bold">{product.sku}</span>
                </div>
              )}
            </div>

            {/* PRIX (TAILLE OPTIMISÉE ET COMPACTE) */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Prix unitaire</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-brand-700">
                    {formatPriceFCFA(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through">
                      {formatPriceFCFA(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block font-medium">Total estimé</span>
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {formatPriceFCFA(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {product.shortDescription}
              </p>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
                {product.fullDescription}
              </div>
            </div>

            {/* VIDÉOS D'APPLICATION DANS LA DESCRIPTION LONGUE (POUR 2 OU 3 VIDÉOS AJOUTÉES) */}
            {descriptionVideos.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-600" />
                  Démonstrations Vidéo d'Application & Résultats
                </h3>
                <div className="space-y-4">
                  {descriptionVideos.map((vUrl, vIdx) => (
                    <div key={vIdx} className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-black inline-flex items-center justify-center">
                          {vIdx + 2}
                        </span>
                        Vidéo d'application n°{vIdx + 2}
                      </p>
                      {renderVideoPlayer(vUrl, `Vidéo d'application ${vIdx + 2}`)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caractéristiques techniques */}
            {product.characteristics && product.characteristics.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Caractéristiques
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {product.characteristics.map((c, i) => (
                    <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-500 block font-medium">{c.label}</span>
                      <span className="text-slate-900 font-semibold">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Précautions d'usage (Exigence stricte client) :
                - Pour TOUS les produits SAUF cosmétiques : afficher le message rassurant "Tenir hors de portée des enfants."
                - Pour les produits cosmétiques : NE PAS afficher de message anxiogène */}
            {product.categoryId === 'cat-cosmetiques' ? (
              product.additionalInfo &&
              !product.additionalInfo.toLowerCase().includes('enfants') &&
              !product.additionalInfo.toLowerCase().includes('gants') &&
              !product.additionalInfo.toLowerCase().includes('protection') && (
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{product.additionalInfo}</span>
                </div>
              )
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2 font-medium shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Tenir hors de portée des enfants.</span>
              </div>
            )}
          </div>

          {/* SÉLECTEUR DE QUANTITÉ & BOUTONS D'ACTION (TAILLE RÉDUITE ET COMPACTE) */}
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quantité :
              </span>
              <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="py-1 px-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-xs text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= maxStock}
                  className="py-1 px-2.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* BOUTON PRINCIPAL : COMMANDER SUR WHATSAPP */}
            <button
              onClick={handleOrderWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              COMMANDER SUR WHATSAPP
            </button>

            {/* BOUTON AJOUTER AU PANIER */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-brand-200 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Ajouter au panier (plusieurs articles)
            </button>
          </div>
        </div>
      </div>

      {/* 1. SECTION : PRODUITS DE LA MÊME CATÉGORIE */}
      {sameCategoryProducts.length > 0 && (
        <section className="mt-6 pt-6 border-t border-slate-200/80">
          <div className="border-b border-slate-200 pb-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-0.5">
                Gamme {product.categoryName}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Produits de la même catégorie
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 self-start sm:self-auto inline-flex items-center gap-1 group"
            >
              <span>Voir toute la catégorie</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sameCategoryProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                whatsappNumber={companyInfo.whatsappNumber}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. SECTION : PRODUITS SIMILAIRES & RECOMMANDATIONS */}
      {similarProducts.length > 0 && (
        <section className="mt-8 pt-6 border-t border-slate-200/80">
          <div className="border-b border-slate-200 pb-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">
                Suggestions complémentaires
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Produits similaires & Recommandations
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-brand-600 self-start sm:self-auto inline-flex items-center gap-1 group"
            >
              <span>Explorer la boutique</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                whatsappNumber={companyInfo.whatsappNumber}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
