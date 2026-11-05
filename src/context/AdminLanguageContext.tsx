'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminLanguage = 'fr' | 'en';

export const ADMIN_TRANSLATIONS: Record<AdminLanguage, Record<string, string>> = {
  fr: {
    // Sidebar
    'nav.dashboard': 'Tableau de bord',
    'nav.chat': 'Chat en Direct',
    'nav.products': 'Gestion des Produits',
    'nav.categories': 'Catégories',
    'nav.about': 'Page « À Propos »',
    'nav.contacts': 'Coordonnées & Contacts',
    'nav.company': 'Identité Entreprise',
    'nav.partners': 'Partenaires',
    'nav.appearance': 'Apparence & Couleurs',
    'nav.security': 'Accès & Sécurité',
    'nav.view_store': 'Voir la boutique publique',
    'nav.logout': 'Déconnexion',
    'nav.admin_badge': 'Gestionnaire',
    'nav.private_area': 'Espace de gestion privée',
    'nav.lang_label': 'Langue gestionnaire',

    // Catégories page
    'cat.title': 'Gestion des Catégories',
    'cat.subtitle': 'Organisez les rayons de produits affichés sur votre boutique',
    'cat.new_btn': 'Nouvelle catégorie',
    'cat.edit_btn': 'Modifier',
    'cat.delete_btn': 'Supprimer',
    'cat.change_photo': 'Changer de photo',
    'cat.modal_edit_title': 'Modifier la catégorie',
    'cat.modal_create_title': 'Ajouter une nouvelle catégorie',
    'cat.name_label': 'Nom de la catégorie',
    'cat.slug_label': 'Identifiant URL (Slug)',
    'cat.desc_label': 'Description',
    'cat.img_label': 'Image illustrative de la catégorie',
    'cat.cancel': 'Annuler',
    'cat.save': 'Enregistrer',
    'cat.create': 'Créer la catégorie',
    'cat.saving': 'Enregistrement...',
    'cat.delete_confirm': 'Êtes-vous sûr de vouloir supprimer définitivement cette catégorie ?',
    'cat.products_count': 'produit(s)',
  },
  en: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'Live Chat',
    'nav.products': 'Product Management',
    'nav.categories': 'Categories',
    'nav.about': 'About Page',
    'nav.contacts': 'Contact Information',
    'nav.company': 'Company Identity',
    'nav.partners': 'Partners',
    'nav.appearance': 'Appearance & Colors',
    'nav.security': 'Access & Security',
    'nav.view_store': 'View Public Store',
    'nav.logout': 'Logout',
    'nav.admin_badge': 'Administrator',
    'nav.private_area': 'Private Management Area',
    'nav.lang_label': 'Manager Language',

    // Catégories page
    'cat.title': 'Category Management',
    'cat.subtitle': 'Organize product categories displayed in your store',
    'cat.new_btn': 'New category',
    'cat.edit_btn': 'Edit',
    'cat.delete_btn': 'Delete',
    'cat.change_photo': 'Change photo',
    'cat.modal_edit_title': 'Edit Category',
    'cat.modal_create_title': 'Add New Category',
    'cat.name_label': 'Category Name',
    'cat.slug_label': 'URL Slug',
    'cat.desc_label': 'Description',
    'cat.img_label': 'Category Illustration Image',
    'cat.cancel': 'Cancel',
    'cat.save': 'Save Changes',
    'cat.create': 'Create Category',
    'cat.saving': 'Saving...',
    'cat.delete_confirm': 'Are you sure you want to permanently delete this category?',
    'cat.products_count': 'product(s)',
  },
};

interface AdminLanguageContextType {
  adminLanguage: AdminLanguage;
  setAdminLanguage: (lang: AdminLanguage) => void;
  tAdmin: (key: string, fallback?: string) => string;
}

const AdminLanguageContext = createContext<AdminLanguageContextType>({
  adminLanguage: 'fr',
  setAdminLanguage: () => {},
  tAdmin: (key, fallback) => fallback || key,
});

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [adminLanguage, setAdminLanguageState] = useState<AdminLanguage>('fr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('twiley_admin_lang') as AdminLanguage | null;
      if (saved === 'fr' || saved === 'en') {
        setAdminLanguageState(saved);
      }
    } catch {
      // Ignorer si localStorage indisponible
    }
  }, []);

  const setAdminLanguage = (lang: AdminLanguage) => {
    setAdminLanguageState(lang);
    try {
      localStorage.setItem('twiley_admin_lang', lang);
    } catch {
      // Ignorer
    }
  };

  const tAdmin = (key: string, fallback?: string): string => {
    const dict = ADMIN_TRANSLATIONS[adminLanguage];
    if (dict && dict[key]) {
      return dict[key];
    }
    return fallback || key;
  };

  return (
    <AdminLanguageContext.Provider value={{ adminLanguage, setAdminLanguage, tAdmin }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  return useContext(AdminLanguageContext);
}

