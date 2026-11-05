import { getDatabase, saveDatabase } from './storage';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';
import { Category } from '@/types';

export function toSupabaseCategory(c: Partial<Category>) {
  const row: Record<string, any> = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.slug !== undefined) row.slug = c.slug;
  if (c.name !== undefined) row.name = c.name;
  if (c.description !== undefined) row.description = c.description || '';
  if (c.image !== undefined) row.image = c.image;
  if (c.order !== undefined) row.order = Number(c.order);
  return row;
}

export function fromSupabaseCategory(row: any, fallback?: Partial<Category>): Category {
  return {
    id: row.id,
    slug: row.slug || fallback?.slug || '',
    name: row.name || fallback?.name || '',
    description: row.description ?? fallback?.description ?? '',
    image: row.image || fallback?.image || '',
    order: row.order !== undefined ? Number(row.order) : (fallback?.order || 1),
  };
}

/**
 * Récupère en direct les catégories depuis Supabase avec synchronisation et repli local
 */
export async function getLiveCategories(): Promise<Category[]> {
  const db = getDatabase();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('order', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const liveCategories: Category[] = data.map((row: any) => {
            const localFallback = db.categories.find((c) => c.id === row.id);
            return fromSupabaseCategory(row, localFallback);
          });

          // Mettre à jour le cache local pour garder la parité exacte
          db.categories = liveCategories;
          saveDatabase(db);

          return liveCategories;
        }
      }
    } catch (err) {
      console.warn('Erreur lecture Supabase getLiveCategories:', err);
    }
  }

  return db.categories;
}

/**
 * Enregistre ou met à jour une catégorie dans Supabase et dans le cache local
 */
export async function saveLiveCategory(cat: Category): Promise<Category> {
  const db = getDatabase();

  // 1. Mise à jour dans le cache local
  const index = db.categories.findIndex((c) => c.id === cat.id);
  if (index !== -1) {
    db.categories[index] = { ...db.categories[index], ...cat };
  } else {
    db.categories.push(cat);
  }
  saveDatabase(db);

  // 2. Persistance prioritaire dans Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const row = toSupabaseCategory(cat);
        const { error } = await supabase.from('categories').upsert(row, { onConflict: 'id' });
        if (error) {
          console.error('Erreur Supabase saveLiveCategory:', error.message);
        }
      }
    } catch (err) {
      console.error('Exception Supabase saveLiveCategory:', err);
    }
  }

  return cat;
}

/**
 * Supprime une catégorie de Supabase et du cache local
 */
export async function deleteLiveCategory(id: string): Promise<boolean> {
  const db = getDatabase();

  // 1. Suppression du cache local
  db.categories = db.categories.filter((c) => c.id !== id);
  saveDatabase(db);

  // 2. Suppression de Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
          console.error('Erreur Supabase deleteLiveCategory:', error.message);
        }
      }
    } catch (err) {
      console.error('Exception Supabase deleteLiveCategory:', err);
    }
  }

  return true;
}
