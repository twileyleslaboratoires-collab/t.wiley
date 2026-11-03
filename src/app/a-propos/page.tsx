import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Target,
  Eye,
  History,
  CheckCircle2,
  Users,
  Building2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Award,
} from 'lucide-react';
import { getDatabase } from '@/lib/storage';
import { sanitizeWhatsAppNumber } from '@/lib/whatsapp';
import PartnerImageSlideshow from '@/components/PartnerImageSlideshow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'À Propos de Nous',
  description:
    'Découvrez l’histoire, les missions, la vision et les engagements de notre société pour l’hygiène professionnelle.',
};

export default function AboutPage() {
  const db = getDatabase();
  const info = db.companyInfo;
  const partners = (db.partners || []).filter((p) => p.isPublished !== false);
  const customSections = (db.aboutSections || [])
    .filter((s) => s.isPublished)
    .sort((a, b) => a.order - b.order);
  const whatsappClean = sanitizeWhatsAppNumber(info.whatsappNumber);

  return (
    <div className="pb-24">
      {/* 1. HERO & PRÉSENTATION DE L'ENTREPRISE — IMAGE EN ARRIÈRE-PLAN SANS CARTE BLANCHE */}
      <section className="relative min-h-[520px] sm:min-h-[580px] flex items-center justify-center border-b border-slate-200/80 pt-14 pb-24 sm:pt-20 sm:pb-32 overflow-hidden bg-stone-900">
        {/* IMAGE EN ARRIÈRE-PLAN */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={info.aboutHeroImage || '/uploads/a-propos-hero-bg.jpg'}
            alt="Laboratoires T. Wiley"
            className="w-full h-full object-cover object-center select-none"
          />
          {/* Voile protecteur pour assurer un contraste et une lisibilité parfaits du texte */}
          <div className="absolute inset-0 bg-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Logo officiel */}
            <div className="inline-block transform hover:scale-105 transition-transform duration-300 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={info.logo || '/logo-laboratoires-t-wiley.jpg'}
                alt={info.name}
                className="h-16 sm:h-24 md:h-28 w-auto object-contain mx-auto rounded-2xl shadow-xl border border-white/30 bg-white/90 p-2"
              />
            </div>

            <div>
              <span className="inline-flex items-center gap-2 bg-brand-600/90 backdrop-blur-xs text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-white/20">
                <Award className="w-4 h-4 text-amber-300" />
                L'Entreprise & Nos Valeurs
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              {info.name}
            </h1>
            <p className="text-base sm:text-xl text-amber-300 font-extrabold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {info.slogan}
            </p>
            <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-2xl mx-auto pt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              {info.description}
            </p>
          </div>
        </div>
      </section>

      {/* 2. HISTORIQUE, MISSION & VISION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Historique */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Notre Histoire</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{info.history}</p>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Notre Mission</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{info.mission}</p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Notre Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{info.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NOS DOMAINES D'ACTIVITÉ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
            Expertise & Gammes
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Nos Domaines d'Activité
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Des formulations adaptées à chaque contexte d'hygiène et de nettoyage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {info.domainActivities.map((act, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-brand-300 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm mb-4">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">{act.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. NOS ENGAGEMENTS */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
              Rigueur & Exigence
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Nos Engagements Qualité
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {info.commitments.map((com, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mb-2">{com.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{com.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NOTRE CLIENTÈLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
            Particuliers & Entreprises
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notre Clientèle
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Une offre diversifiée qui répond aux besoins spécifiques de chaque secteur.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {info.clientSegments.map((seg, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{seg.title}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{seg.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5.B SECTIONS DYNAMIQUES PERSONNALISÉES (GÉRÉES DEPUIS L'ADMINISTRATION) */}
      {customSections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-12">
          {customSections.map((sec) => (
            <div
              key={sec.id}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
            >
              {sec.image && (
                <div className="w-full lg:w-1/2 aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sec.image}
                    alt={sec.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              <div className="w-full lg:w-1/2 space-y-4">
                {sec.badge && (
                  <span className="inline-block px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
                    {sec.badge}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {sec.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                  {sec.description}
                </p>
                {sec.content && (
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-3">
                    {sec.content}
                  </div>
                )}
                {sec.videoUrl && (
                  <div className="pt-2">
                    <a
                      href={sec.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-3.5 py-2 rounded-xl"
                    >
                      ▶ Visionner la vidéo de présentation
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 6. NOS PARTENAIRES */}
      {partners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
              Réseau de Confiance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Nos Partenaires
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-20 w-full rounded-xl overflow-hidden bg-slate-50 mb-4 flex items-center justify-center p-2 border border-slate-100 relative">
                    <PartnerImageSlideshow
                      images={partner.images}
                      fallbackImage={partner.logo}
                      alt={partner.name}
                    />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">{partner.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{partner.description}</p>
                </div>

                {partner.websiteUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-bold"
                    >
                      <span>Visiter le site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. INFORMATIONS INSTITUTIONNELLES & CTA WHATSAPP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-sky-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/20 backdrop-blur-xs px-3 py-1 rounded-lg">
              Prêt à commander ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
              Besoin de renseignements ou d’un partenariat ?
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 mt-2 leading-relaxed">
              Contactez directement notre direction commerciale sur WhatsApp pour vos contrats
              d'approvisionnement annuel ou commandes ponctuelles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-4 rounded-2xl shadow-lg transition-transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              Écrire sur WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-4 rounded-2xl transition-colors"
            >
              Consulter nos coordonnées
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

