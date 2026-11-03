'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  CheckCircle,
  EyeOff,
  PlusCircle,
  MessageCircle,
  Building,
  Palette,
  ArrowRight,
  ShieldCheck,
  FileText,
  PhoneCall,
  Users2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Product, Category, CompanyInfo, Partner, AboutSection } from '@/types';
import { formatPriceFCFA } from '@/lib/whatsapp';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?includeUnpublished=true').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/partners').then((r) => r.json()),
      fetch('/api/about-sections').then((r) => r.json()),
      fetch('/api/company').then((r) => r.json()),
    ])
      .then(([prods, cats, parts, secs, comp]) => {
        setProducts(Array.isArray(prods) ? prods : []);
        setCategories(Array.isArray(cats) ? cats : []);
        setPartners(Array.isArray(parts) ? parts : []);
        setAboutSections(Array.isArray(secs) ? secs : []);
        setCompanyInfo(comp || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.isPublished).length;
  const unpublishedProducts = totalProducts - publishedProducts;
  const totalCategories = categories.length;
  const totalPartners = partners.length;
  const totalSections = aboutSections.length;

  const averagePrice =
    totalProducts > 0
      ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / totalProducts)
      : 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* En-tête avec bouton nouveau produit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tableau de bord — {companyInfo?.name || 'Les Laboratoires T. Wiley'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Supervision globale du catalogue commercial, des contenus dynamiques et des paramètres
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/gestionnaire/produits"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau produit
            </Link>
          </div>
        </div>

        {/* CARTES DE STATISTIQUES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Produits */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Produits
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalProducts}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">{publishedProducts} publiés en boutique</p>
          </div>

          {/* Catégories */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Catégories
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCategories}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Familles de produits</p>
          </div>

          {/* Sections À Propos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                À Propos
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalSections}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sections personnalisées</p>
          </div>

          {/* Partenaires */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Partenaires
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalPartners}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Partenaires affichés</p>
          </div>
        </div>

        {/* RACCOURCIS DE GESTION RAPIDE (EXIGENCE SECTION 4) */}
        <div>
          <h2 className="text-base font-extrabold text-slate-900 mb-4">
            Raccourcis de Gestion
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/gestionnaire/chat"
              className="p-4 rounded-2xl bg-brand-50/50 border-2 border-brand-200 hover:border-brand-600 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                <MessageCircle className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-900 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                  <span>Chat en Direct</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-brand-700/80 mt-0.5">Échanges en direct avec les clients</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/produits"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                  Gérer les Produits
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Prix, photos, vidéos, stocks</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/categories"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Gérer les Catégories
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Familles et photos de gammes</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/a-propos"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                  Page « À Propos »
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Histoire, mission, blocs libres</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/contacts"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Modifier les Contacts
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Téléphones CI/USA, WhatsApp, emails</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/entreprise"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors">
                  Modifier l'Entreprise
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Logo officiel, bannière podium</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/partenaires"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-violet-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-600 transition-colors">
                  Gérer les Partenaires
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Logos et liens institutionnels</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/apparence"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-pink-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-pink-600 transition-colors">
                  Modifier l'Apparence
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Couleurs et identité visuelle</p>
              </div>
            </Link>

            <Link
              href="/gestionnaire/securite"
              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-800 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-800 transition-colors">
                  Accès & Sécurité
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Email et mot de passe admin</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Aperçu rapide du catalogue */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900">Aperçu rapide des produits</h2>
            <Link
              href="/gestionnaire/produits"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1"
            >
              Gérer tous les produits ({totalProducts}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Produit</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Prix</th>
                  <th className="p-3">Conditionnement</th>
                  <th className="p-3">Disponibilité</th>
                  <th className="p-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.mainImage}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3">{p.categoryName}</td>
                    <td className="p-3 font-semibold text-brand-700">{formatPriceFCFA(p.price)}</td>
                    <td className="p-3">{p.packaging}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.availability === 'in_stock'
                          ? 'En stock'
                          : p.availability === 'on_demand'
                          ? 'Sur commande'
                          : 'Rupture'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.isPublished ? (
                        <span className="text-emerald-600 font-bold">Publié</span>
                      ) : (
                        <span className="text-slate-400 font-bold">Masqué</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
