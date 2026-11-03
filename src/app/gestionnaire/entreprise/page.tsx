'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Building, MessageCircle, Save, Phone, Mail, MapPin, Clock, Globe, Image as ImageIcon, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUploader from '@/components/admin/MediaUploader';
import { CompanyInfo } from '@/types';
import { useToast } from '@/context/ToastContext';
import { sanitizeWhatsAppNumber } from '@/lib/whatsapp';

export default function AdminCompanyPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<CompanyInfo | null>(null);

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (field: 'logo' | 'banner', file: File) => {
    try {
      setUploadingField(field);
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        setInfo((prev) => (prev ? { ...prev, [field]: result.url } : null));
        showToast(field === 'logo' ? 'Logo importé !' : 'Bannière importée !', 'success');
      } else {
        showToast(result.error || 'Erreur lors du téléversement.', 'error');
      }
    } catch {
      showToast('Erreur de téléversement.', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  useEffect(() => {
    fetch('/api/company')
      .then((r) => r.json())
      .then((data) => setInfo(data))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoChange = async (url: string) => {
    setInfo((prev) => (prev ? { ...prev, logo: url } : null));
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: url }),
      });
      if (res.ok) {
        showToast('Nouveau logo officiel enregistré et appliqué !', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBannerChange = async (url: string) => {
    setInfo((prev) => (prev ? { ...prev, banner: url } : null));
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banner: url }),
      });
      if (res.ok) {
        showToast('Nouvelle bannière enregistrée et appliquée à la boutique !', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info) return;

    setSaving(true);
    try {
      // Nettoyage WhatsApp avant envoi
      const cleanInfo = {
        ...info,
        whatsappNumber: sanitizeWhatsAppNumber(info.whatsappNumber),
      };

      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanInfo),
      });

      if (res.ok) {
        const data = await res.json();
        setInfo(data.companyInfo);
        showToast('Informations et coordonnées enregistrées avec succès !', 'success');
      } else {
        showToast('Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur réseau.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !info) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-slate-500">Chargement des paramètres...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Informations de l'Entreprise & Coordonnées
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez l'identité officielle, le logo, les téléphones, l'adresse à Bouaké et le numéro WhatsApp central des commandes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CONFIGURATION WHATSAPP OFFICIELLE */}
          <div className="bg-emerald-50/80 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-emerald-950">
                  Numéro WhatsApp Officiel des Commandes
                </h2>
                <p className="text-xs text-emerald-700">
                  Tous les boutons de commande du site (header, fiches produits, panier, contact) envoient automatiquement vers ce numéro.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wider">
                Numéro au format international (sans +, sans espaces) *
              </label>
              <div className="flex items-center gap-3 max-w-md">
                <span className="text-emerald-800 font-bold text-sm bg-emerald-200/80 px-3 py-2.5 rounded-xl">
                  +
                </span>
                <input
                  type="text"
                  required
                  value={info.whatsappNumber}
                  onChange={(e) =>
                    setInfo({
                      ...info,
                      whatsappNumber: sanitizeWhatsAppNumber(e.target.value),
                    })
                  }
                  placeholder="2250767626468"
                  className="w-full text-base font-mono font-bold p-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
              <p className="text-[11px] text-emerald-700 mt-2">
                Exemple Côte d'Ivoire pour le 07 67 62 64 68 : <code className="font-mono font-bold">2250767626468</code>.
              </p>
            </div>
          </div>

          {/* IDENTITÉ COMMERCIALE & LOGO */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-600" />
              Identité & Logo Officiel
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de l'entreprise *</label>
                <input
                  type="text"
                  required
                  value={info.name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activités officielles *</label>
                <input
                  type="text"
                  required
                  value={info.activities}
                  onChange={(e) => setInfo({ ...info, activities: e.target.value })}
                  placeholder="Cosmétiques — Détergences hospitalières — Domestique — Mécanique"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            {/* LOGO OFFICIEL (EXPLORATEUR DIRECT) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <MediaUploader
                label="Logo officiel de l'entreprise"
                type="image"
                required
                value={info.logo}
                onChange={handleLogoChange}
                description="Logo officiel affiché dans le header, footer et sur mobile. Cliquez pour choisir depuis vos fichiers."
              />
            </div>

            {/* BANNIÈRE BOUTIQUE (EXPLORATEUR DIRECT) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <MediaUploader
                label="Image de fond de la bannière Boutique"
                type="image"
                value={info.banner || ''}
                onChange={handleBannerChange}
                description="Image de fond pour la section principale de la boutique. Cliquez pour choisir depuis vos fichiers."
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">
                Description de présentation
              </label>
              <textarea
                rows={3}
                value={info.description}
                onChange={(e) => setInfo({ ...info, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>
          </div>

          {/* TÉLÉPHONES & LOCALISATION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-600" />
              Téléphones & Localisation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone 1 (Côte d'Ivoire) *</label>
                <input
                  type="text"
                  required
                  value={info.phone1 || ''}
                  onChange={(e) => setInfo({ ...info, phone1: e.target.value, phone: e.target.value })}
                  placeholder="07 67 62 64 68"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone 2 (Côte d'Ivoire) *</label>
                <input
                  type="text"
                  required
                  value={info.phone2 || ''}
                  onChange={(e) => setInfo({ ...info, phone2: e.target.value })}
                  placeholder="01 40 98 64 64"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone 3 (Côte d'Ivoire) *</label>
                <input
                  type="text"
                  required
                  value={info.phone3 || ''}
                  onChange={(e) => setInfo({ ...info, phone3: e.target.value })}
                  placeholder="27 31 62 41 83"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone international (États-Unis) *</label>
                <input
                  type="text"
                  required
                  value={info.phoneUS || ''}
                  onChange={(e) => setInfo({ ...info, phoneUS: e.target.value })}
                  placeholder="+1 704 287 2551"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email officiel (à renseigner par le propriétaire)
                </label>
                <input
                  type="email"
                  value={info.email || ''}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  placeholder="contact@laboratoires-twiley.ci (optionnel pour l'instant)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-100">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Adresse complète *</label>
                <input
                  type="text"
                  required
                  value={info.address}
                  onChange={(e) => setInfo({ ...info, address: e.target.value })}
                  placeholder="France 1, Feu Pacha, Bouaké, Côte d'Ivoire"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={info.city || 'Bouaké'}
                  onChange={(e) => setInfo({ ...info, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Horaires d'ouverture *</label>
              <input
                type="text"
                required
                value={info.openingHours}
                onChange={(e) => setInfo({ ...info, openingHours: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* HISTOIRE, MISSION, VISION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-600" />
              Contenus Institutionnels (Page À Propos)
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Histoire de l'entreprise</label>
                <textarea
                  rows={2}
                  value={info.history}
                  onChange={(e) => setInfo({ ...info, history: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mission</label>
                <textarea
                  rows={2}
                  value={info.mission}
                  onChange={(e) => setInfo({ ...info, mission: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vision</label>
                <textarea
                  rows={2}
                  value={info.vision}
                  onChange={(e) => setInfo({ ...info, vision: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement en cours...' : 'Enregistrer toutes les modifications'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
