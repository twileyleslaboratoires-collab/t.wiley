import React from 'react';
import type { Metadata } from 'next';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Globe,
} from 'lucide-react';
import { getDatabase } from '@/lib/storage';
import { sanitizeWhatsAppNumber } from '@/lib/whatsapp';
import ContactFormClient from '@/components/ContactFormClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Contactez-nous',
  description:
    'Prenez contact avec Les Laboratoires T. Wiley à Bouaké, Côte d’Ivoire, pour vos commandes de cosmétiques, détergences hospitalières, domestique et mécanique.',
};

export default function ContactPage() {
  const db = getDatabase();
  const info = db.companyInfo;
  const whatsappClean = sanitizeWhatsAppNumber(info.whatsappNumber || '2250767626468');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* En-tête */}
      <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          Équipe Commerciale Disponible
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contactez Les Laboratoires T. Wiley
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          {info.activities || 'Cosmétiques — Détergences hospitalières — Domestique — Mécanique'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Coordonnées officielles à gauche */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Coordonnées Officielles
            </h2>

            {/* Bouton WhatsApp en vedette */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">WhatsApp Commandes</h3>
                  <p className="text-xs text-emerald-700">Réponse rapide de notre équipe commerciale</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-colors"
              >
                Ouvrir la conversation (+{whatsappClean})
              </a>
            </div>

            {/* Liste coordonnées */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              {/* Adresse */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">Adresse</span>
                  <span className="text-slate-900 font-medium">{info.address}</span>
                  <span className="block text-[11px] text-slate-500">{info.city}, {info.country}</span>
                </div>
              </div>

              {/* Téléphones Côte d'Ivoire */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">
                    Téléphones Côte d'Ivoire
                  </span>
                  <div className="flex flex-col gap-1 mt-0.5">
                    <a href="tel:0767626468" className="text-slate-900 font-semibold hover:text-brand-600">
                      {info.phone1 || '07 67 62 64 68'}
                    </a>
                    <a href="tel:0140986464" className="text-slate-900 font-semibold hover:text-brand-600">
                      {info.phone2 || '01 40 98 64 64'}
                    </a>
                    <a href="tel:2731624183" className="text-slate-900 font-semibold hover:text-brand-600">
                      {info.phone3 || '27 31 62 41 83'}
                    </a>
                    {info.additionalPhones && info.additionalPhones.filter(Boolean).map((p, i) => (
                      <a key={i} href={`tel:${p.replace(/\s+/g, '')}`} className="text-slate-900 font-semibold hover:text-brand-600">
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Téléphone États-Unis */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">
                    Téléphone États-Unis
                  </span>
                  <a
                    href="tel:+17042872551"
                    className="text-slate-900 font-semibold hover:text-brand-600"
                  >
                    {info.phoneUS || '+1 704 287 2551'}
                  </a>
                </div>
              </div>

              {/* Email (uniquement si renseigné par l'admin) */}
              {info.email && (
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Email</span>
                    <a
                      href={`mailto:${info.email}`}
                      className="text-slate-900 font-semibold hover:text-brand-600"
                    >
                      {info.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Horaires */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase">
                    Horaires d'ouverture
                  </span>
                  <span className="text-slate-900 font-medium">{info.openingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact à droite */}
        <div className="lg:col-span-7">
          <ContactFormClient whatsappNumber={info.whatsappNumber} />
        </div>
      </div>
    </div>
  );
}
