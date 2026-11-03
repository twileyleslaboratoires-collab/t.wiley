'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { CompanyInfo } from '@/types';

interface FooterProps {
  companyInfo: CompanyInfo;
}

export default function Footer({ companyInfo }: FooterProps) {
  const pathname = usePathname();

  // Masquer le footer public sur l'espace gestionnaire / admin
  if (pathname.startsWith('/gestionnaire') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Col 1: Entreprise & Logo Officiel */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-auto max-w-[140px] flex items-center justify-center bg-white/10 rounded-xl p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={companyInfo?.logo || '/logo-laboratoires-t-wiley.jpg'}
                  alt={companyInfo?.name || 'Les Laboratoires T. Wiley'}
                  className="max-h-12 w-auto object-contain rounded"
                />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight leading-snug">
                {companyInfo?.name || 'Les Laboratoires T. Wiley'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {companyInfo?.description ||
                'Laboratoires spécialisés dans la formulation et distribution de solutions en cosmétiques, détergences hospitalières, hygiène domestique et entretien mécanique.'}
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Commandes traitées rapidement sur WhatsApp
            </div>
          </div>

          {/* Col 2: Navigation rapide (Boutique, Catégories, Panier, Contact, À propos) */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Boutique en ligne
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Toutes les catégories
                </Link>
              </li>
              <li>
                <Link href="/panier" className="hover:text-white transition-colors">
                  Mon Panier d'achats
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Nous Contacter
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-white transition-colors">
                  À Propos de nous
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Coordonnées officielles vérifiées */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              Coordonnées Officielles
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>{companyInfo?.address || 'France 1, Feu Pacha, Bouaké, Côte d\'Ivoire'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Côte d'Ivoire :</span>
                  <a href="tel:0767626468" className="hover:text-white transition-colors">
                    {companyInfo?.phone1 || '07 67 62 64 68'}
                  </a>
                  <a href="tel:0140986464" className="hover:text-white transition-colors">
                    {companyInfo?.phone2 || '01 40 98 64 64'}
                  </a>
                  <a href="tel:2731624183" className="hover:text-white transition-colors">
                    {companyInfo?.phone3 || '27 31 62 41 83'}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">États-Unis :</span>
                  <a href="tel:+17042872551" className="hover:text-white transition-colors">
                    {companyInfo?.phoneUS || '+1 704 287 2551'}
                  </a>
                </div>
              </li>
              {companyInfo?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <a href={`mailto:${companyInfo.email}`} className="hover:text-white transition-colors">
                    {companyInfo.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>{companyInfo?.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {companyInfo?.name || 'Les Laboratoires T. Wiley'}. Tous droits réservés.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span>Modalités de paiement à discuter lors de la commande</span>
            <span>Bouaké, Côte d'Ivoire</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
