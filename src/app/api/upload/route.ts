import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    // Supporte à la fois un seul fichier ('file') ou plusieurs fichiers ('files' ou multiples 'file')
    const files = formData.getAll('files') as File[];
    const singleFiles = formData.getAll('file') as File[];
    const allFiles = files.length > 0 ? files : singleFiles;

    if (!allFiles || allFiles.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
    }

    // Répertoire de destination public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const urls: string[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      if (!file || typeof file === 'string' || !file.name) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}-${i}-${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);
      urls.push(`/uploads/${uniqueFileName}`);
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier valide traité.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: urls[0],
      urls,
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l’enregistrement du fichier.' },
      { status: 500 }
    );
  }
}

