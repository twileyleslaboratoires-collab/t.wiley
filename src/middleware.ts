import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session_token';
const SESSION_SECRET = process.env.SESSION_SECRET || 'twiley_secure_super_random_session_key_production_2026';

/**
 * Vérification cryptographique HMAC-SHA256 compatible Edge Runtime
 */
async function verifySessionTokenEdge(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 4) return false;

  const [role, email, expiresAtStr, receivedHmac] = parts;
  if (role !== 'admin') return false;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  try {
    const expectedData = `admin:${email}:${expiresAt}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(expectedData));
    const expectedHmac = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return receivedHmac === expectedHmac;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isGestionnaireRoute = pathname.startsWith('/gestionnaire');
  const isAdminRoute = pathname.startsWith('/admin');

  // Si ce n'est pas une route de gestionnaire ou admin, laisser passer
  if (!isGestionnaireRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/gestionnaire/login' || pathname === '/admin/login';
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionTokenEdge(token);

  // Si l'utilisateur est sur la page de connexion
  if (isLoginPage) {
    // S'il est déjà connecté, redirection vers son espace
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/gestionnaire', request.url));
    }
    // Sinon, accès libre à la page de connexion
    return NextResponse.next();
  }

  // Pour TOUT l'espace gestionnaire / admin, connexion OBLIGATOIRE
  if (!isAuthenticated) {
    const loginUrl = new URL('/gestionnaire/login', request.url);
    if (pathname !== '/gestionnaire') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/gestionnaire/:path*',
    '/admin/:path*',
  ],
};

