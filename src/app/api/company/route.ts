import { NextResponse } from 'next/server';
import { getLiveCompanyInfo, updateLiveCompanyInfo } from '@/lib/company';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const info = await getLiveCompanyInfo();
  return NextResponse.json(info);
}

export async function PUT(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const updatedInfo = await request.json();
    const saved = await updateLiveCompanyInfo(updatedInfo);
    return NextResponse.json({ success: true, companyInfo: saved });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations.' },
      { status: 500 }
    );
  }
}
