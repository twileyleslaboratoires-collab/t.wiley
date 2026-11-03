import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = params;
  const db = getDatabase();

  const product = db.products.find((p) => p.id === id || p.slug === id);

  if (!product) {
    return NextResponse.json({ error: 'Produit non trouvé.' }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const db = getDatabase();

    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Produit non trouvé.' }, { status: 404 });
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

    db.products[index] = {
      ...db.products[index],
      ...body,
      categoryName,
      videos: updatedVideos,
      videoUrl: updatedVideos[0] || body.videoUrl || db.products[index].videoUrl || '',
      price: body.price !== undefined ? Number(body.price) : db.products[index].price,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : db.products[index].stockQuantity,
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);
    revalidatePath('/', 'layout');
    return NextResponse.json(db.products[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const { id } = params;
    const db = getDatabase();

    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

