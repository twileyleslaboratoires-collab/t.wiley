import { CompanyInfo } from '@/types';
import { getDatabase, saveDatabase, INITIAL_COMPANY_INFO } from './storage';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';
import { sanitizeWhatsAppNumber } from './whatsapp';
import { revalidatePath } from 'next/cache';

let memoryCompanyInfo: CompanyInfo | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10 secondes de cache mémoire pour performance optimale

/**
 * Convertit une ligne Supabase en objet CompanyInfo complet
 */
export function fromSupabaseCompanyInfo(row: any, fallback: CompanyInfo): CompanyInfo {
  if (!row) return fallback;

  const socialLinks = typeof row.social_links === 'object' && row.social_links !== null
    ? { ...row.social_links }
    : (fallback.socialLinks || {});

  // Extraction des contacts personnalisés depuis social_links.__tw_contacts__
  const customContacts = socialLinks.__tw_contacts__ || {};

  // Nettoyage de la clé interne dans l'objet socialLinks renvoyé
  const cleanSocialLinks = { ...socialLinks };
  delete cleanSocialLinks.__tw_contacts__;
  delete cleanSocialLinks._chat_admin_reads;
  delete cleanSocialLinks._chat_last_menu_opened;

  const additionalPhones: string[] = Array.isArray(customContacts.additionalPhones)
    ? customContacts.additionalPhones.filter((p: any) => typeof p === 'string' && p.trim())
    : (fallback.additionalPhones || []);

  const additionalEmails: string[] = Array.isArray(customContacts.additionalEmails)
    ? customContacts.additionalEmails.filter((e: any) => typeof e === 'string' && e.trim())
    : (fallback.additionalEmails || []);

  return {
    ...fallback,
    name: row.name || fallback.name,
    slogan: row.slogan !== undefined ? row.slogan : fallback.slogan,
    activities: customContacts.activities || row.slogan || fallback.activities,
    logo: row.logo || fallback.logo,
    banner: customContacts.banner || fallback.banner,
    aboutHeroImage: row.about_hero_image || fallback.aboutHeroImage,
    description: row.description || fallback.description,
    whatsappNumber: row.whatsapp_number || fallback.whatsappNumber,
    phone: row.phone || customContacts.phone1 || fallback.phone,
    phone1: customContacts.phone1 || row.phone || fallback.phone1,
    phone2: customContacts.phone2 !== undefined ? customContacts.phone2 : fallback.phone2,
    phone3: customContacts.phone3 !== undefined ? customContacts.phone3 : fallback.phone3,
    phoneUS: customContacts.phoneUS !== undefined ? customContacts.phoneUS : fallback.phoneUS,
    additionalPhones,
    additionalEmails,
    email: row.email !== undefined ? row.email : fallback.email,
    address: row.address || fallback.address,
    city: customContacts.city || fallback.city,
    country: customContacts.country || fallback.country,
    district: customContacts.district || fallback.district,
    openingHours: row.opening_hours || fallback.openingHours,
    socialLinks: cleanSocialLinks,
    mission: row.mission || fallback.mission,
    vision: row.vision || fallback.vision,
    history: row.history || fallback.history,
    domainActivities: Array.isArray(row.domain_activities) && row.domain_activities.length > 0
      ? row.domain_activities
      : fallback.domainActivities,
    commitments: Array.isArray(row.commitments) && row.commitments.length > 0
      ? row.commitments
      : fallback.commitments,
    clientSegments: Array.isArray(row.client_segments) && row.client_segments.length > 0
      ? row.client_segments
      : fallback.clientSegments,
    enableWhatsAppButton: customContacts.enableWhatsAppButton !== undefined
      ? customContacts.enableWhatsAppButton
      : (fallback.enableWhatsAppButton !== undefined ? fallback.enableWhatsAppButton : true),
  };
}

/**
 * Récupère les informations officielles et coordonnées de l'entreprise en temps réel
 * (Supabase en priorité absolue avec fallback sur le stockage local)
 */
