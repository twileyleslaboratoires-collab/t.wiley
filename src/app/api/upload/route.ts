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

/**
 * Assure que le bucket de stockage public 'uploads' existe dans Supabase
 */
let bucketChecked = false;
async function ensureSupabaseBucket(supabase: any) {
  if (bucketChecked) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const hasBucket = (buckets || []).some((b: any) => b.name === 'uploads');
    if (!hasBucket) {
      await supabase.storage.createBucket('uploads', {
        public: true,
        fileSizeLimit: MAX_VIDEO_SIZE_BYTES,
      });
    }
    bucketChecked = true;
  } catch (err) {
    console.warn('Avertissement vérification bucket Supabase:', err);
  }
}

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

    const urls: string[] = [];
    const timestamp = Date.now();
    const supabaseClient = isSupabaseConfigured() ? getServiceSupabase() : null;

    if (supabaseClient) {
      await ensureSupabaseBucket(supabaseClient);
    }

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      if (!file || typeof file === 'string' || !file.name) continue;

      // 1. Validation de l'extension
      const rawExt = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(rawExt)) {
        return NextResponse.json(
          { error: `Format de fichier non autorisé : "${rawExt}". Formats acceptés : JPG, PNG, WEBP, GIF, MP4, WEBM, MOV.` },
          { status: 400 }
        );
      }

      // 2. Validation du type MIME
      const mime = file.type?.toLowerCase();
      if (mime && !ALLOWED_MIME_TYPES.has(mime) && !mime.startsWith('image/') && !mime.startsWith('video/')) {
        return NextResponse.json(
          { error: `Type MIME non autorisé : "${mime}".` },
          { status: 400 }
        );
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
        return NextResponse.json(
          { error: `Le fichier "${file.name}" dépasse la taille maximale autorisée de ${maxMb} Mo.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 4. Génération d'un nom de fichier unique et sécurisé
      const randomSuffix = crypto.randomBytes(8).toString('hex');
      const uniqueFileName = `${timestamp}-${randomSuffix}${rawExt}`;
      let fileUrl = '';

      // Priorité 1 : Stockage Cloud Supabase (permanent, résistant aux redémarrages Vercel et CDN haute vitesse)
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
          console.warn('Écriture disque public/uploads impossible (système de fichiers en lecture seule):', fsErr);

          // Priorité 3 : Repli Base64 inline pour images < 4 Mo si Vercel est déployé sans Supabase Storage
          if (!isVideo && buffer.length <= 4 * 1024 * 1024) {
            const effectiveMime = mime || 'image/jpeg';
            fileUrl = `data:${effectiveMime};base64,${buffer.toString('base64')}`;
          } else {
            throw new Error(
              "Impossible d'enregistrer le fichier sur le stockage. Veuillez vérifier la connexion Supabase ou utiliser un fichier plus compact."
            );
          }
        }
      }

      if (fileUrl) {
        urls.push(fileUrl);
      }
    }

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
