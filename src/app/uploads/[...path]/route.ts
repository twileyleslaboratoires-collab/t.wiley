import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
};

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } | Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawPath = Array.isArray(resolvedParams?.path) ? resolvedParams.path.join('/') : '';
    const decodedPath = decodeURIComponent(rawPath);
    // Sécurisation contre path traversal
    const safePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(process.cwd(), 'public', 'uploads', safePath);

    // 1. Tenter la lecture locale
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': stat.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 2. Si absent sur le disque local, rediriger vers Supabase Storage si configuré
    if (isSupabaseConfigured()) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(safePath);
        if (pubData?.publicUrl) {
          return NextResponse.redirect(pubData.publicUrl, { status: 302 });
        }
      }
    }

    return new NextResponse('Fichier introuvable', { status: 404 });
  } catch (error) {
    console.error('Erreur lecture upload:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
