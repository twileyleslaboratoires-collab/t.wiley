'use client';

import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUploader from '@/components/admin/MediaUploader';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Upload,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  History,
  Target,
  Sparkles,
  Building2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { AboutSection, CompanyInfo } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminAboutPage() {
  const { showToast } = useToast();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBase, setSavingBase] = useState(false);

  // Modal / Formulaire d'édition de section personnalisée
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    badge: 'Notre Expertise',
    description: '',
    content: '',
    image: '',
    videoUrl: '',
    order: 1,
    isPublished: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les sections et les infos de l'entreprise
  const loadData = async () => {
    try {
      setLoading(true);
      const [secRes, compRes] = await Promise.all([
        fetch('/api/about-sections'),
        fetch('/api/company'),
      ]);
      const secData = await secRes.json();
      const compData = await compRes.json();
      setSections(Array.isArray(secData) ? secData : []);
      setCompanyInfo(compData);
    } catch {
      showToast('Erreur lors du chargement des données.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sauvegarder les sections de base (Histoire, Mission, Vision)
  const handleSaveBaseSections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo) return;

    try {
      setSavingBase(true);
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: companyInfo.history,
          mission: companyInfo.mission,
          vision: companyInfo.vision,
          aboutHeroImage: companyInfo.aboutHeroImage,
        }),
      });

      if (res.ok) {
        showToast('Histoire, Mission & Vision mises à jour avec succès !', 'success');
      } else {
        showToast('Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setSavingBase(false);
    }
  };

  // Image d'arrière-plan de la première section (Bannière Hero À Propos)
  const handleHeroImageChange = async (url: string) => {
    if (!companyInfo) return;
    setCompanyInfo({ ...companyInfo, aboutHeroImage: url });
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutHeroImage: url }),
      });
      if (res.ok) {
        showToast('Image d’arrière-plan mise à jour avec succès !', 'success');
      } else {
        showToast('Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    }
  };

  // 1. Domaines d'Activité (Image 1)
  const [savingDomains, setSavingDomains] = useState(false);
  const handleDomainActivityChange = (index: number, field: 'title' | 'description', value: string) => {
    if (!companyInfo) return;
    const list = [...(companyInfo.domainActivities || [])];
    list[index] = { ...list[index], [field]: value };
    setCompanyInfo({ ...companyInfo, domainActivities: list });
  };

  const handleAddDomainActivity = () => {
    if (!companyInfo) return;
    const list = [...(companyInfo.domainActivities || [])];
    list.push({ title: 'Nouveau domaine d’activité', description: 'Description des solutions et applications adaptées...' });
    setCompanyInfo({ ...companyInfo, domainActivities: list });
  };

  const handleRemoveDomainActivity = (index: number) => {
    if (!companyInfo) return;
    const list = companyInfo.domainActivities.filter((_, idx) => idx !== index);
    setCompanyInfo({ ...companyInfo, domainActivities: list });
  };

  const handleSaveDomainActivities = async () => {
    if (!companyInfo) return;
    try {
      setSavingDomains(true);
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainActivities: companyInfo.domainActivities }),
      });
      if (res.ok) {
        showToast('Nos Domaines d’Activité mis à jour avec succès !', 'success');
      } else {
        showToast('Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setSavingDomains(false);
    }
  };

  // 2. Engagements Qualité (Image 2)
  const [savingCommitments, setSavingCommitments] = useState(false);
  const handleCommitmentChange = (index: number, field: 'title' | 'description', value: string) => {
    if (!companyInfo) return;
    const list = [...(companyInfo.commitments || [])];
    list[index] = { ...list[index], [field]: value };
    setCompanyInfo({ ...companyInfo, commitments: list });
  };

  const handleAddCommitment = () => {
    if (!companyInfo) return;
    const list = [...(companyInfo.commitments || [])];
    list.push({ title: 'Nouvel engagement qualité', description: 'Description de la garantie et rigueur de service...' });
    setCompanyInfo({ ...companyInfo, commitments: list });
  };

  const handleRemoveCommitment = (index: number) => {
    if (!companyInfo) return;
    const list = companyInfo.commitments.filter((_, idx) => idx !== index);
    setCompanyInfo({ ...companyInfo, commitments: list });
  };

  const handleSaveCommitments = async () => {
    if (!companyInfo) return;
    try {
      setSavingCommitments(true);
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitments: companyInfo.commitments }),
      });
      if (res.ok) {
        showToast('Nos Engagements Qualité mis à jour avec succès !', 'success');
      } else {
        showToast('Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setSavingCommitments(false);
    }
  };

  // 3. Notre Clientèle (Image 3)
  const [savingClients, setSavingClients] = useState(false);
  const handleClientSegmentChange = (index: number, field: 'title' | 'description', value: string) => {
    if (!companyInfo) return;
    const list = [...(companyInfo.clientSegments || [])];
    list[index] = { ...list[index], [field]: value };
    setCompanyInfo({ ...companyInfo, clientSegments: list });
  };

  const handleAddClientSegment = () => {
    if (!companyInfo) return;
    const list = [...(companyInfo.clientSegments || [])];
    list.push({ title: 'Nouveau secteur de clientèle', description: 'Description de l’offre pour ce secteur...' });
    setCompanyInfo({ ...companyInfo, clientSegments: list });
  };

  const handleRemoveClientSegment = (index: number) => {
    if (!companyInfo) return;
    const list = companyInfo.clientSegments.filter((_, idx) => idx !== index);
    setCompanyInfo({ ...companyInfo, clientSegments: list });
  };

  const handleSaveClientSegments = async () => {
    if (!companyInfo) return;
    try {
      setSavingClients(true);
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientSegments: companyInfo.clientSegments }),
      });
      if (res.ok) {
        showToast('Notre Clientèle mise à jour avec succès !', 'success');
      } else {
        showToast('Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setSavingClients(false);
    }
  };

  // Ouvrir modal d'ajout
  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      title: '',
      badge: 'Notre Expertise',
      description: '',
      content: '',
      image: '',
      videoUrl: '',
      order: sections.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  // Ouvrir modal d'édition
  const handleOpenEdit = (sec: AboutSection) => {
    setEditingSection(sec);
    setFormData({
      title: sec.title,
      badge: sec.badge || 'Section',
      description: sec.description,
      content: sec.content || '',
      image: sec.image || '',
      videoUrl: sec.videoUrl || '',
      order: sec.order,
      isPublished: sec.isPublished,
    });
    setIsModalOpen(true);
  };

  // Upload d'image depuis téléphone ou PC
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        showToast('Image importée avec succès !', 'success');
      } else {
        showToast(result.error || 'Erreur lors de l’envoi de l’image.', 'error');
      }
    } catch {
      showToast('Erreur de téléversement.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Soumission formulaire section personnalisée
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Veuillez renseigner au moins le titre et la description.', 'info');
      return;
    }

    try {
      if (editingSection) {
        // Mise à jour
        const res = await fetch('/api/about-sections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingSection.id,
            ...formData,
          }),
        });

        if (res.ok) {
          showToast('Section mise à jour !', 'success');
          setIsModalOpen(false);
          loadData();
        } else {
          showToast('Erreur lors de la modification.', 'error');
        }
      } else {
        // Création
        const res = await fetch('/api/about-sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          showToast('Nouvelle section ajoutée avec succès !', 'success');
          setIsModalOpen(false);
          loadData();
        } else {
          showToast('Erreur lors de la création.', 'error');
        }
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    }
  };

  // Supprimer une section
  const handleDeleteSection = async (id: string, title: string) => {
    if (!confirm(`Confirmez-vous la suppression de la section "${title}" ?`)) return;

    try {
      const res = await fetch(`/api/about-sections?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Section supprimée.', 'info');
        loadData();
      } else {
        showToast('Erreur lors de la suppression.', 'error');
      }
    } catch {
      showToast('Erreur de connexion.', 'error');
    }
  };

  // Basculer publication (publier / masquer)
  const handleTogglePublish = async (sec: AboutSection) => {
    try {
      const res = await fetch('/api/about-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sec.id,
          isPublished: !sec.isPublished,
        }),
      });

      if (res.ok) {
        showToast(
          !sec.isPublished
            ? 'Section publiée sur la page À propos !'
            : 'Section masquée du site public.',
          'info'
        );
        loadData();
      }
    } catch {
      showToast('Erreur de mise à jour.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestion de la Page « À Propos »
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Personnalisez les sections institutionnelles, ajoutez vos propres blocs de présentation avec photos et vidéos
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Section
          </button>
        </div>

        {/* 1. SECTIONS PERSONNALISÉES AJOUTÉES PAR LE PROPRIÉTAIRE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                Sections Personnalisées & Spécifiques ({sections.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ces sections s'affichent directement sur la page publique dans l'ordre défini ci-dessous.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Chargement des sections...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl p-6">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Aucune section personnalisée pour le moment</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Cliquez sur « Ajouter une Section » pour créer un nouveau bloc (Expertise, Certifications, Équipe, etc.)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    sec.isPublished
                      ? 'bg-white border-slate-200/90 shadow-2xs hover:border-brand-300'
                      : 'bg-slate-50/80 border-dashed border-slate-300 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Miniature Image ou Icône */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {sec.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sec.image} alt={sec.title} className="w-full h-full object-cover" />
                      ) : sec.videoUrl ? (
                        <Video className="w-6 h-6 text-brand-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                          {sec.badge || 'Section'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Ordre : #{sec.order}
                        </span>
                        {!sec.isPublished && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            Masqué
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">{sec.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{sec.description}</p>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleTogglePublish(sec)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors ${
                        sec.isPublished
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={sec.isPublished ? 'Masquer la section' : 'Publier la section'}
                    >
                      {sec.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{sec.isPublished ? 'Visible' : 'Masqué'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(sec)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-brand-300 text-slate-600 hover:text-brand-700 hover:bg-brand-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Modifier la section"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Modifier</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSection(sec.id, sec.title)}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Supprimer la section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* IMAGE D'ARRIÈRE-PLAN DE LA PREMIÈRE SECTION (HERO BANNER) */}
        {companyInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-600" />
                Image d'Arrière-Plan de la Première Section (Bannière d'introduction)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cette image s'affiche en grand en arrière-plan sous le logo et la présentation principale de la page « À Propos ».
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Aperçu actuel de l'image de fond</label>
                <div className="w-full aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center relative group">
                  {companyInfo.aboutHeroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={companyInfo.aboutHeroImage}
                      alt="Arrière-plan À Propos"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">Aucune image sélectionnée</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <MediaUploader
                  label="Téléverser / Changer l'image de fond"
                  value={companyInfo.aboutHeroImage || '/uploads/a-propos-hero-bg.jpg'}
                  onChange={handleHeroImageChange}
                  description="Format JPG, PNG ou WebP. Dimensions recommandées : 1920x1080px ou similaire."
                />

                {companyInfo.aboutHeroImage !== '/uploads/a-propos-hero-bg.jpg' && (
                  <button
                    type="button"
                    onClick={() => handleHeroImageChange('/uploads/a-propos-hero-bg.jpg')}
                    className="text-xs text-brand-600 hover:text-brand-700 font-bold underline underline-offset-2 flex items-center gap-1.5"
                  >
                    Rétablir l'image des produits sur podiums
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SECTIONS FONDAMENTALES (HISTOIRE, MISSION, VISION) */}
        {companyInfo && (
          <form
            onSubmit={handleSaveBaseSections}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-brand-600" />
                Histoire, Mission & Vision Fondamentales
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ces 3 piliers s'affichent sous la bannière d'introduction de la page À Propos.
              </p>
            </div>

            <div className="space-y-4">
              {/* Histoire */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notre Histoire & Origine
                </label>
                <textarea
                  rows={3}
                  value={companyInfo.history}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, history: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  placeholder="Racontez la création des Laboratoires T. Wiley, votre implantation à Bouaké..."
                />
              </div>

              {/* Mission */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notre Mission
                </label>
                <textarea
                  rows={3}
                  value={companyInfo.mission}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, mission: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  placeholder="Votre mission auprès des hôpitaux, entreprises et ménages..."
                />
              </div>

              {/* Vision */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notre Vision & Ambition
                </label>
                <textarea
                  rows={3}
                  value={companyInfo.vision}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, vision: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  placeholder="Votre vision à moyen et long terme en Côte d'Ivoire et dans la sous-région..."
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingBase}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {savingBase ? 'Sauvegarde en cours...' : 'Enregistrer Histoire, Mission & Vision'}
              </button>
            </div>
          </form>
        )}

        {/* 3. NOS DOMAINES D'ACTIVITÉ */}
        {companyInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-600" />
                  Nos Domaines d'Activité ({companyInfo.domainActivities?.length || 0})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cartes numérotées (01, 02...) affichées sur la page « À Propos ». Vous pouvez les modifier, en ajouter ou les laisser par défaut.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddDomainActivity}
                className="inline-flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Domaine
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(companyInfo.domainActivities || []).map((dom, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-brand-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                        0{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDomainActivity(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Supprimer ce domaine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Titre du domaine</label>
                      <input
                        type="text"
                        value={dom.title}
                        onChange={(e) => handleDomainActivityChange(idx, 'title', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                        placeholder="Ex: Produits d'entretien..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Description & Applications</label>
                      <textarea
                        rows={3}
                        value={dom.description}
                        onChange={(e) => handleDomainActivityChange(idx, 'description', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-brand-500"
                        placeholder="Formulations pour le lavage, la protection..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveDomainActivities}
                disabled={savingDomains}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {savingDomains ? 'Sauvegarde...' : 'Enregistrer les Domaines d’Activité'}
              </button>
            </div>
          </div>
        )}

        {/* 4. NOS ENGAGEMENTS QUALITÉ */}
        {companyInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Nos Engagements Qualité ({companyInfo.commitments?.length || 0})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Piliers de confiance et garanties (Qualité éprouvée, Disponibilité en stock, etc.). Modifiables ou personnalisables.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCommitment}
                className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Engagement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(companyInfo.commitments || []).map((com, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCommitment(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Supprimer cet engagement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Titre de l'engagement</label>
                      <input
                        type="text"
                        value={com.title}
                        onChange={(e) => handleCommitmentChange(idx, 'title', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                        placeholder="Ex: Disponibilité en stock..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Description & Garantie</label>
                      <textarea
                        rows={3}
                        value={com.description}
                        onChange={(e) => handleCommitmentChange(idx, 'description', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                        placeholder="Explication de la garantie apportée au client..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveCommitments}
                disabled={savingCommitments}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {savingCommitments ? 'Sauvegarde...' : 'Enregistrer les Engagements Qualité'}
              </button>
            </div>
          </div>
        )}

        {/* 5. NOTRE CLIENTÈLE */}
        {companyInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Notre Clientèle & Cibles ({companyInfo.clientSegments?.length || 0})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secteurs cibles (Entreprises, Hôpitaux, Garages, Particuliers...). Vous pouvez les modifier ou les adapter.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddClientSegment}
                className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Secteur
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(companyInfo.clientSegments || []).map((seg, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-indigo-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveClientSegment(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Supprimer ce secteur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Secteur / Cible</label>
                      <input
                        type="text"
                        value={seg.title}
                        onChange={(e) => handleClientSegmentChange(idx, 'title', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                        placeholder="Ex: Entreprises & Sièges..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Description & Offre</label>
                      <textarea
                        rows={3}
                        value={seg.description}
                        onChange={(e) => handleClientSegmentChange(idx, 'description', e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                        placeholder="Contrats d'entretien réguliers pour bureaux et sièges..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveClientSegments}
                disabled={savingClients}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {savingClients ? 'Sauvegarde...' : 'Enregistrer la Clientèle'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL AJOUT / MODIFICATION D'UNE SECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-slate-900 mb-1">
              {editingSection ? 'Modifier la Section' : 'Ajouter une Nouvelle Section'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Remplissez les détails du bloc de présentation. Vous pouvez insérer une image ou un lien vidéo.
            </p>

            <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de la section *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Notre Savoir-Faire Industriel"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge / Surtitre</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Ex: Qualité & Rigueur"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description courte *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Résumé percutant en une phrase..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Texte complet / Développé</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Détails complets, engagements, processus de fabrication..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* IMAGE DE LA SECTION (EXPLORATEUR DIRECT) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <MediaUploader
                  label="Image illustrative de la section"
                  type="image"
                  value={formData.image}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  description="Sélectionnez l'image d'illustration depuis vos dossiers."
                />
              </div>

              {/* VIDÉO DE LA SECTION (EXPLORATEUR DIRECT) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <MediaUploader
                  label="Vidéo illustrative (optionnel)"
                  type="video"
                  value={formData.videoUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, videoUrl: url }))}
                  description="Sélectionnez un fichier vidéo (MP4, WebM) pour cette section."
                />
              </div>

              {/* STATUT PUBLIÉ */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="section-published"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="section-published" className="font-bold text-slate-800 cursor-pointer">
                  Publier immédiatement cette section sur la page À Propos
                </label>
              </div>

              {/* BOUTONS ACTIONS MODAL */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-xs"
                >
                  {editingSection ? 'Enregistrer les modifications' : 'Créer la section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

