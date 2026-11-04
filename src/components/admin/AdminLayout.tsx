'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Building,
  Palette,
  Users2,
  KeyRound,
  LogOut,
  ExternalLink,
  FileText,
  PhoneCall,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  const fetchUnreadChatCount = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/unread-count?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUnreadChatCount(Number(data.unreadCount || 0));
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/gestionnaire/login');
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        router.push('/gestionnaire/login');
      })
      .finally(() => {
        setChecking(false);
      });
  }, [router]);

  useEffect(() => {
    if (!authenticated) return;
    fetchUnreadChatCount();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchUnreadChatCount();
      }
    }, 5000);

    const handleChatRead = () => {
      fetchUnreadChatCount();
    };

    window.addEventListener('twiley_chat_read', handleChatRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener('twiley_chat_read', handleChatRead);
    };
  }, [authenticated, fetchUnreadChatCount]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('Vous avez été déconnecté.', 'info');
      router.push('/gestionnaire/login');
      router.refresh();
    } catch {
      router.push('/gestionnaire/login');
    }
  };

  const navItems = [
    { label: 'Tableau de bord', href: '/gestionnaire', icon: LayoutDashboard },
    { label: 'Chat en Direct', href: '/gestionnaire/chat', icon: MessageSquare },
    { label: 'Gestion des Produits', href: '/gestionnaire/produits', icon: Package },
    { label: 'Catégories', href: '/gestionnaire/categories', icon: Layers },
    { label: 'Page « À Propos »', href: '/gestionnaire/a-propos', icon: FileText },
    { label: 'Coordonnées & Contacts', href: '/gestionnaire/contacts', icon: PhoneCall },
    { label: 'Identité Entreprise', href: '/gestionnaire/entreprise', icon: Building },
    { label: 'Partenaires', href: '/gestionnaire/partenaires', icon: Users2 },
    { label: 'Apparence & Couleurs', href: '/gestionnaire/apparence', icon: Palette },
    { label: 'Accès & Sécurité', href: '/gestionnaire/securite', icon: KeyRound },
  ];

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Vérification de la session administrateur...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Barre supérieure mobile avec bouton menu */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-auto max-w-[70px] bg-white/10 rounded-lg p-1 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-laboratoires-t-wiley.jpg"
              alt="Logo"
              className="max-h-6 w-auto object-contain rounded"
            />
          </div>
          <div>
            <span className="font-black text-xs block leading-tight text-white">
              T. WILEY LABS
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">
              Gestionnaire
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 relative"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-xs">
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar de navigation admin (affichée sur desktop ou si le menu mobile est ouvert) */}
      <aside
        className={`w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between ${
          mobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Logo & Titre admin (desktop) */}
          <div className="p-6 border-b border-slate-800 hidden md:block">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-auto max-w-[80px] bg-white/10 rounded-lg p-1 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-laboratoires-t-wiley.jpg"
                  alt="Les Laboratoires T. Wiley"
                  className="max-h-7 w-auto object-contain rounded"
                />
              </div>
              <div>
                <span className="font-black text-white text-xs tracking-tight block leading-tight">
                  T. WILEY LABS
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Gestionnaire
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Espace de gestion privée</p>
          </div>

          {/* Liens de gestion */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const active =
                item.href === '/gestionnaire'
                  ? pathname === '/gestionnaire' || pathname === '/admin'
                  : pathname.startsWith(item.href) || pathname.startsWith(item.href.replace('/gestionnaire', '/admin'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.href === '/gestionnaire/chat' && unreadChatCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pied de sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Voir la boutique publique
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal de l'administration */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
