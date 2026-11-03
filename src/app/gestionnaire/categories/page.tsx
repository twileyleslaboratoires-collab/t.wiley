'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers, X, Image as ImageIcon, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUploader from '@/components/admin/MediaUploader';
import { Category } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    image: '',
    order: 1,
  });

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        showToast('Image de catégorie importée !', 'success');
      } else {
        showToast(result.error || 'Erreur lors de l’envoi de l’image.', 'error');
      }
    } catch {
      showToast('Erreur lors du téléversement.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

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

    try {
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
        }
      }
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (confirm(`Voulez-vous vraiment supprimer la catégorie "${cat.name}" ?`)) {
      try {
        const res = await fetch(`/api/categories?id=${cat.id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Catégorie supprimée.', 'success');
          loadCategories();
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
              Gestion des Catégories
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Organisez les familles de produits présentées dans votre boutique
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvelle catégorie
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
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono"
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

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

