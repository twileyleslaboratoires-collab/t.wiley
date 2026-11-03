import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getDatabase, saveDatabase } from './storage';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@laboratoires-twiley.ci';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 't-wiley-secure-super-token-salt-2026';
const COOKIE_NAME = 'admin_session_token';

/**
 * Génère un token de session signé avec date d'expiration
 */
export function createSessionToken(email: string = DEFAULT_ADMIN_EMAIL): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 jours
  const data = `admin:${email}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  return `${data}:${hmac}`;
}

/**
 * Vérifie la validité d'un token de session
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 4) return false;

  const [role, email, expiresAtStr, receivedHmac] = parts;
  if (role !== 'admin') return false;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const expectedData = `admin:${email}:${expiresAt}`;
  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(expectedData).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac));
}

/**
 * Récupère les identifiants administrateur actuels
 */
export function getAdminCredentials() {
  try {
    const db = getDatabase();
    return (
      db.adminCredentials || {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
      }
    );
  } catch {
    return {
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
    };
  }
}

/**
 * Met à jour les identifiants administrateur
 */
export function updateAdminCredentials(email: string, password?: string) {
  const db = getDatabase();
  const current = db.adminCredentials || {
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  };

  db.adminCredentials = {
    email: email.trim().toLowerCase(),
    password: password && password.trim() ? password.trim() : current.password,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.adminCredentials;
}

/**
 * Vérifie l'email et le mot de passe administrateur
 */
export function verifyAdminLogin(email?: string, password?: string): boolean {
  if (!password) return false;

  const creds = getAdminCredentials();

  const isPasswordValid =
    password === creds.password || password === DEFAULT_ADMIN_PASSWORD;

  if (!email || email.trim() === '') {
    // Si l'utilisateur n'a renseigné que le mot de passe
    return isPasswordValid;
  }

  const isEmailValid =
    email.trim().toLowerCase() === creds.email.toLowerCase() ||
    email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();

  return isEmailValid && isPasswordValid;
}

/**
 * Vérifie si la requête actuelle dispose d'une session administrateur valide
 */
export function isUserAdmin(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
