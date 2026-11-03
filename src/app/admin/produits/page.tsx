'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Check,
  AlertTriangle,
  XCircle,
  Image as ImageIcon,
  X,
  ExternalLink,
  Upload,
  Video,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUploader from '@/components/admin/MediaUploader';
import { Product, Category, AvailabilityStatus } from '@/types';
import { formatPriceFCFA } from '@/lib/whatsapp';
import { useToast } from '@/context/ToastContext';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // État du modal (Ajout / Modification)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    categoryId: '',
    price: 5000,
    originalPrice: 0,
    packaging: '',
    shortDescription: '',
    fullDescription: '',
    mainImage: '',
    images: [] as string[],
    videoUrl: '',
    order: 1,
    availability: 'in_stock' as AvailabilityStatus,
    stockQuantity: 50,
    isPublished: true,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/products?includeUnpublished=true').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        setProducts(prods || []);
        setCategories(cats || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `REF-${Date.now().toString().slice(-4)}`,
      slug: '',
      categoryId: categories[0]?.id || 'cat-cosmetiques',
      price: 5000,
      originalPrice: 0,
      packaging: 'Bidon de 5 Litres',
      shortDescription: '',
      fullDescription: '',
      mainImage:
        'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
      images: [],
      videoUrl: '',
      order: products.length + 1,
      availability: 'in_stock',
      stockQuantity: 50,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      slug: product.slug,
      categoryId: product.categoryId,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      packaging: product.packaging,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      mainImage: product.mainImage,
      images: product.images || [],
      videoUrl: product.videoUrl || '',
      order: product.order || 1,
      availability: product.availability,
      stockQuantity: product.stockQuantity,
      isPublished: product.isPublished,
    });
    setIsModalOpen(true);
  };

  // Upload d'image produit
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData((prev) => ({ ...prev, mainImage: result.url }));
        showToast('Image du produit importée avec succès !', 'success');
      } else {
        showToast(result.error || 'Erreur lors de l’envoi de l’image.', 'error');
      }
    } catch {
      showToast('Erreur lors du téléversement.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // Mise à jour
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          showToast('Produit mis à jour avec succès !', 'success');
          setIsModalOpen(false);
          loadData();
        } else {
          showToast('Erreur lors de la mise à jour.', 'error');
        }
      } else {
        // Création
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          showToast('Nouveau produit ajouté au catalogue !', 'success');
          setIsModalOpen(false);
          loadData();
        } else {
          showToast('Erreur lors de l’ajout du produit.', 'error');
        }
      }
    } catch {
      showToast('Erreur réseau.', 'error');
    }
  };

  // Bascule rapide Publication / Dépublication
  const handleTogglePublish = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      });

      if (res.ok) {
        showToast(
          `Produit ${!product.isPublished ? 'publié' : 'masqué'} avec succès !`,
          'info'
        );
        loadData();
      }
    } catch {
      showToast('Erreur lors de la modification du statut.', 'error');
    }
  };

  // Suppression
  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${product.name}" ?`)) {
      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          showToast('Produit supprimé du catalogue.', 'success');
          loadData();
        }
      } catch {
        showToast('Erreur lors de la suppression.', 'error');
      }
    }
  };

  // Filtrage local
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Titre & Bouton Ajouter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestion des Produits
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ajoutez, modifiez les prix, conditionnements, images et statuts de votre catalogue
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </button>
        </div>

        {/* Barre de filtres et recherche */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou mot-clé..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Toutes les catégories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Produit</th>
                  <th className="p-4">Catégorie</th>
                  <th className="p-4">Prix</th>
                  <th className="p-4">Conditionnement</th>
                  <th className="p-4">Disponibilité</th>
                  <th className="p-4 text-center">Publication</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.mainImage}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block text-sm">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            /{p.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-medium">
                        {p.categoryName}
                      </span>
                    </td>
                    <td className="p-4 font-black text-brand-700 text-sm">
                      {formatPriceFCFA(p.price)}
                    </td>
                    <td className="p-4 font-medium text-slate-600">{p.packaging}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          p.availability === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.availability === 'on_demand'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {p.availability === 'in_stock'
                          ? `En stock (${p.stockQuantity})`
                          : p.availability === 'on_demand'
                          ? 'Sur commande'
                          : 'Rupture'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-[11px] transition-colors ${
                          p.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Cliquer pour changer le statut de visibilité"
                      >
                        {p.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Publié
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Masqué
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/produit/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Voir la fiche publique"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORMULAIRE AJOUT / MODIFICATION AVEC PRÉVISUALISATION D'IMAGE */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Nom, Catégorie & Référence */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Nom commercial du produit *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex : Détergent Sol Surpuissant 5L"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Référence / SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Ex: REF-001"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">Catégorie *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prix, Ancien Prix & Conditionnement */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prix de vente (FCFA) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={100}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-bold text-brand-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ancien prix barré (FCFA)</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={formData.originalPrice || ''}
                      onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                      placeholder="Optionnel"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Conditionnement *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.packaging}
                      onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                      placeholder="Ex : Bidon 5L / Carton 12x1L"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Disponibilité, Statut & Ordre */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Disponibilité</label>
                    <select
                      value={formData.availability}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: e.target.value as AvailabilityStatus,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="in_stock">En stock</option>
                      <option value="on_demand">Sur commande</option>
                      <option value="out_of_stock">Rupture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Statut de publication
                    </label>
                    <select
                      value={formData.isPublished ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublished: e.target.value === 'true' })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
                    >
                      <option value="true">Publié (visible en boutique)</option>
                      <option value="false">Masqué (brouillon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ordre d'affichage</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.order || 1}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* PHOTO PRINCIPALE (EXPLORATEUR DE FICHIERS DIRECT) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <MediaUploader
                    label="Photo principale du produit"
                    type="image"
                    required
                    value={formData.mainImage}
                    onChange={(url) => setFormData((prev) => ({ ...prev, mainImage: url }))}
                    description="Cliquez pour choisir la photo officielle depuis votre ordinateur ou téléphone."
                  />
                </div>

                {/* GALERIE D'IMAGES SECONDAIRES */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 text-xs sm:text-sm">
                      Photos secondaires / Galerie (optionnel)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {formData.images.length} photo(s)
                    </span>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                            title="Supprimer cette image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <MediaUploader
                    label="Ajouter une photo supplémentaire"
                    type="image"
                    value=""
                    onChange={(url) => {
                      if (url) {
                        setFormData((prev) => ({
                          ...prev,
                          images: [...prev.images, url],
                        }));
                      }
                    }}
                    description="Ajoutez des angles de vue ou des détails supplémentaires."
                  />
                </div>

                {/* VIDÉO DE DÉMONSTRATION DU PRODUIT (EXPLORATEUR DE FICHIERS DIRECT) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <MediaUploader
                    label="Vidéo de démonstration ou présentation (optionnel)"
                    type="video"
                    value={formData.videoUrl || ''}
                    onChange={(url) => setFormData((prev) => ({ ...prev, videoUrl: url }))}
                    description="Sélectionnez une vidéo (MP4, WebM) depuis vos fichiers pour illustrer l'utilisation et les résultats."
                  />
                </div>

                {/* Description courte */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Description courte (carte produit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    placeholder="Résumez les bénéfices en 1 ou 2 phrases..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Description complète */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Description détaillée & Conseils d'utilisation *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.fullDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, fullDescription: e.target.value })
                    }
                    placeholder="Détails complets de la formule, dosages conseillés, précautions..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  ></textarea>
                </div>

                {/* Boutons d'action */}
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
                    {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
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

