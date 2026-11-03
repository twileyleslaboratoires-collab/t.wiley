import { NextResponse } from 'next/server';
import { verifyAdminLogin, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!verifyAdminLogin(email, password)) {
      return NextResponse.json(
        { error: 'Email ou mot de passe administrateur incorrect.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(email || 'admin@laboratoires-twiley.ci');
    const response = NextResponse.json({ success: true, message: 'Connexion réussie.' });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion.' },
      { status: 500 }
    );
  }
}
