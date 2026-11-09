'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  PhoneCall,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Share2,
  CheckCircle2,
  Plus,
  Trash2,
  Globe,
} from 'lucide-react';
import { CompanyInfo } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminContactsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<CompanyInfo | null>(null);

  // Charger les données de contact
  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.json())
      .then((data) => {
        setInfo({
          ...data,
          additionalPhones: data.additionalPhones || [],
          additionalEmails: data.additionalEmails || [],
          socialLinks: data.socialLinks || {},
          enableWhatsAppButton: data.enableWhatsAppButton !== undefined ? data.enableWhatsAppButton : true,
        });
      })
      .catch(() => showToast('Erreur de chargement des coordonnées.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  // Enregistrer les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info) return;

    try {
      setSaving(true);
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Toutes les coordonnées ont été enregistrées avec succès !', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('company-info-updated', { detail: data.companyInfo || info }));
        }
      } else {
        showToast('Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Gestion des téléphones additionnels
  const handleAddPhone = () => {
    if (!info) return;
    setInfo({
      ...info,
      additionalPhones: [...(info.additionalPhones || []), ''],
    });
  };

  const handleUpdateAdditionalPhone = (index: number, val: string) => {
    if (!info) return;
    const updated = [...(info.additionalPhones || [])];
    updated[index] = val;
    setInfo({ ...info, additionalPhones: updated });
  };

  const handleRemoveAdditionalPhone = (index: number) => {
    if (!info) return;
    const updated = (info.additionalPhones || []).filter((_, i) => i !== index);
    setInfo({ ...info, additionalPhones: updated });
  };

  // Gestion des emails additionnels
  const handleAddEmail = () => {
    if (!info) return;
    setInfo({
      ...info,
      additionalEmails: [...(info.additionalEmails || []), ''],
    });
  };

  const handleUpdateAdditionalEmail = (index: number, val: string) => {
    if (!info) return;
    const updated = [...(info.additionalEmails || [])];
    updated[index] = val;
    setInfo({ ...info, additionalEmails: updated });
  };

  const handleRemoveAdditionalEmail = (index: number) => {
    if (!info) return;
    const updated = (info.additionalEmails || []).filter((_, i) => i !== index);
    setInfo({ ...info, additionalEmails: updated });
  };

  if (loading || !info) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-xs text-slate-500 font-semibold">
          Chargement des coordonnées...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gestion Complète des Coordonnées & Contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Modifiez directement tous les téléphones, WhatsApp, emails, adresses et réseaux sociaux affichés sur le site
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. WHATSAPP & COMMANDES */}
          <div className="bg-emerald-50/80 rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-emerald-950">
                  Numéro WhatsApp Officiel
                </h2>
                <p className="text-xs text-emerald-700">
                  Ce numéro central reçoit les commandes des fiches produits, du panier et du support.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1.5 uppercase tracking-wider">
                  Numéro WhatsApp (chiffres sans + ni espaces) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-800 font-bold text-xs bg-emerald-200/80 px-3 py-2.5 rounded-xl">
                    +
                  </span>
                  <input
                    type="text"
                    required
                    value={info.whatsappNumber}
                    onChange={(e) => setInfo({ ...info, whatsappNumber: e.target.value })}
                    placeholder="2250767626468"
                    className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white text-xs font-mono font-bold text-emerald-950 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center sm:pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-emerald-950">
                  <input
                    type="checkbox"
                    checked={info.enableWhatsAppButton}
                    onChange={(e) => setInfo({ ...info, enableWhatsAppButton: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Activer le bouton flottant WhatsApp sur le site</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. LIGNES TÉLÉPHONIQUES */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-brand-600" />
                Lignes Téléphoniques Officielles
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone CI n°1 *</label>
                <input
                  type="text"
                  required
                  value={info.phone1}
                  onChange={(e) => setInfo({ ...info, phone1: e.target.value })}
                  placeholder="07 67 62 64 68"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone CI n°2 *</label>
                <input
                  type="text"
                  required
                  value={info.phone2}
                  onChange={(e) => setInfo({ ...info, phone2: e.target.value })}
                  placeholder="01 40 98 64 64"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone CI n°3 (Fixe) *</label>
                <input
                  type="text"
                  required
                  value={info.phone3}
                  onChange={(e) => setInfo({ ...info, phone3: e.target.value })}
                  placeholder="27 31 62 41 83"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone États-Unis (USA) *</label>
                <input
                  type="text"
                  required
                  value={info.phoneUS}
                  onChange={(e) => setInfo({ ...info, phoneUS: e.target.value })}
                  placeholder="+1 704 287 2551"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Numéros supplémentaires */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Numéros additionnels (facultatif)
                </span>
                <button
                  type="button"
                  onClick={handleAddPhone}
                  className="inline-flex items-center gap-1 text-xs text-brand-600 font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter un autre numéro
                </button>
              </div>

              {info.additionalPhones && info.additionalPhones.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {info.additionalPhones.map((ph, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={ph}
                        onChange={(e) => handleUpdateAdditionalPhone(idx, e.target.value)}
                        placeholder="Autre numéro..."
                        className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalPhone(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">Aucun numéro additionnel configuré.</p>
              )}
            </div>
          </div>

          {/* 3. ADRESSE GÉOGRAPHIQUE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin className="w-5 h-5 text-brand-600" />
              Localisation & Adresse
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Adresse complète affichée *
                </label>
                <input
                  type="text"
                  required
                  value={info.address}
                  onChange={(e) => setInfo({ ...info, address: e.target.value })}
                  placeholder="France 1, Feu Pacha, Bouaké, Côte d'Ivoire"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={info.city}
                  onChange={(e) => setInfo({ ...info, city: e.target.value })}
                  placeholder="Bouaké"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pays</label>
                <input
                  type="text"
                  value={info.country}
                  onChange={(e) => setInfo({ ...info, country: e.target.value })}
                  placeholder="Côte d'Ivoire"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quartier / Repère</label>
                <input
                  type="text"
                  value={info.district || ''}
                  onChange={(e) => setInfo({ ...info, district: e.target.value })}
                  placeholder="France 1, Carrefour Pacha"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Horaires d'ouverture</label>
                <input
                  type="text"
                  value={info.openingHours}
                  onChange={(e) => setInfo({ ...info, openingHours: e.target.value })}
                  placeholder="Du Lundi au Samedi : 08h00 - 18h00"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 4. ADRESSES EMAIL */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Mail className="w-5 h-5 text-brand-600" />
              Courriers Électroniques (Email)
            </h2>

            <div className="text-xs space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Principal de contact
                </label>
                <input
                  type="email"
                  value={info.email || ''}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  placeholder="contact@laboratoires-twiley.ci"
                  className="w-full sm:w-1/2 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Si le champ est laissé vide, aucune adresse email fictive n'apparaîtra publiquement.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Emails additionnels
                  </span>
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="inline-flex items-center gap-1 text-xs text-brand-600 font-bold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un email
                  </button>
                </div>
                {info.additionalEmails && info.additionalEmails.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {info.additionalEmails.map((em, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="email"
                          value={em}
                          onChange={(e) => handleUpdateAdditionalEmail(idx, e.target.value)}
                          placeholder="direction@... ou support@..."
                          className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalEmail(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. RÉSEAUX SOCIAUX */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Share2 className="w-5 h-5 text-brand-600" />
              Liens des Réseaux Sociaux
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Page Facebook</label>
                <input
                  type="text"
                  value={info.socialLinks?.facebook || ''}
                  onChange={(e) =>
                    setInfo({
                      ...info,
                      socialLinks: { ...info.socialLinks, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Compte Instagram</label>
                <input
                  type="text"
                  value={info.socialLinks?.instagram || ''}
                  onChange={(e) =>
                    setInfo({
                      ...info,
                      socialLinks: { ...info.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Compte TikTok</label>
                <input
                  type="text"
                  value={info.socialLinks?.tiktok || ''}
                  onChange={(e) =>
                    setInfo({
                      ...info,
                      socialLinks: { ...info.socialLinks, tiktok: e.target.value },
                    })
                  }
                  placeholder="https://tiktok.com/@..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Page LinkedIn</label>
                <input
                  type="text"
                  value={info.socialLinks?.linkedin || ''}
                  onChange={(e) =>
                    setInfo({
                      ...info,
                      socialLinks: { ...info.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/company/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chaîne YouTube</label>
                <input
                  type="text"
                  value={info.socialLinks?.youtube || ''}
                  onChange={(e) =>
                    setInfo({
                      ...info,
                      socialLinks: { ...info.socialLinks, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/@..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Compte Twitter / X</label>
                <input
                  type="text"
                  value={info.socialLinks?.twitter || ''}
                  onChange={(e) =>
                    setInfo({
                      ...info,
                      socialLinks: { ...info.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* BOUTON ENREGISTRER */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              {saving ? 'Enregistrement en cours...' : 'Enregistrer toutes les coordonnées'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

