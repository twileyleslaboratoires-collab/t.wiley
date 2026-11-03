import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/storage';
import { isUserAdmin } from '@/lib/auth';
import { sanitizeWhatsAppNumber } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.companyInfo);
}

export async function PUT(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const updatedInfo = await request.json();
    const db = getDatabase();

    // Nettoyage et formatage du numéro WhatsApp
    if (updatedInfo.whatsappNumber) {
      updatedInfo.whatsappNumber = sanitizeWhatsAppNumber(updatedInfo.whatsappNumber);
    }

    db.companyInfo = {
      ...db.companyInfo,
      ...updatedInfo,
    };

    saveDatabase(db);
    revalidatePath('/', 'layout');
    revalidatePath('/a-propos');
    return NextResponse.json({ success: true, companyInfo: db.companyInfo });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations.' },
      { status: 500 }
    );
  }
}
