import { getDatabase } from './storage';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';
import { Product } from '@/types';

export function toSupabaseProduct(p: Partial<Product>) {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.name !== undefined) row.name = p.name;
  if (p.shortDescription !== undefined) row.short_description = p.shortDescription;
  if (p.fullDescription !== undefined) row.full_description = p.fullDescription;
  if (p.categoryId !== undefined) row.category_id = p.categoryId;
  if (p.categoryName !== undefined) row.category_name = p.categoryName;
  if (p.price !== undefined) row.price = Number(p.price);
  if (p.currency !== undefined) row.currency = p.currency;
  if (p.packaging !== undefined) row.packaging = p.packaging;
  if (p.mainImage !== undefined) row.main_image = p.mainImage;
  if (p.images !== undefined) row.images = p.images;
  if (p.availability !== undefined) row.availability = p.availability;
  if (p.stockQuantity !== undefined) row.stock_quantity = Number(p.stockQuantity);
  if (p.isPublished !== undefined) row.is_published = Boolean(p.isPublished);
  if (p.isFeatured !== undefined) row.is_featured = Boolean(p.isFeatured);
  if (p.characteristics !== undefined) row.characteristics = p.characteristics;
  if (p.additionalInfo !== undefined) row.additional_info = p.additionalInfo;
  if (p.createdAt !== undefined) row.created_at = p.createdAt;
  if (p.updatedAt !== undefined) row.updated_at = p.updatedAt;
  return row;
}

export function fromSupabaseProduct(row: any, fallback?: Partial<Product>): Product {
  const images = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : (row.main_image ? [row.main_image] : (fallback?.images || []));

  return {
    id: row.id,
    slug: row.slug || fallback?.slug || `produit-${row.id}`,
    name: row.name || fallback?.name || 'Produit T. Wiley',
    shortDescription: row.short_description || fallback?.shortDescription || '',
    fullDescription: row.full_description || fallback?.fullDescription || '',
    categoryId: row.category_id || fallback?.categoryId || 'cat-cosmetiques',
    categoryName: row.category_name || fallback?.categoryName || 'Catalogue',
    price: Number(row.price ?? fallback?.price ?? 0),
    currency: row.currency || fallback?.currency || 'FCFA',
    packaging: row.packaging || fallback?.packaging || '',
    mainImage: row.main_image || fallback?.mainImage || images[0] || '',
    images,
    sku: fallback?.sku || '',
    originalPrice: fallback?.originalPrice,
    videoUrl: fallback?.videoUrl || '',
    videos: fallback?.videos || [],
    showVideo: fallback?.showVideo !== false,
    order: fallback?.order || 0,
    availability: row.availability || fallback?.availability || 'in_stock',
    stockQuantity: Number(row.stock_quantity ?? fallback?.stockQuantity ?? 10),
    isPublished: row.is_published !== undefined ? Boolean(row.is_published) : (fallback?.isPublished ?? true),
    isFeatured: Boolean(row.is_featured ?? fallback?.isFeatured ?? false),
    characteristics: Array.isArray(row.characteristics) ? row.characteristics : (fallback?.characteristics || []),
    additionalInfo: row.additional_info || fallback?.additionalInfo || '',
    createdAt: row.created_at || fallback?.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || fallback?.updatedAt || new Date().toISOString(),
  };
}

/**
 * Récupère tous les produits en direct depuis Supabase avec repli local
 */
export async function getLiveProducts(): Promise<Product[]> {
  const db = getDatabase();
  const localMap = new Map<string, Product>();
  for (const p of db.products || []) {
    localMap.set(p.id, p);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const liveList: Product[] = [];
          for (const row of data) {
            const fallback = localMap.get(row.id);
            const prod = fromSupabaseProduct(row, fallback);
            liveList.push(prod);
            localMap.delete(row.id);
          }
          // Conserver aussi les éventuels produits locaux non synchronisés
          Array.from(localMap.values()).forEach((remaining) => {
            liveList.push(remaining);
          });

          // Mettre à jour le cache mémoire local
          db.products = liveList;
          return liveList;
        }
      }
    } catch (err) {
      console.warn('Erreur lecture Supabase getLiveProducts:', err);
    }
  }

  return [...db.products];
}

/**
 * Récupère un produit spécifique en direct depuis Supabase par son slug ou son identifiant
 */
export async function getLiveProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  if (!slugOrId) return null;
  const db = getDatabase();
  const localFallback = db.products.find((p) => p.slug === slugOrId || p.id === slugOrId);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
          .maybeSingle();

        if (!error && data) {
          const liveProd = fromSupabaseProduct(data, localFallback);
          // Mettre à jour dans le cache mémoire local pour cohérence
          const idx = db.products.findIndex((p) => p.id === liveProd.id);
          if (idx >= 0) {
            db.products[idx] = liveProd;
          } else {
            db.products.push(liveProd);
          }
          return liveProd;
        }
      }
    } catch (err) {
      console.warn('Erreur lecture Supabase getLiveProductBySlugOrId:', err);
    }
  }

  return localFallback || null;
}

