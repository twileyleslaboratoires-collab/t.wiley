import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { Partner } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.partners || []);
}

export async function POST(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Le nom du partenaire est requis.' }, { status: 400 });
    }

    const db = getDatabase();
    const newPartner: Partner = {
      id: `part-${Date.now()}`,
      name: body.name.trim(),
      logo: body.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [body.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80'],
      description: body.description || '',
      websiteUrl: body.websiteUrl || '',
      isPublished: body.isPublished !== false,
      order: body.order || 1,
    };

    if (!db.partners) db.partners = [];
    db.partners.push(newPartner);
    saveDatabase(db);
    revalidatePath('/', 'layout');

    return NextResponse.json(newPartner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du partenaire.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID partenaire requis.' }, { status: 400 });
    }

    const db = getDatabase();
    if (!db.partners) db.partners = [];
    const index = db.partners.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Partenaire non trouvé.' }, { status: 404 });
    }

    db.partners[index] = {
      ...db.partners[index],
      ...body,
    };

    saveDatabase(db);
    revalidatePath('/', 'layout');
    return NextResponse.json(db.partners[index]);
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
      return NextResponse.json({ error: 'ID requis.' }, { status: 400 });
    }

    const db = getDatabase();
    if (db.partners) {
      db.partners = db.partners.filter((p) => p.id !== id);
      saveDatabase(db);
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
