import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { Category } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  // Calcule dynamiquement le nombre de produits par catégorie
  const categoriesWithCounts = db.categories.map((cat) => {
    const count = db.products.filter(
      (p) => p.categoryId === cat.id && p.isPublished
    ).length;
    return {
      ...cat,
      productCount: count,
    };
  });

  return NextResponse.json(categoriesWithCounts);
}

export async function POST(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: 'Le nom et le slug sont requis.' }, { status: 400 });
    }

    const db = getDatabase();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: body.name.trim(),
      slug: body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: body.description || '',
      image: body.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      order: db.categories.length + 1,
    };

    db.categories.push(newCategory);
    saveDatabase(db);
    revalidatePath('/', 'layout');

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la catégorie.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID de catégorie requis.' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.categories.findIndex((c) => c.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Catégorie non trouvée.' }, { status: 404 });
    }

    db.categories[index] = {
      ...db.categories[index],
      ...body,
    };

    // Si le nom de la catégorie change, mettons à jour categoryName dans les produits
    if (body.name) {
      db.products = db.products.map((p) =>
        p.categoryId === body.id ? { ...p, categoryName: body.name } : p
      );
    }

    saveDatabase(db);
    revalidatePath('/', 'layout');
    return NextResponse.json(db.categories[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de catégorie requis.' }, { status: 400 });
    }

    const db = getDatabase();
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDatabase(db);
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
