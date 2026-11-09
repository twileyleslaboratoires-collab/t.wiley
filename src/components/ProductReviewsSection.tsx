'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  Send,
  X,
  User,
  MapPin,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import { ProductReview } from '@/types';
import StarRating from './StarRating';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Excellent — Parfait !',
  4: 'Très bon produit',
  3: 'Correct / Moyen',
  2: 'Passable',
  1: 'Décevant',
};

export default function ProductReviewsSection({
  productId,
  productName,
}: ProductReviewsSectionProps) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Champs du formulaire
  const [authorName, setAuthorName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Chargement des avis en direct
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
          }
        }
      } catch (err) {
        console.warn('Erreur chargement avis:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Statistiques calculées
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        average: 5,
        total: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
        percent5: 0,
        percent4: 0,
        percent3: 0,
        percent2: 0,
        percent1: 0,
      };
    }

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sum += star;
    });

    const total = reviews.length;
    const avg = Number((sum / total).toFixed(1));

    return {
      average: avg,
      total,
      breakdown,
      percent5: Math.round(((breakdown[5] || 0) / total) * 100),
      percent4: Math.round(((breakdown[4] || 0) / total) * 100),
      percent3: Math.round(((breakdown[3] || 0) / total) * 100),
      percent2: Math.round(((breakdown[2] || 0) / total) * 100),
      percent1: Math.round(((breakdown[1] || 0) / total) * 100),
    };
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim() || authorName.trim().length < 2) {
      showToast('Veuillez saisir votre nom (au moins 2 caractères).', 'info');
      return;
    }

    if (!comment.trim() || comment.trim().length < 4) {
      showToast('Veuillez écrire un commentaire d’au moins 4 caractères.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating,
          comment: comment.trim(),
          city: city.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setComment('');
        setCity('');
        setIsFormOpen(false);
        showToast('Merci beaucoup ! Votre avis a été enregistré avec succès.', 'success');
      } else {
        showToast(data.error || 'Erreur lors de l’envoi de votre avis.', 'error');
      }
    } catch {
      showToast('Erreur de connexion. Veuillez réessayer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0] || 'U').substring(0, 2).toUpperCase();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Récemment';
    }
  };

  return (
    <section className="mt-8 pt-8 border-t border-slate-200/90" id="avis-produit">
      {/* EN-TÊTE DE LA SECTION AVIS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
            Retours d’expérience &amp; Témoignages
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Avis Clients</span>
            {stats.total > 0 && (
              <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {stats.total}
              </span>
            )}
          </h2>
        </div>

        {/* BOUTON DÉCLENCHEUR DU FORMULAIRE */}
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Laisser un avis sur ce produit</span>
        </button>
      </div>

      {/* SYNTHÈSE DES NOTES (GRILLE DE RÉPARTITION) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 bg-slate-50/80 rounded-2xl p-5 sm:p-6 mt-6 border border-slate-200/70">
        {/* Colonne 1 : Note globale */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {stats.total > 0 ? stats.average.toFixed(1) : '5.0'}
          </div>
          <div className="mt-2">
            <StarRating rating={stats.total > 0 ? stats.average : 5} size="lg" />
          </div>
          <p className="mt-2 text-xs text-slate-700 font-medium">
            {stats.total > 0
              ? `Basé sur ${stats.total} avis vérifié${stats.total > 1 ? 's' : ''}`
              : 'Soyez le premier à noter ce produit !'}
          </p>
        </div>

        {/* Colonne 2 : Barres de distribution par étoile */}
        <div className="space-y-2 md:col-span-2 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.breakdown[stars] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-slate-600 font-semibold text-[11px]">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL / FORMULAIRE D'AJOUT D'AVIS */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header modal */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                  <Star className="w-4 h-4 fill-brand-600 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    Donner votre avis
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{productName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps du formulaire */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
              {/* Choix de la note */}
              <div className="text-center py-2 bg-amber-50/60 rounded-xl border border-amber-200/50">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre note globale *
                </label>
                <div className="flex justify-center my-1">
                  <StarRating
                    rating={rating}
                    size="xl"
                    interactive
                    onRatingChange={(newRating) => setRating(newRating)}
                  />
                </div>
                <span className="text-xs font-semibold text-amber-700">
                  {RATING_LABELS[rating]}
                </span>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre nom ou prénom *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex: Kouamé Jean, Mariam K..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Ville (facultatif) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre ville / région (facultatif)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Bouaké, Abidjan, Yamoussoukro..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre retour d&apos;expérience détaillé *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre avis sur l'efficacité, le conditionnement, l'usage..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Votre avis sera immédiatement publié sur la fiche produit.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span>Envoi en cours...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publier mon avis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTE DES AVIS CLIENTS */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
            Chargement des avis...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Aucun avis pour le moment
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Avez-vous testé ce produit des Laboratoires T. Wiley ? Soyez le premier à partager votre avis !
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Écrire le premier avis</span>
            </button>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow"
            >
              {/* En-tête de l'avis */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar avec initiales */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-brand-600 to-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                    {getInitials(rev.authorName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {rev.authorName}
                      </span>
                      {rev.isVerified !== false && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Client vérifié</span>
                        </span>
                      )}
                    </div>
                    {rev.city && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{rev.city}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <span className="text-[11px] text-slate-600 font-medium">
                  {formatDate(rev.createdAt)}
                </span>
              </div>

              {/* Étoiles */}
              <div className="mt-2.5 mb-1.5 flex items-center gap-2">
                <StarRating rating={rev.rating} size="sm" />
                <span className="text-[11px] font-bold text-amber-700">
                  {rev.rating} / 5
                </span>
              </div>

              {/* Texte du commentaire */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
