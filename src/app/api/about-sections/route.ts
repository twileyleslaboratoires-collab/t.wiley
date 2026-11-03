import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { AboutSection } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  const sections = (db.aboutSections || []).sort((a, b) => a.order - b.order);
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const data = await request.json();
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Le titre et la description de la section sont obligatoires.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    if (!db.aboutSections) {
      db.aboutSections = [];
    }

    const newSection: AboutSection = {
      id: `sec-${Date.now()}`,
      title: data.title.trim(),
      badge: data.badge ? data.badge.trim() : 'Section',
      description: data.description.trim(),
      content: data.content ? data.content.trim() : '',
      image: data.image || '',
      videoUrl: data.videoUrl || '',
      order: typeof data.order === 'number' ? data.order : db.aboutSections.length + 1,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.aboutSections.push(newSection);
    saveDatabase(db);
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, section: newSection }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création de la section.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'ID de la section manquant.' }, { status: 400 });
    }

    const db = getDatabase();
    if (!db.aboutSections) {
      db.aboutSections = [];
    }

    const index = db.aboutSections.findIndex((s) => s.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Section introuvable.' }, { status: 404 });
    }

    db.aboutSections[index] = {
      ...db.aboutSections[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, section: db.aboutSections[index] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la section.' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
    }

    const db = getDatabase();
    if (!db.aboutSections) {
      db.aboutSections = [];
    }

    const initialLength = db.aboutSections.length;
    db.aboutSections = db.aboutSections.filter((s) => s.id !== id);

    if (db.aboutSections.length === initialLength) {
      return NextResponse.json({ error: 'Section introuvable.' }, { status: 404 });
    }

    saveDatabase(db);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la section.' },
      { status: 500 }
    );
  }
}

