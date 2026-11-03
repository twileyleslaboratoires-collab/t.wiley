import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase, INITIAL_THEME_SETTINGS } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.themeSettings || INITIAL_THEME_SETTINGS);
}

export async function PUT(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const db = getDatabase();

    db.themeSettings = {
      ...db.themeSettings,
      ...body,
    };

    saveDatabase(db);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, themeSettings: db.themeSettings });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres visuels.' },
      { status: 500 }
    );
  }
}

