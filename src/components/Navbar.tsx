'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, MessageCircle, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { sanitizeWhatsAppNumber } from '@/lib/whatsapp';
import { CompanyInfo } from '@/types';

interface NavbarProps {
  initialCompanyInfo?: CompanyInfo;
}

export default function Navbar({ initialCompanyInfo }: NavbarProps) {
  const pathname = usePathname();
  const { totalCount, isInitialized } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | undefined>(initialCompanyInfo);

  useEffect(() => {
    if (!companyInfo) {
      fetch('/api/company')
        .then((res) => res.json())
        .then((data) => setCompanyInfo(data))
        .catch((err) => console.error('Erreur chargement info entreprise:', err));
    }
  }, [companyInfo]);

  // Interception du bouton retour du téléphone pour fermer le menu mobile sans quitter le site
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mobileMenuOpen) return;

    try {
      window.history.pushState({ ...window.history.state, navDrawerOpen: true }, '');
    } catch {
      // Ignorer
    }

    const handlePopState = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      if (typeof window !== 'undefined' && window.history.state?.navDrawerOpen) {
        window.history.back();
      }
    } else {
      setMobileMenuOpen(true);
    }
  };

  const navLinks = [
    { label: 'BOUTIQUE', href: '/' },
    { label: 'CATÉGORIES', href: '/categories' },
    { label: 'PANIER', href: '/panier' },
    { label: 'CONTACT', href: '/contact' },
    { label: 'À PROPOS', href: '/a-propos' },
  ];

  const whatsappCleanNumber = sanitizeWhatsAppNumber(companyInfo?.whatsappNumber || '2250767626468');
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappCleanNumber}`;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Masquer complètement la barre de navigation publique (et le panier) sur l'espace gestionnaire / admin
  if (pathname.startsWith('/gestionnaire') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Company Name (Extreme Left) */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="h-12 w-auto max-w-[130px] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={companyInfo?.logo || '/logo-laboratoires-t-wiley.jpg'}
                alt={companyInfo?.name || 'Les Laboratoires T. Wiley'}
                className="max-h-12 w-auto object-contain rounded-md group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight leading-none group-hover:text-brand-600 transition-colors">
                {companyInfo?.name || 'Les Laboratoires T. Wiley'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wide uppercase mt-1 line-clamp-1">
                {companyInfo?.activities || 'Cosmétiques & Détergences'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Strictly: BOUTIQUE | CATÉGORIES | PANIER | CONTACT | À PROPOS */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all ${active
                      ? 'text-brand-700 bg-brand-50 shadow-xs'
                      : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: WhatsApp Icon & Cart Counter */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct WhatsApp button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow"
              title="Commander ou discuter sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Cart Icon with Dynamic Counter */}
            <Link
              href="/panier"
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-800 hover:text-brand-700 transition-all border border-slate-200/60"
              title="Consulter le panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {isInitialized && totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-fade-in">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-all flex items-center justify-between ${active
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <span>{link.label}</span>
                  {link.label === 'PANIER' && totalCount > 0 && (
                    <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {totalCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              Contacter sur WhatsApp (+{whatsappCleanNumber})
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