export async function getLiveCompanyInfo(): Promise<CompanyInfo> {
  const now = Date.now();
  if (memoryCompanyInfo && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryCompanyInfo;
  }

  const localDb = getDatabase();
  const fallback = localDb.companyInfo || INITIAL_COMPANY_INFO;

  if (!isSupabaseConfigured()) {
    memoryCompanyInfo = fallback;
    lastFetchTime = now;
    return fallback;
  }

  try {
    const supabase = getServiceSupabase();
    if (!supabase) {
      memoryCompanyInfo = fallback;
      lastFetchTime = now;
      return fallback;
    }
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('id', 'primary')
      .maybeSingle();

    if (error) {
      console.warn('Erreur lecture company_info Supabase:', error.message);
      memoryCompanyInfo = fallback;
      lastFetchTime = now;
      return fallback;
    }

    if (data) {
      const merged = fromSupabaseCompanyInfo(data, fallback);
      memoryCompanyInfo = merged;
      lastFetchTime = now;

      // Synchronisation mémoire locale
      localDb.companyInfo = merged;
      return merged;
    }
  } catch (err) {
    console.warn('Exception getLiveCompanyInfo:', err);
  }

  memoryCompanyInfo = fallback;
  lastFetchTime = now;
  return fallback;
}

/**
 * Met à jour les coordonnées et informations de l'entreprise
 * (Persistance simultanée dans Supabase et en stockage local)
 */
export async function updateLiveCompanyInfo(updated: Partial<CompanyInfo>): Promise<CompanyInfo> {
  const current = await getLiveCompanyInfo();

  // Nettoyage WhatsApp
  const cleanWhatsApp = updated.whatsappNumber
    ? sanitizeWhatsAppNumber(updated.whatsappNumber)
    : current.whatsappNumber;

  const merged: CompanyInfo = {
    ...current,
    ...updated,
    whatsappNumber: cleanWhatsApp,
    additionalPhones: Array.isArray(updated.additionalPhones)
      ? updated.additionalPhones.map((p) => String(p || '').trim()).filter(Boolean)
      : (current.additionalPhones || []),
    additionalEmails: Array.isArray(updated.additionalEmails)
      ? updated.additionalEmails.map((e) => String(e || '').trim()).filter(Boolean)
      : (current.additionalEmails || []),
    socialLinks: {
      ...(current.socialLinks || {}),
      ...(updated.socialLinks || {}),
    },
  };

  // 1. Sauvegarde locale
  const localDb = getDatabase();
  localDb.companyInfo = merged;
  saveDatabase(localDb);

  memoryCompanyInfo = merged;
  lastFetchTime = Date.now();

  // 2. Persistance dans Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (!supabase) return merged;

      // Récupérer l'existant pour préserver les métadonnées internes du chat
      const { data: existingRow } = await supabase
        .from('company_info')
        .select('social_links')
        .eq('id', 'primary')
        .maybeSingle();

      const existingSocial = typeof existingRow?.social_links === 'object' && existingRow?.social_links !== null
        ? existingRow.social_links
        : {};

      // Stocker les contacts additionnels dans __tw_contacts__
      const newSocialLinks = {
        ...existingSocial,
        ...(merged.socialLinks || {}),
        __tw_contacts__: {
          phone1: merged.phone1,
          phone2: merged.phone2,
          phone3: merged.phone3,
          phoneUS: merged.phoneUS,
          additionalPhones: merged.additionalPhones || [],
          additionalEmails: merged.additionalEmails || [],
          city: merged.city,
          country: merged.country,
          district: merged.district,
          enableWhatsAppButton: merged.enableWhatsAppButton,
          activities: merged.activities,
          banner: merged.banner,
        },
      };

      const payload: Record<string, any> = {
        name: merged.name,
        slogan: merged.slogan || merged.activities,
        logo: merged.logo,
        about_hero_image: merged.aboutHeroImage,
        description: merged.description,
        whatsapp_number: merged.whatsappNumber,
        phone: merged.phone1 || merged.phone,
        email: merged.email || '',
        address: merged.address,
        opening_hours: merged.openingHours,
        social_links: newSocialLinks,
        mission: merged.mission,
        vision: merged.vision,
        history: merged.history,
        domain_activities: merged.domainActivities,
        commitments: merged.commitments,
        client_segments: merged.clientSegments,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertErr } = await supabase
        .from('company_info')
        .upsert({ id: 'primary', ...payload });

      if (upsertErr) {
        console.warn('Erreur upsert company_info Supabase:', upsertErr.message);
      }
    } catch (err) {
      console.warn('Exception updateLiveCompanyInfo Supabase:', err);
    }
  }

  // 3. Revalidation des chemins Next.js
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/a-propos');
    revalidatePath('/categories');
    revalidatePath('/panier');
  } catch (err) {
    // Non bloquant en mode test
  }

  return merged;
}
