import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { getLiveProductBySlugOrId, toSupabaseProduct, fromSupabaseProduct } from '@/lib/products';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'ID produit manquant.' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const product = await getLiveProductBySlugOrId(id);

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé.' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(product, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'ID produit manquant.' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const body = await request.json();
    const db = getDatabase();

    let existingProduct = await getLiveProductBySlugOrId(id);
    let index = db.products.findIndex((p) => p.id === id);

    if (!existingProduct && index >= 0) {
      existingProduct = db.products[index];
    }

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produit non trouvé.' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // Récupérer le nom de la catégorie si modifiée
    let categoryName = body.categoryName || existingProduct.categoryName;
    if (body.categoryId) {
      const cat = db.categories.find((c) => c.id === body.categoryId);
      if (cat) categoryName = cat.name;
    }

    // Gestion explicite et stricte des vidéos (suppression ou ajout)
    let updatedVideos: string[];
    let updatedVideoUrl: string;
    let showVideo: boolean;

    if (Array.isArray(body.videos)) {
      updatedVideos = body.videos.filter(Boolean);
      updatedVideoUrl = updatedVideos.length > 0 ? (body.videoUrl || updatedVideos[0]) : '';
      showVideo = updatedVideos.length > 0 && body.showVideo !== false;
    } else if (body.videoUrl !== undefined) {
      updatedVideoUrl = body.videoUrl ? String(body.videoUrl).trim() : '';
      updatedVideos = updatedVideoUrl ? [updatedVideoUrl] : [];
      showVideo = updatedVideos.length > 0 && body.showVideo !== false;
    } else {
      updatedVideos = Array.isArray(existingProduct.videos)
        ? existingProduct.videos.filter(Boolean)
        : (existingProduct.videoUrl ? [existingProduct.videoUrl] : []);
      updatedVideoUrl = updatedVideos[0] || existingProduct.videoUrl || '';
      showVideo = existingProduct.showVideo !== false && updatedVideos.length > 0;
    }

    if (body.showVideo !== undefined && updatedVideos.length > 0) {
      showVideo = Boolean(body.showVideo);
    }

    const updatedCharacteristics = Array.isArray(body.characteristics)
      ? body.characteristics.filter((c: any) => c && (String(c.label || '').trim() || String(c.value || '').trim()))
      : (existingProduct.characteristics || []);

    const now = new Date().toISOString();
    const updatedProduct: Product = {
      ...existingProduct,
      ...body,
      categoryName,
      characteristics: updatedCharacteristics,
      videos: updatedVideos,
      videoUrl: updatedVideoUrl,
      showVideo,
      price: body.price !== undefined ? Number(body.price) : existingProduct.price,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : existingProduct.stockQuantity,
      updatedAt: now,
    };

    if (index >= 0) {
      db.products[index] = updatedProduct;
    } else {
      db.products.push(updatedProduct);
    }
    saveDatabase(db);

    // Persistance prioritaire dans Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const row = toSupabaseProduct(updatedProduct);
          await supabase.from('products').upsert(row);
        }
      } catch (supaErr) {
        console.warn('Erreur mise à jour Supabase products:', supaErr);
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/produit/[slug]', 'page');
      if (updatedProduct.slug) {
        revalidatePath(`/produit/${updatedProduct.slug}`, 'page');
      }
      if (existingProduct.slug && existingProduct.slug !== updatedProduct.slug) {
        revalidatePath(`/produit/${existingProduct.slug}`, 'page');
      }
    } catch {}

    return NextResponse.json(updatedProduct, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur PUT /api/products/[id]:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  try {
    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'ID produit manquant.' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const db = getDatabase();
    db.products = db.products.filter((p) => p.id !== id && p.slug !== id);
    saveDatabase(db);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          await supabase.from('products').delete().or(`id.eq.${id},slug.eq.${id}`);
        }
      } catch (supaErr) {
        console.warn('Erreur suppression Supabase products:', supaErr);
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/categories', 'page');
      revalidatePath('/produit/[slug]', 'page');
      revalidatePath(`/produit/${id}`, 'page');
    } catch {}

    return NextResponse.json({ success: true, deletedId: id }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
