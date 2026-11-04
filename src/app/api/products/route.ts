import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

function toSupabaseProduct(p: Partial<Product>) {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
  const sort = searchParams.get('sort') || 'newest';
  const includeUnpublished = searchParams.get('includeUnpublished') === 'true' && isUserAdmin();

  const db = getDatabase();
  let results: Product[] = [...db.products];

  // Si Supabase est configuré, synchroniser pour obtenir les produits les plus frais
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data: supaProds } = await supabase.from('products').select('*');
        if (supaProds && supaProds.length > 0) {
          const supaMap = new Map<string, Product>();
          for (const sp of supaProds) {
            supaMap.set(sp.id, {
              id: sp.id,
              slug: sp.slug,
              name: sp.name,
              shortDescription: sp.short_description || '',
              fullDescription: sp.full_description || '',
              categoryId: sp.category_id,
              categoryName: sp.category_name,
              price: Number(sp.price),
              currency: sp.currency || 'FCFA',
              packaging: sp.packaging || '',
              mainImage: sp.main_image || '',
              images: Array.isArray(sp.images) ? sp.images : (sp.main_image ? [sp.main_image] : []),
              availability: sp.availability || 'in_stock',
              stockQuantity: Number(sp.stock_quantity || 0),
              isPublished: Boolean(sp.is_published),
              isFeatured: Boolean(sp.is_featured),
              characteristics: sp.characteristics || [],
              additionalInfo: sp.additional_info || '',
              createdAt: sp.created_at,
              updatedAt: sp.updated_at,
            });
          }

          // Fusionner avec le local
          results = results.map((localP) => {
            const fresh = supaMap.get(localP.id);
            if (fresh) {
              return {
                ...localP,
                ...fresh,
                videos: localP.videos || [],
                videoUrl: localP.videoUrl || '',
              };
            }
            return localP;
          });

          // Ajouter les produits créés uniquement sur Supabase
          Array.from(supaMap.entries()).forEach(([id, sp]) => {
            if (!results.some((r) => r.id === id)) {
              results.push(sp);
            }
          });
        }
      }
    } catch (supaErr) {
      console.warn('Erreur lecture Supabase products GET:', supaErr);
    }
  }

  // Filtre de publication
  if (!includeUnpublished) {
    results = results.filter((p) => p.isPublished);
  }

  // Filtre catégorie
  if (categoryId && categoryId !== 'all') {
    results = results.filter((p) => p.categoryId === categoryId);
  }

  // Recherche sur nom et descriptions
  if (search) {
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.shortDescription.toLowerCase().includes(search) ||
        p.fullDescription.toLowerCase().includes(search)
    );
  }

  // Filtre de prix min/max
  if (minPrice !== null && !isNaN(minPrice)) {
    results = results.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    results = results.filter((p) => p.price <= maxPrice);
  }

  // Tri
  switch (sort) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'name_asc':
      results.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
    default:
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return NextResponse.json(results, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Le nom et le prix sont obligatoires.' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const db = getDatabase();
    const slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Récupérer le nom de la catégorie correspondante
    const category = db.categories.find((c) => c.id === body.categoryId);

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      slug: slug || `produit-${Date.now()}`,
      name: body.name.trim(),
      shortDescription: body.shortDescription || '',
      fullDescription: body.fullDescription || '',
      categoryId: body.categoryId || (db.categories[0]?.id ?? 'cat-entretien'),
      categoryName: category?.name || (db.categories[0]?.name ?? "Produits d'entretien"),
      price: Number(body.price),
      currency: 'FCFA',
      packaging: body.packaging || 'Unité',
      mainImage: body.mainImage || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [body.mainImage || 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80'],
      sku: body.sku || '',
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      videoUrl: (Array.isArray(body.videos) && body.videos[0]) || body.videoUrl || '',
      videos: Array.isArray(body.videos) ? body.videos.filter(Boolean) : (body.videoUrl ? [body.videoUrl] : []),
      showVideo: body.showVideo !== undefined ? Boolean(body.showVideo) : true,
      order: body.order !== undefined ? Number(body.order) : 0,
      availability: body.availability || 'in_stock',
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : 10,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
      isFeatured: Boolean(body.isFeatured),
      characteristics: body.characteristics || [],
      additionalInfo: body.additionalInfo || '',
      createdAt: now,
      updatedAt: now,
    };

    db.products.unshift(newProduct);
    saveDatabase(db);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const row = toSupabaseProduct(newProduct);
          await supabase.from('products').insert(row);
        }
      } catch (supaErr) {
        console.warn('Erreur insertion Supabase products:', supaErr);
      }
    }

    revalidatePath('/', 'layout');

    return NextResponse.json(newProduct, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur POST /api/products:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du produit.' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
