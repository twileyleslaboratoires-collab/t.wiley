'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';
import { CompanyInfo } from '@/types';

interface FooterProps {
  companyInfo: CompanyInfo;
}

export default function Footer({ companyInfo: initialInfo }: FooterProps) {
  const pathname = usePathname();
  const [info, setInfo] = useState<CompanyInfo>(initialInfo);

  // Synchronisation en temps réel avec l'API et écoute des mises à jour du gestionnaire
  useEffect(() => {
    let isMounted = true;

    // Mise à jour depuis l'API fraîche
    const fetchFresh = async () => {
      try {
        const res = await fetch(`/api/company?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setInfo(data);
          }
        }
      } catch (err) {
        // En cas d'erreur, conserve initialInfo
      }
    };

    fetchFresh();

    // Écouteur d'événement immédiat dès qu'un gestionnaire enregistre dans /gestionnaire/contacts
    const handleUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<CompanyInfo>;
      if (customEvent.detail) {
        setInfo(customEvent.detail);
      } else {
        fetchFresh();
      }
    };

    window.addEventListener('company-info-updated', handleUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('company-info-updated', handleUpdated);
    };
  }, []);

  // Masquer le footer public sur l'espace gestionnaire / admin
  if (pathname.startsWith('/gestionnaire') || pathname.startsWith('/admin')) {
    return null;
  }

  // Liste des numéros de téléphone Côte d'Ivoire configurés (principaux + additionnels)
  const ciPhones: string[] = [
    info?.phone1,
    info?.phone2,
    info?.phone3,
    ...(info?.additionalPhones || []),
  ].filter((p): p is string => typeof p === 'string' && p.trim().length > 0);

  // Liste des adresses emails configurées (principale + additionnelles)
  const emails: string[] = [
    info?.email,
    ...(info?.additionalEmails || []),
  ].filter((e): e is string => typeof e === 'string' && e.trim().length > 0);

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
                  src={info?.logo || '/logo-laboratoires-t-wiley.jpg'}
                  alt={info?.name || 'Les Laboratoires T. Wiley'}
                  className="max-h-12 w-auto object-contain rounded"
                />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight leading-snug">
                {info?.name || 'Les Laboratoires T. Wiley'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {info?.description ||
                'Laboratoires spécialisés dans la formulation et distribution de solutions en cosmétiques, détergences hospitalières, hygiène domestique et entretien mécanique.'}
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Commandes traitées rapidement sur WhatsApp
            </div>

            {/* Réseaux sociaux */}
            {info?.socialLinks && (
              <div className="flex items-center gap-3 mt-4">
                {info.socialLinks.facebook && (
                  <a
                    href={info.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    title="Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {info.socialLinks.instagram && (
                  <a
                    href={info.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {info.socialLinks.linkedin && (
                  <a
                    href={info.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-sky-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    title="LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2: Navigation rapide */}
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

          {/* Col 3: Coordonnées officielles dynamiques */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 border-b border-slate-800 pb-2">
              Coordonnées Officielles
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              {/* Adresse */}
              {info?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {info.address}
                    {info.city && !info.address.includes(info.city) && `, ${info.city}`}
                  </span>
                </li>
              )}

              {/* Téléphones Côte d'Ivoire (affiche tous les numéros saisis et ajoutés) */}
              {ciPhones.length > 0 && (
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">
                      Côte d'Ivoire :
                    </span>
                    {ciPhones.map((ph, idx) => (
                      <a
                        key={idx}
                        href={`tel:${ph.replace(/\s+/g, '')}`}
                        className="hover:text-white transition-colors font-medium text-slate-200"
                      >
                        {ph}
                      </a>
                    ))}
                  </div>
                </li>
              )}

              {/* Téléphone États-Unis (USA) */}
              {info?.phoneUS && (
                <li className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">
                      États-Unis :
                    </span>
                    <a
                      href={`tel:${info.phoneUS.replace(/\s+/g, '')}`}
                      className="hover:text-white transition-colors font-medium text-slate-200"
                    >
                      {info.phoneUS}
                    </a>
                  </div>
                </li>
              )}

              {/* Adresses Email (principale + additionnelles ajoutées par le gestionnaire) */}
              {emails.length > 0 && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">
                      Email :
                    </span>
                    {emails.map((em, idx) => (
                      <a
                        key={idx}
                        href={`mailto:${em}`}
                        className="hover:text-white transition-colors text-slate-200"
                      >
                        {em}
                      </a>
                    ))}
                  </div>
                </li>
              )}

              {/* Horaires d'ouverture */}
              {info?.openingHours && (
                <li className="flex items-start gap-2.5 pt-0.5">
                  <Clock className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span>{info.openingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {info?.name || 'Les Laboratoires T. Wiley'}. Tous droits réservés.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span>Modalités de paiement à discuter lors de la commande</span>
            <span>{info?.city || 'Bouaké'}, {info?.country || "Côte d'Ivoire"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
