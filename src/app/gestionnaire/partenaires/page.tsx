'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users2,
  X,
  ExternalLink,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  Loader2,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import PartnerImageSlideshow from '@/components/PartnerImageSlideshow';
import { Partner } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminPartnersPage() {
  const { showToast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    logo: string;
    images: string[];
    description: string;
    websiteUrl: string;
    isPublished: boolean;
    order: number;
  }>({
    id: '',
    name: '',
    logo: '',
    images: [],
    description: '',
    websiteUrl: '',
    isPublished: true,
    order: 1,
  });

  const loadPartners = () => {
    setLoading(true);
    fetch('/api/partners')
      .then((r) => r.json())
      .then((data) => setPartners(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // Upload multi-photos depuis l'explorateur de fichiers
  const handlePartnerPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingPhotos(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: data,
        });

        const result = await res.json();
        if (res.ok && result.url) {
          newUrls.push(result.url);
        }
      }

      if (newUrls.length > 0) {
        setFormData((prev) => {
          const combined = [...prev.images, ...newUrls];
          return {
            ...prev,
            images: combined,
            logo: prev.logo || combined[0],
          };
        });
        showToast(`${newUrls.length} photo(s) ajoutée(s) avec succès !`, 'success');
      }
    } catch {
      showToast('Erreur lors du téléversement.', 'error');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (idxToRemove: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== idxToRemove);
      return {
        ...prev,
        images: updated,
        logo: updated[0] || '',
      };
    });
  };

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormData({
      id: '',
      name: '',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      images: ['https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80'],
      description: '',
      websiteUrl: '',
      isPublished: true,
      order: partners.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Partner) => {
    setEditingPartner(p);
    const existingImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.logo ? [p.logo] : []);

    setFormData({
      id: p.id,
      name: p.name,
      logo: p.logo || existingImages[0] || '',
      images: existingImages,
      description: p.description,
      websiteUrl: p.websiteUrl || '',
      isPublished: p.isPublished !== false,
      order: p.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      logo: formData.images[0] || formData.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    };

    try {
      if (editingPartner) {
        const res = await fetch('/api/partners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast('Partenaire mis à jour avec succès !', 'success');
          setIsModalOpen(false);
          loadPartners();
        }
      } else {
        const res = await fetch('/api/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast('Nouveau partenaire ajouté !', 'success');
          setIsModalOpen(false);
          loadPartners();
        }
      }
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDelete = async (p: Partner) => {
    if (confirm(`Supprimer le partenaire "${p.name}" ?`)) {
      try {
        const res = await fetch(`/api/partners?id=${p.id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Partenaire supprimé.', 'success');
          loadPartners();
        }
      } catch {
        showToast('Erreur suppression.', 'error');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestion des Partenaires
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gérez les entreprises, fabricants et réseaux partenaires présentés sur la page À propos
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            Nouveau partenaire
          </button>
        </div>

        {/* Grille des partenaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => {
            const partnerImgs = Array.isArray(partner.images) && partner.images.length > 0
              ? partner.images
              : (partner.logo ? [partner.logo] : []);
            return (
              <div
                key={partner.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  {/* Aperçu animé de l'image (slideshow automatique si multiples photos) */}
                  <div className="h-20 w-full rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100 mb-4 relative overflow-hidden">
                    <PartnerImageSlideshow
                      images={partnerImgs}
                      fallbackImage={partner.logo}
                      alt={partner.name}
                    />
                    {partnerImgs.length > 1 && (
                      <span className="absolute bottom-1.5 right-1.5 z-20 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20">
                        {partnerImgs.length} photos animées
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{partner.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{partner.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  {partner.websiteUrl ? (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-600 font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Lien web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Aucun lien web</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(partner)}
                      className="p-1.5 text-slate-500 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL PARFAITEMENT ADAPTÉE AU CADRE (SANS DÉBORDEMENT ET SCROLLABLE) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {/* En-tête fixe de la modal */}
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 flex-shrink-0 bg-white">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Renseignez les détails et ajoutez plusieurs photos animées
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Corps du formulaire scrollable proprement */}
              <form onSubmit={handleSubmit} id="partner-form" className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs scrollbar-thin">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nom du partenaire *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Trans-Logistics Express"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50 focus:bg-white text-xs"
                  />
                </div>

                {/* ZONE MULTI-PHOTOS DU PARTENAIRE (DÉFILEMENT AUTOMATIQUE SUR LE SITE) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">
                        Photos & Logos du Partenaire ({formData.images.length})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Sélectionnez une ou plusieurs photos depuis vos dossiers
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePartnerPhotosUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingPhotos}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      {uploadingPhotos ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Importation...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Ajouter des photos</span>
                        </>
                      )}
                    </button>
                  </div>



                  {/* Liste des photos enregistrées avec bouton de suppression */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            #{idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition-all shadow-xs"
                            title="Supprimer cette photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="partner-published"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <label htmlFor="partner-published" className="font-bold text-slate-800 cursor-pointer">
                    Partenaire actif et visible publiquement
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Description / Activité *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Réseau partenaire assurant l'acheminement..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50 focus:bg-white text-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Site Web (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50 focus:bg-white text-xs"
                  />
                </div>
              </form>

              {/* Pied de page fixe de la modal (Boutons Annuler & Enregistrer toujours visibles) */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="partner-form"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md transition-all hover:scale-102"
                >
                  Enregistrer le partenaire
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
