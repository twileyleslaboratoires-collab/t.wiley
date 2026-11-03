import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminLogin, createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from '@/lib/rateLimit';
import { logSecurityEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const { email, password } = await request.json();
    const rateLimitKey = `${ip}:${(email || 'admin').toLowerCase().trim()}`;

    // 1. Contrôle anti force brute
    const rateCheck = checkLoginRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      logSecurityEvent({
        action: 'ADMIN_LOGIN_LOCKED',
        status: 'WARNING',
        actor: email || 'unknown',
        ip,
        details: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });

      return NextResponse.json(
        {
          error: `Trop de tentatives échouées. Compte temporairement verrouillé pour ${Math.ceil((rateCheck.retryAfterSeconds || 900) / 60)} minute(s).`,
          locked: true,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds || 900),
          },
        }
      );
    }

    // 2. Vérification des identifiants
    const isValid = verifyAdminLogin(email, password);

    if (!isValid) {
      const failResult = recordFailedLogin(rateLimitKey);

      logSecurityEvent({
        action: 'ADMIN_LOGIN_FAILED',
        status: 'FAILURE',
        actor: email || 'unknown',
        ip,
        details: { remainingAttempts: failResult.remainingAttempts },
      });

      const message =
        failResult.remainingAttempts > 0
          ? `Identifiants incorrects. ${failResult.remainingAttempts} tentative(s) restante(s).`
          : 'Trop de tentatives échouées. Accès temporairement suspendu.';

      return NextResponse.json(
        { error: message, remainingAttempts: failResult.remainingAttempts },
        { status: 401 }
      );
    }

    // 3. Succès : Réinitialisation du limiteur et création du token
    resetLoginRateLimit(rateLimitKey);

    const adminEmail = email || process.env.ADMIN_EMAIL || 'admin@laboratoires-twiley.ci';

    logSecurityEvent({
      action: 'ADMIN_LOGIN_SUCCESS',
      status: 'SUCCESS',
      actor: adminEmail,
      ip,
    });

    const token = createSessionToken(adminEmail);
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
    logSecurityEvent({
      action: 'ADMIN_LOGIN_ERROR',
      status: 'FAILURE',
      actor: 'system',
      ip,
    });

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion.' },
      { status: 500 }
    );
  }
}
