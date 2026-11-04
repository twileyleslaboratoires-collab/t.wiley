import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getLiveProducts, toSupabaseProduct } from '@/lib/products';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
  const sort = searchParams.get('sort') || 'newest';
  const includeUnpublished = searchParams.get('includeUnpublished') === 'true' && isUserAdmin();

  let results: Product[] = await getLiveProducts();

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

    try {
      revalidatePath('/', 'layout');
    } catch {}

    return NextResponse.json(newProduct, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur POST /api/products:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du produit.' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
