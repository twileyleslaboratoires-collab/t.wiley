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
  Star,
  Film,
  Layers,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUploader from '@/components/admin/MediaUploader';
import { Product, Category, AvailabilityStatus } from '@/types';
import { formatPriceFCFA } from '@/lib/whatsapp';
import { useToast } from '@/context/ToastContext';
import { compressImage } from '@/lib/image-compress';

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
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const multiFileInputRef = React.useRef<HTMLInputElement>(null);
  const multiVideoInputRef = React.useRef<HTMLInputElement>(null);

  // État du modal de confirmation de suppression
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    characteristics: [] as Array<{ label: string; value: string }>,
    mainImage: '',
    images: [] as string[],
    videoUrl: '',
    videos: [] as string[],
    order: 1,
    availability: 'in_stock' as AvailabilityStatus,
    stockQuantity: 50,
    isPublished: true,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/products?includeUnpublished=true&_t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json()),
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
      characteristics: [
        { label: 'Conditionnement', value: 'Bidon de 5 Litres' },
        { label: 'Usage', value: '' },
      ],
      mainImage:
        'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
      images: [],
      videoUrl: '',
      videos: [],
      order: products.length + 1,
      availability: 'in_stock',
      stockQuantity: 50,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    const existingVideos = Array.isArray(product.videos)
      ? product.videos.filter(Boolean)
      : (product.videoUrl ? [product.videoUrl] : []);

    const existingCharacteristics = Array.isArray(product.characteristics)
      ? product.characteristics
          .filter((c) => c && c.label && c.label !== '__tw_media__')
          .map((c) => ({ label: c.label, value: c.value || '' }))
      : [];

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
      characteristics:
        existingCharacteristics.length > 0
          ? existingCharacteristics
          : [
              { label: 'Conditionnement', value: product.packaging || '' },
              { label: 'Usage', value: '' },
            ],
      mainImage: product.mainImage,
      images: product.images || [],
      videoUrl: existingVideos[0] || product.videoUrl || '',
      videos: existingVideos,
      order: product.order || 1,
      availability: product.availability,
      stockQuantity: product.stockQuantity,
      isPublished: product.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleAddCharacteristic = () => {
    setFormData((prev) => ({
      ...prev,
      characteristics: [...prev.characteristics, { label: '', value: '' }],
    }));
  };

  const handleRemoveCharacteristic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index),
    }));
  };

  const handleCharacteristicChange = (index: number, field: 'label' | 'value', value: string) => {
    setFormData((prev) => {
      const copy = [...prev.characteristics];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, characteristics: copy };
    });
  };

  // Upload d'image produit unique
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
        setFormData((prev) => ({
          ...prev,
          mainImage: result.url,
          images: prev.images.includes(result.url) ? prev.images : [result.url, ...prev.images],
        }));
        showToast('Photo principale mise à jour avec succès !', 'success');
      } else {
        showToast(result.error || 'Erreur lors de l’envoi de l’image.', 'error');
      }
    } catch {
      showToast('Erreur lors du téléversement.', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Upload de plusieurs photos en une seule sélection depuis l'explorateur (avec compression instantanée)
  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    try {
      setUploadingMultiple(true);
      // Compression simultanée en mémoire de toutes les photos pour upload ultra-rapide
      const compressedFiles = await Promise.all(
        Array.from(rawFiles).map((f) => compressImage(f))
      );

      const data = new FormData();
      for (let i = 0; i < compressedFiles.length; i++) {
        data.append('files', compressedFiles[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.urls && result.urls.length > 0) {
        setFormData((prev) => {
          const newImages = [...prev.images];
          for (const u of result.urls) {
            if (!newImages.includes(u)) {
              newImages.push(u);
            }
          }
          return {
            ...prev,
            images: newImages,
            mainImage: prev.mainImage || result.urls[0],
          };
        });
        showToast(`${result.urls.length} photo(s) ajoutée(s) en une seule sélection !`, 'success');
      } else {
        showToast(result.error || "Erreur lors de l'envoi des photos.", 'error');
      }
    } catch {
      showToast("Erreur lors de l'importation multiple.", 'error');
    } finally {
      setUploadingMultiple(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // Upload de plusieurs vidéos en une seule sélection depuis l'explorateur
  const handleMultipleVideosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingVideos(true);
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.urls && result.urls.length > 0) {
        setFormData((prev) => {
          const nextVideos = [...prev.videos, ...result.urls];
          return {
            ...prev,
            videos: nextVideos,
            videoUrl: nextVideos[0] || '',
          };
        });
        showToast(`${result.urls.length} vidéo(s) ajoutée(s) en une seule sélection !`, 'success');
      } else {
        showToast(result.error || "Erreur lors de l'envoi des vidéos.", 'error');
      }
    } catch {
      showToast("Erreur lors de l'importation des vidéos.", 'error');
    } finally {
      setUploadingVideos(false);
      if (multiVideoInputRef.current) multiVideoInputRef.current.value = '';
    }
  };

  const handleMoveVideoUp = (index: number) => {
    if (index <= 0) return;
    setFormData((prev) => {
      const copy = [...prev.videos];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return {
        ...prev,
        videos: copy,
        videoUrl: copy[0] || '',
      };
    });
  };

  const handleMoveVideoDown = (index: number) => {
    setFormData((prev) => {
      if (index >= prev.videos.length - 1) return prev;
      const copy = [...prev.videos];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return {
        ...prev,
        videos: copy,
        videoUrl: copy[0] || '',
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    const cleanCharacteristics = formData.characteristics.filter(
      (c) => c && (c.label.trim() || c.value.trim())
    );
    const payload = {
      ...formData,
      characteristics: cleanCharacteristics,
    };

    try {
      if (editingProduct) {
        // Mise à jour
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(payload),
        });

        const result = await res.json().catch(() => ({}));

        if (res.ok) {
          showToast('Produit mis à jour avec succès !', 'success');
          // Mise à jour locale immédiate de la liste
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? (result.id ? result : { ...p, ...payload }) : p))
          );
          setIsModalOpen(false);
          loadData();
        } else {
          showToast(result.error || 'Erreur lors de la mise à jour.', 'error');
        }
      } else {
        // Création
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(payload),
        });

        let result: any = {};
        try {
          result = await res.json();
        } catch {
          result = { error: `Erreur de communication (${res.status}). Veuillez réessayer.` };
        }

        if (res.ok) {
          showToast('Nouveau produit ajouté au catalogue !', 'success');
          if (result.id) {
            setProducts((prev) => [result, ...prev]);
          }
          setIsModalOpen(false);
          loadData();
        } else {
          showToast(result.error || `Erreur lors de l’ajout du produit (${res.status}).`, 'error');
        }
      }
    } catch {
      showToast('Erreur réseau lors de l’enregistrement.', 'error');
    } finally {
      setIsSaving(false);
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

  // Déclenchement de la suppression (ouvre le modal centré de confirmation)
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  // Confirmation réelle de la suppression dans la base de données
  const confirmDeleteProduct = async () => {
    if (!productToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      if (res.ok) {
        showToast(`"${productToDelete.name}" supprimé définitivement du catalogue.`, 'success');
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id && p.slug !== productToDelete.slug));
        setProductToDelete(null);
        loadData();
      } else {
        const result = await res.json().catch(() => ({}));
        showToast(result.error || 'Erreur lors de la suppression.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de la suppression.', 'error');
    } finally {
      setIsDeleting(false);
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

                {/* GALERIE D'IMAGES AVEC IMPORTATION MULTIPLE EN UNE SEULE SÉLECTION */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-slate-800 text-sm">
                        Photos du produit & Galerie
                      </label>
                      <p className="text-xs text-slate-500">
                        {formData.images.length} photo(s) au total
                      </p>
                    </div>

                    {/* Input caché pour la sélection multiple de fichiers */}
                    <input
                      ref={multiFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImagesUpload}
                      className="hidden"
                    />

                    {/* Bouton d'ajout multiple en un seul clic */}
                    <button
                      type="button"
                      onClick={() => multiFileInputRef.current?.click()}
                      disabled={uploadingMultiple}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all"
                    >
                      {uploadingMultiple ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                      <span>
                        {uploadingMultiple ? 'Importation en cours...' : 'Ajouter plusieurs photos en un clic'}
                      </span>
                    </button>
                  </div>

                  {/* Zone de clic directe pour importation multiple */}
                  <div
                    onClick={() => multiFileInputRef.current?.click()}
                    className="border-2 border-dashed border-brand-300 hover:border-brand-500 bg-white hover:bg-brand-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-1.5">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-800">
                      Cliquez pour choisir plusieurs photos en une seule fois
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Maintenez Ctrl (ou Shift) dans l'explorateur pour sélectionner 2, 5, 10 photos ou plus d'un coup.
                    </p>
                  </div>

                  {/* Grille des photos actuelles avec gestion de la photo principale */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {formData.images.map((imgUrl, idx) => {
                        const isMain = formData.mainImage === imgUrl;
                        return (
                          <div
                            key={idx}
                            className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 group transition-all ${
                              isMain
                                ? 'border-amber-500 ring-2 ring-amber-400/30'
                                : 'border-slate-200 hover:border-brand-400'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Badge photo principale */}
                            {isMain && (
                              <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" />
                                Principale
                              </div>
                            )}

                            {/* Barre d'action au survol */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({ ...prev, mainImage: imgUrl }))
                                  }
                                  className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow-xs transition-colors"
                                  title="Définir comme photo principale"
                                >
                                  <Star className="w-4 h-4 fill-white" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => {
                                    const nextImages = prev.images.filter((_, i) => i !== idx);
                                    return {
                                      ...prev,
                                      images: nextImages,
                                      mainImage:
                                        prev.mainImage === imgUrl
                                          ? nextImages[0] || ''
                                          : prev.mainImage,
                                    };
                                  })
                                }
                                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs transition-colors"
                                title="Supprimer cette photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* GESTION DES VIDÉOS DU PRODUIT AVEC SÉLECTION MULTIPLE EN UN CLIC (LA FORMULE S'APPLIQUE EN ARRIÈRE-PLAN) */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Film className="w-4 h-4 text-brand-600" />
                        Vidéos du produit (1, 2 ou 3 vidéos)
                      </label>
                      <p className="text-xs text-slate-500">
                        {formData.videos.length} vidéo(s) ajoutée(s)
                      </p>
                    </div>

                    {/* Input caché pour la sélection multiple de vidéos */}
                    <input
                      ref={multiVideoInputRef}
                      type="file"
                      multiple
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleMultipleVideosUpload}
                      className="hidden"
                    />

                    {/* Bouton d'ajout multiple de vidéos en un seul clic */}
                    <button
                      type="button"
                      onClick={() => multiVideoInputRef.current?.click()}
                      disabled={uploadingVideos}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all"
                    >
                      {uploadingVideos ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Video className="w-4 h-4" />
                      )}
                      <span>
                        {uploadingVideos ? 'Envoi des vidéos...' : 'Sélectionner plusieurs vidéos en un clic'}
                      </span>
                    </button>
                  </div>

                  {/* Zone de clic directe pour sélection de plusieurs vidéos à la fois */}
                  <div
                    onClick={() => multiVideoInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/30 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-1.5">
                      {uploadingVideos ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                      ) : (
                        <Video className="w-5 h-5" />
                      )}
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-800">
                      {uploadingVideos
                        ? 'Téléversement des vidéos en cours...'
                        : 'Cliquez pour choisir une ou plusieurs vidéos en une seule fois'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Maintenez Ctrl (ou Shift) pour sélectionner 1, 2 ou 3 vidéos d'un coup (formats MP4, WebM, MOV).
                    </p>
                  </div>

                  {/* Liste des vidéos enregistrées avec ordre et suppression */}
                  {formData.videos.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {formData.videos.map((vidUrl, vIdx) => (
                        <div
                          key={vIdx}
                          className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                              #{vIdx + 1}
                            </div>
                            <div className="min-w-0">
                              <span
                                className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-0.5 ${
                                  vIdx === 0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {vIdx === 0
                                  ? 'Vidéo 1'
                                  : `Vidéo ${vIdx + 1}`}
                              </span>
                              <p className="text-xs text-slate-700 font-mono truncate max-w-xs sm:max-w-md">
                                {vidUrl}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            {/* Monter / Descendre l'ordre */}
                            {vIdx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveVideoUp(vIdx)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                                title="Monter cette vidéo"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {vIdx < formData.videos.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveVideoDown(vIdx)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                                title="Descendre cette vidéo"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => {
                                  const nextVids = prev.videos.filter((_, i) => i !== vIdx);
                                  return {
                                    ...prev,
                                    videos: nextVids,
                                    videoUrl: nextVids[0] || '',
                                  };
                                })
                              }
                              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold hover:underline ml-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

                {/* Caractéristiques techniques du produit */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-slate-800 text-sm">
                        Caractéristiques du produit
                      </label>
                      <p className="text-xs text-slate-500">
                        Conditionnement, Usage, etc. affichés sur la fiche produit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCharacteristic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter une ligne
                    </button>
                  </div>

                  {formData.characteristics.length === 0 ? (
                    <div className="text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400">
                        Aucune caractéristique définie. Cliquez sur "+ Ajouter une ligne" pour en ajouter.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.characteristics.map((char, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nom (ex: Conditionnement, Usage...)"
                            value={char.label}
                            onChange={(e) => handleCharacteristicChange(cIdx, 'label', e.target.value)}
                            className="w-1/3 p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs focus:outline-none focus:border-brand-500"
                          />
                          <input
                            type="text"
                            placeholder="Valeur (ex: 400 ML, Sols carrelés, etc.)"
                            value={char.value}
                            onChange={(e) => handleCharacteristicChange(cIdx, 'value', e.target.value)}
                            className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCharacteristic(cIdx)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Supprimer cette ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold shadow-md flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enregistrement en cours...</span>
                      </>
                    ) : (
                      editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMATION DE SUPPRESSION CENTRÉ & ÉLÉGANT */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Supprimer définitivement ce produit ?
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement{' '}
                <strong className="text-slate-800">"{productToDelete.name}"</strong> ?
                Cette action est irréversible et retirera le produit immédiatement de la boutique et de la base de données.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => !isDeleting && setProductToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
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

