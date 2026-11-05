'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers, X, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUploader from '@/components/admin/MediaUploader';
import { Category } from '@/types';
import { useToast } from '@/context/ToastContext';
import { useAdminLanguage } from '@/context/AdminLanguageContext';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const { tAdmin } = useAdminLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    image: '',
    order: 1,
  });

  const loadCategories = () => {
    setLoading(true);
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      slug: '',
      description: '',
      image:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      order: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      order: cat.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      if (editingCategory) {
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast('Catégorie mise à jour !', 'success');
          setIsModalOpen(false);
          loadCategories();
        } else {
          const data = await res.json().catch(() => ({}));
          showToast(data.error || 'Erreur lors de la mise à jour.', 'error');
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          showToast('Nouvelle catégorie créée !', 'success');
          setIsModalOpen(false);
          loadCategories();
        } else {
          const data = await res.json().catch(() => ({}));
          showToast(data.error || 'Erreur lors de la création.', 'error');
        }
      }
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    setCategoryToDelete(cat);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/categories?id=${categoryToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Catégorie "${categoryToDelete.name}" supprimée.`, 'success');
        setCategoryToDelete(null);
        loadCategories();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Erreur lors de la suppression.', 'error');
      }
    } catch {
      showToast('Erreur suppression.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {tAdmin('cat.title', 'Gestion des Catégories')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {tAdmin('cat.subtitle', 'Organisez les familles de produits présentées dans votre boutique')}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            {tAdmin('cat.new_btn', 'Nouvelle catégorie')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/9 w-full bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-700 shadow-2xs">
                    {cat.productCount || 0} produit(s)
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-base text-slate-900 mb-1">{cat.name}</h3>
                  <span className="text-[11px] text-brand-600 font-mono block mb-2">
                    /{cat.slug}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {tAdmin('cat.edit_btn', 'Modifier')}
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {tAdmin('cat.delete_btn', 'Supprimer')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Ajout / Modification Catégorie avec Hauteur adaptative et Défilement fluide */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
              {/* Entête fixe */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {editingCategory ? tAdmin('cat.modal_edit_title', 'Modifier la catégorie') : tAdmin('cat.modal_create_title', 'Nouvelle catégorie')}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corps défilable */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom de la catégorie *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setFormData({
                        ...formData,
                        name,
                        slug: editingCategory ? formData.slug : slug,
                      });
                    }}
                    placeholder="Ex : Lessives & Blanchisserie"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Identifiant URL (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ex: lessives-blanchisserie"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description succincte de cette famille..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  ></textarea>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <MediaUploader
                    label="Image illustrative de la catégorie"
                    type="image"
                    required
                    value={formData.image}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    description="Sélectionnez l'image d'illustration depuis vos dossiers."
                  />
                </div>

                {/* Pied de formulaire toujours visible et accessible */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {tAdmin('cat.cancel', 'Annuler')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{tAdmin('cat.saving', 'Enregistrement...')}</span>
                      </>
                    ) : (
                      editingCategory
                        ? tAdmin('cat.save', 'Enregistrer les modifications')
                        : tAdmin('cat.create', 'Créer la catégorie')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMATION DE SUPPRESSION DE CATÉGORIE CENTRÉ */}
        {categoryToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Supprimer cette catégorie ?
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement la catégorie{' '}
                <strong className="text-slate-800">"{categoryToDelete.name}"</strong> ?
                Cette action retirera la catégorie de la boutique.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => !isDeleting && setCategoryToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCategory}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Suppression...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer définitivement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

