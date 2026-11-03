import { NextResponse } from 'next/server';
import { isUserAdmin, getAdminCredentials, updateAdminCredentials } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  const creds = getAdminCredentials();
  return NextResponse.json({
    email: creds.email,
  });
}

export async function PUT(request: Request) {
  if (!isUserAdmin()) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const { email, password } = await request.json();

    if (!email || email.trim() === '') {
      return NextResponse.json({ error: 'L\'email administrateur est obligatoire.' }, { status: 400 });
    }

    if (password && password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
    }

    const updated = updateAdminCredentials(email, password);

    return NextResponse.json({
      success: true,
      message: 'Identifiants administrateur mis à jour avec succès.',
      email: updated.email,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des identifiants.' }, { status: 500 });
  }
}

