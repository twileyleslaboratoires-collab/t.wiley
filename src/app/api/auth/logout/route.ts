import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/audit';

export async function POST() {
  logSecurityEvent({
    action: 'ADMIN_LOGOUT',
    status: 'SUCCESS',
    actor: 'admin',
  });

  const response = NextResponse.json({ success: true, message: 'Déconnexion effectuée.' });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
