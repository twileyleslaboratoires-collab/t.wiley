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
  if (p.updatedAt !== undefined) row.updated_at = p.updatedAt;
  return row;
}

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

    const db = getDatabase();
    let product = db.products.find((p) => p.id === id || p.slug === id);

    if (!product && isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const { data } = await supabase
            .from('products')
            .select('*')
            .or(`id.eq.${id},slug.eq.${id}`)
            .maybeSingle();

          if (data) {
            product = {
              id: data.id,
              slug: data.slug,
              name: data.name,
              shortDescription: data.short_description || '',
              fullDescription: data.full_description || '',
              categoryId: data.category_id,
              categoryName: data.category_name,
              price: Number(data.price),
              currency: data.currency || 'FCFA',
              packaging: data.packaging || '',
              mainImage: data.main_image || '',
              images: Array.isArray(data.images) ? data.images : (data.main_image ? [data.main_image] : []),
              availability: data.availability || 'in_stock',
              stockQuantity: Number(data.stock_quantity || 0),
              isPublished: Boolean(data.is_published),
              isFeatured: Boolean(data.is_featured),
              characteristics: Array.isArray(data.characteristics) ? data.characteristics : [],
              additionalInfo: data.additional_info || '',
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
          }
        }
      } catch (err) {
        console.warn('Erreur lecture Supabase product:', err);
      }
    }

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

    let index = db.products.findIndex((p) => p.id === id);

    // Si non trouvé en mémoire locale, tenter de restaurer depuis Supabase
    if (index === -1 && isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const { data: supaProd } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
          if (supaProd) {
            const restored: Product = {
              id: supaProd.id,
              slug: supaProd.slug,
              name: supaProd.name,
              shortDescription: supaProd.short_description || '',
              fullDescription: supaProd.full_description || '',
              categoryId: supaProd.category_id,
              categoryName: supaProd.category_name,
              price: Number(supaProd.price),
              currency: supaProd.currency || 'FCFA',
              packaging: supaProd.packaging || '',
              mainImage: supaProd.main_image || '',
              images: Array.isArray(supaProd.images) ? supaProd.images : [supaProd.main_image],
              availability: supaProd.availability || 'in_stock',
              stockQuantity: Number(supaProd.stock_quantity || 0),
              isPublished: Boolean(supaProd.is_published),
              isFeatured: Boolean(supaProd.is_featured),
              characteristics: supaProd.characteristics || [],
              additionalInfo: supaProd.additional_info || '',
              createdAt: supaProd.created_at,
              updatedAt: supaProd.updated_at,
            };
            db.products.push(restored);
            index = db.products.length - 1;
          }
        }
      } catch (e) {
        console.warn('Erreur synchro Supabase:', e);
      }
    }

    if (index === -1) {
      return NextResponse.json({ error: 'Produit non trouvé.' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    // Récupérer le nom de la catégorie si modifiée
    let categoryName = db.products[index].categoryName;
    if (body.categoryId) {
      const cat = db.categories.find((c) => c.id === body.categoryId);
      if (cat) categoryName = cat.name;
    }

    const updatedVideos = Array.isArray(body.videos)
      ? body.videos.filter(Boolean)
      : (body.videoUrl ? [body.videoUrl] : (db.products[index].videos || (db.products[index].videoUrl ? [db.products[index].videoUrl] : [])));

    const now = new Date().toISOString();
    const updatedProduct: Product = {
      ...db.products[index],
      ...body,
      categoryName,
      videos: updatedVideos,
      videoUrl: updatedVideos[0] || body.videoUrl || db.products[index].videoUrl || '',
      price: body.price !== undefined ? Number(body.price) : db.products[index].price,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : db.products[index].stockQuantity,
      updatedAt: now,
    };

    db.products[index] = updatedProduct;
    saveDatabase(db);

    // Persistance dans Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const row = toSupabaseProduct(updatedProduct);
          await supabase.from('products').update(row).eq('id', id);
        }
      } catch (supaErr) {
        console.warn('Erreur mise à jour Supabase products:', supaErr);
      }
    }

    revalidatePath('/', 'layout');
    revalidatePath('/produit/[slug]', 'page');

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
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);

    if (isSupabaseConfigured()) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          await supabase.from('products').delete().eq('id', id);
        }
      } catch (supaErr) {
        console.warn('Erreur suppression Supabase products:', supaErr);
      }
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
