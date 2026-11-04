import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isUserAdmin } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/audit';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/ogg',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
  '.avif',
  '.mp4',
  '.webm',
  '.mov',
  '.avi',
  '.ogv',
]);

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Mo
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

    const timestamp = Date.now();
    const supabaseClient = isSupabaseConfigured() ? getServiceSupabase() : null;

    // Traitement simultané (en parallèle) de tous les fichiers pour une vitesse maximale
    const uploadPromises = allFiles.map(async (file, index) => {
      if (!file || typeof file === 'string' || !file.name) return null;

      // 1. Validation de l'extension
      const rawExt = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(rawExt)) {
        throw new Error(
          `Format de fichier non autorisé : "${rawExt}". Formats acceptés : JPG, PNG, WEBP, GIF, MP4, WEBM, MOV.`
        );
      }

      // 2. Validation du type MIME
      const mime = file.type?.toLowerCase();
      if (mime && !ALLOWED_MIME_TYPES.has(mime) && !mime.startsWith('image/') && !mime.startsWith('video/')) {
        throw new Error(`Type MIME non autorisé : "${mime}".`);
      }

      // 3. Validation de la taille maximale
      const isVideo =
        rawExt === '.mp4' ||
        rawExt === '.webm' ||
        rawExt === '.mov' ||
        rawExt === '.avi' ||
        rawExt === '.ogv' ||
        mime?.startsWith('video/');

      const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
      if (file.size > maxSize) {
        const maxMb = isVideo ? 50 : 15;
        throw new Error(
          `Le fichier "${file.name}" dépasse la taille maximale autorisée de ${maxMb} Mo.`
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 4. Génération d'un nom de fichier unique et sécurisé
      const randomSuffix = crypto.randomBytes(8).toString('hex');
      const uniqueFileName = `${timestamp}-${index}-${randomSuffix}${rawExt}`;
      let fileUrl = '';

      // Priorité 1 : Stockage Cloud Supabase (permanent, CDN haute vitesse mondial)
      if (supabaseClient) {
        try {
          const effectiveMime = mime || (isVideo ? 'video/mp4' : 'image/jpeg');
          const { error: uploadError } = await supabaseClient.storage
            .from('uploads')
            .upload(uniqueFileName, buffer, {
              contentType: effectiveMime,
              cacheControl: '31536000',
              upsert: true,
            });

          if (!uploadError) {
            const { data: pubData } = supabaseClient.storage.from('uploads').getPublicUrl(uniqueFileName);
            if (pubData?.publicUrl) {
              fileUrl = pubData.publicUrl;
            }
          } else {
            console.warn('Erreur téléversement Supabase Storage:', uploadError);
          }
        } catch (supaErr) {
          console.warn('Exception Supabase Storage:', supaErr);
        }
      }

      // Priorité 2 : Stockage fichier local (environnement local / développement)
      if (!fileUrl) {
        try {
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const filePath = path.join(uploadsDir, uniqueFileName);
          fs.writeFileSync(filePath, buffer);
          fileUrl = `/uploads/${uniqueFileName}`;
        } catch (fsErr) {
          console.warn('Écriture disque public/uploads impossible (système en lecture seule):', fsErr);

          // Si Vercel sans Supabase Storage pour de petites images (< 500 Ko)
          if (!isVideo && buffer.length <= 500 * 1024) {
            const effectiveMime = mime || 'image/jpeg';
            fileUrl = `data:${effectiveMime};base64,${buffer.toString('base64')}`;
          } else {
            throw new Error(
              "Impossible d'enregistrer le fichier sur le stockage. Veuillez vérifier la connexion."
            );
          }
        }
      }

      return fileUrl;
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.filter((u): u is string => Boolean(u));

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier valide n’a pu être traité.' }, { status: 400 });
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
  } catch (error: any) {
    console.error('Erreur upload:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de l’enregistrement du fichier.' },
      { status: 500 }
    );
  }
}
