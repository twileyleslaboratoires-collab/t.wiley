import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isUserAdmin } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
]);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo

export async function POST(request: Request) {
  if (!isUserAdmin()) {
    logSecurityEvent({
      action: 'MEDIA_UPLOAD_UNAUTHORIZED',
      status: 'FAILURE',
      actor: 'anonymous',
    });
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const singleFiles = formData.getAll('file') as File[];
    const allFiles = files.length > 0 ? files : singleFiles;

    if (!allFiles || allFiles.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const urls: string[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      if (!file || typeof file === 'string' || !file.name) continue;

      // 1. Validation de l'extension
      const rawExt = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(rawExt)) {
        return NextResponse.json(
          { error: `Type de fichier non autorisé : "${rawExt}". Formats acceptés : JPG, PNG, WEBP, GIF, MP4, WEBM.` },
          { status: 400 }
        );
      }

      // 2. Validation du type MIME
      const mime = file.type?.toLowerCase();
      if (mime && !ALLOWED_MIME_TYPES.has(mime)) {
        return NextResponse.json(
          { error: `Type MIME non autorisé : "${mime}".` },
          { status: 400 }
        );
      }

      // 3. Validation de la taille maximale
      const isVideo = rawExt === '.mp4' || rawExt === '.webm' || mime?.startsWith('video/');
      const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
      if (file.size > maxSize) {
        const maxMb = isVideo ? 50 : 10;
        return NextResponse.json(
          { error: `Le fichier "${file.name}" dépasse la taille maximale autorisée de ${maxMb} Mo.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 4. Génération d'un nom de fichier cryptographiquement sécurisé et imprévisible
      const randomSuffix = crypto.randomBytes(8).toString('hex');
      const uniqueFileName = `${timestamp}-${randomSuffix}${rawExt}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);
      urls.push(`/uploads/${uniqueFileName}`);
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier valide traité.' }, { status: 400 });
    }

    logSecurityEvent({
      action: 'MEDIA_UPLOAD_SUCCESS',
      status: 'SUCCESS',
      actor: 'admin',
      details: { count: urls.length, files: urls },
    });

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
