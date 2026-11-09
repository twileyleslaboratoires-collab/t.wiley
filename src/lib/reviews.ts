import fs from 'fs';
import path from 'path';
import { ProductReview } from '@/types';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';
import { getLiveProductBySlugOrId } from './products';

const DATA_DIR = path.join(process.cwd(), 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

function getTmpReviewsPath(): string {
  try {
    const os = require('os');
    return path.join(os.tmpdir(), 't-wiley-reviews.json');
  } catch {
    return '/tmp/t-wiley-reviews.json';
  }
}

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-init-1',
    productId: 'prod-1',
    authorName: 'Dr. Konan Bernard',
    city: 'Bouaké',
    rating: 5,
    comment:
      'Produit indispensable pour notre clinique à Bouaké. Désinfection irréprochable des surfaces médicales et excellente tolérance. Livraison rapide et suivi impeccable par les laboratoires.',
    isVerified: true,
    isPublished: true,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev-init-2',
    productId: 'prod-1',
    authorName: 'Amina Touré',
    city: 'Abidjan',
    rating: 5,
    comment:
      'Très efficace pour l’entretien de notre centre de santé. Très concentré, un seul bidon dure longtemps. Nous recommandons vivement !',
    isVerified: true,
    isPublished: true,
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev-init-3',
    productId: 'prod-2',
    authorName: 'Jean-Marc Kouassi',
    city: 'Yamoussoukro',
    rating: 5,
    comment:
      'Dégraissant extrêmement puissant pour notre garage mécanique. Élimine les résidus d’huile moteur sans effort. Formule professionnelle de très haute qualité.',
    isVerified: true,
    isPublished: true,
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
];

let memoryReviews: ProductReview[] | null = null;

function loadLocalReviews(): ProductReview[] {
  if (memoryReviews) {
    return memoryReviews;
  }

  let raw = '';
  const tmpFile = getTmpReviewsPath();

  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      raw = fs.readFileSync(REVIEWS_FILE, 'utf8');
    } else if (fs.existsSync(tmpFile)) {
      raw = fs.readFileSync(tmpFile, 'utf8');
    }
  } catch {
    raw = '';
  }

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryReviews = parsed;
        return parsed;
      }
    } catch {
      // Ignorer
    }
  }

  memoryReviews = [...INITIAL_REVIEWS];
  saveLocalReviews(memoryReviews);
  return memoryReviews;
}

function saveLocalReviews(reviews: ProductReview[]): void {
  memoryReviews = reviews;
  const tmpFile = getTmpReviewsPath();

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
  } catch {
    // Si lecture seule sur Vercel
  }

  try {
    fs.writeFileSync(tmpFile, JSON.stringify(reviews, null, 2), 'utf8');
  } catch {
    // Ignorer
  }
}

/**
 * Récupère tous les avis d'un produit (en direct depuis Supabase et repli local)
 */
export async function getLiveReviewsForProduct(productId: string): Promise<ProductReview[]> {
  const localList = loadLocalReviews().filter((r) => r.productId === productId && r.isPublished !== false);

  if (isSupabaseConfigured()) {
    try {
      const product = await getLiveProductBySlugOrId(productId);
      if (product && Array.isArray(product.characteristics)) {
        const reviewEntry = product.characteristics.find((c) => c && c.label === '__tw_reviews__');
        if (reviewEntry && typeof reviewEntry.value === 'string') {
          const parsed = JSON.parse(reviewEntry.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Fusionner sans doublons avec le local
            const map = new Map<string, ProductReview>();
            for (const r of localList) map.set(r.id, r);
            for (const r of parsed) map.set(r.id, r);
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return merged;
          }
        }
      }
    } catch (err) {
      console.warn('Erreur lecture reviews depuis Supabase:', err);
    }
  }

  return localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Récupère tous les avis de la boutique
 */
export async function getAllLiveReviews(): Promise<ProductReview[]> {
  return loadLocalReviews();
}

/**
 * Ajoute un nouvel avis client et le persiste en local ET dans Supabase
 */
export async function addLiveReview(data: {
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
  city?: string;
}): Promise<ProductReview> {
  const cleanRating = Math.max(1, Math.min(5, Math.round(data.rating || 5)));
  const cleanName = data.authorName.trim().slice(0, 100);
  const cleanComment = data.comment.trim().slice(0, 2000);
  const cleanCity = (data.city || '').trim().slice(0, 100);

  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    productId: data.productId,
    authorName: cleanName,
    city: cleanCity || undefined,
    rating: cleanRating,
    comment: cleanComment,
    isVerified: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };

  // 1. Sauvegarde locale
  const all = loadLocalReviews();
  all.unshift(newReview);
  saveLocalReviews(all);

  // 2. Synchronisation dans Supabase (dans characteristics.__tw_reviews__ du produit)
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data: prodRow } = await supabase
          .from('products')
          .select('id, characteristics')
          .eq('id', data.productId)
          .maybeSingle();

        if (prodRow) {
          const chars = Array.isArray(prodRow.characteristics) ? [...prodRow.characteristics] : [];
          const idx = chars.findIndex((c) => c && c.label === '__tw_reviews__');

          const existingReviews: ProductReview[] = [];
          if (idx >= 0 && typeof chars[idx].value === 'string') {
            try {
              const p = JSON.parse(chars[idx].value);
              if (Array.isArray(p)) existingReviews.push(...p);
            } catch {
              // Ignorer
            }
          }

          existingReviews.unshift(newReview);

          const updatedEntry = {
            label: '__tw_reviews__',
            value: JSON.stringify(existingReviews.slice(0, 100)), // Garde les 100 avis les plus récents
          };

          if (idx >= 0) {
            chars[idx] = updatedEntry;
          } else {
            chars.push(updatedEntry);
          }

          await supabase.from('products').update({ characteristics: chars }).eq('id', data.productId);
        }
      }
    } catch (err) {
      console.warn('Erreur écriture review dans Supabase:', err);
    }
  }

  return newReview;
}

/**
 * Calcule les statistiques d'avis (moyenne, total, répartition)
 */
export function getProductRatingSummary(reviews: ProductReview[]): {
  average: number;
  count: number;
  breakdown: Record<number, number>;
} {
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (!reviews || reviews.length === 0) {
    return { average: 5, count: 0, breakdown };
  }

  let sum = 0;
  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
    breakdown[star] = (breakdown[star] || 0) + 1;
    sum += star;
  });

  const average = Number((sum / reviews.length).toFixed(1));
  return {
    average,
    count: reviews.length,
    breakdown,
  };
}
