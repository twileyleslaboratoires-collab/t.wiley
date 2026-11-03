import { NextResponse } from 'next/server';
import { isUserAdmin, getAdminCredentials, updateAdminCredentials } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/audit';

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
    logSecurityEvent({
      action: 'ADMIN_CREDENTIALS_UNAUTHORIZED_CHANGE_ATTEMPT',
      status: 'FAILURE',
      actor: 'anonymous',
    });
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  try {
    const { email, password } = await request.json();

    if (!email || email.trim() === '' || !email.includes('@')) {
      return NextResponse.json({ error: 'Un email administrateur valide est obligatoire.' }, { status: 400 });
    }

    if (password && password.trim().length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }

    const updated = updateAdminCredentials(email, password);

    logSecurityEvent({
      action: 'ADMIN_CREDENTIALS_UPDATED',
      status: 'SUCCESS',
      actor: 'admin',
      details: { email: updated.email, passwordChanged: Boolean(password) },
    });

    return NextResponse.json({
      success: true,
      message: 'Identifiants administrateur mis à jour et protégés par hachage scrypt.',
      email: updated.email,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des identifiants.' }, { status: 500 });
  }
}
