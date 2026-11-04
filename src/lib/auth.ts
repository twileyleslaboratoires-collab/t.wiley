import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getDatabase, saveDatabase } from './storage';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@laboratoires-twiley.ci';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'twiley_secure_super_random_session_key_production_2026';
const COOKIE_NAME = 'admin_session_token';

/**
 * Hache un mot de passe avec un sel cryptographique aléatoire de 16 octets via scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Vérifie un mot de passe en temps constant contre un hachage salé ou un mot de passe brut hérité
 */
export function verifyPassword(password?: string, storedHashOrPlain?: string): boolean {
  if (!password || !storedHashOrPlain) return false;

  // Format sécurisé scrypt:salt:hash
  if (storedHashOrPlain.startsWith('scrypt:')) {
    const parts = storedHashOrPlain.split(':');
    if (parts.length !== 3) return false;
    const [, salt, expectedHashHex] = parts;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const expectedBuffer = Buffer.from(expectedHashHex, 'hex');

    if (derivedKey.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  }

  // Format hérité en texte brut (pour compatibilité ascendante avec auto-migration)
  const passwordBuffer = Buffer.from(password);
  const storedBuffer = Buffer.from(storedHashOrPlain);
  if (passwordBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(passwordBuffer, storedBuffer);
}

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

  const receivedBuffer = Buffer.from(receivedHmac);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

/**
 * Récupère les identifiants administrateur actuels
 */
export function getAdminCredentials() {
  const envEmail = process.env.ADMIN_EMAIL?.trim();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  try {
    const db = getDatabase();
    const creds = db.adminCredentials || {
      email: envEmail || DEFAULT_ADMIN_EMAIL,
      password: envPassword || DEFAULT_ADMIN_PASSWORD,
    };

    if (envEmail && creds.email !== envEmail.toLowerCase()) {
      creds.email = envEmail.toLowerCase();
    }

    return creds;
  } catch {
    return {
      email: envEmail || DEFAULT_ADMIN_EMAIL,
      password: envPassword || DEFAULT_ADMIN_PASSWORD,
    };
  }
}

/**
 * Met à jour les identifiants administrateur en hachant systématiquement le nouveau mot de passe
 */
export function updateAdminCredentials(email: string, password?: string) {
  const db = getDatabase();
  const current = db.adminCredentials || {
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  };

  let newPassword = current.password;
  if (password && password.trim()) {
    newPassword = hashPassword(password.trim());
  }

  db.adminCredentials = {
    email: email.trim().toLowerCase(),
    password: newPassword,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return {
    email: db.adminCredentials.email,
    updatedAt: db.adminCredentials.updatedAt,
  };
}

/**
 * Vérifie l'email et le mot de passe administrateur en reconnaissant impérativement le mot de passe configuré dans le fichier local
 */
export function verifyAdminLogin(email?: string, password?: string): boolean {
  if (!password) return false;

  const creds = getAdminCredentials();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  const inputPassword = password.trim();

  // 1. Priorité absolue : mot de passe configuré dans le fichier local (.env.local / variables d'environnement)
  let isPasswordValid = false;
  if (envPassword) {
    isPasswordValid =
      verifyPassword(inputPassword, envPassword) ||
      inputPassword === envPassword;
  }

  // 2. Vérification alternative : mot de passe enregistré en base
  if (!isPasswordValid && creds.password) {
    isPasswordValid =
      verifyPassword(inputPassword, creds.password) ||
      inputPassword === creds.password;
  }

  // 3. Fallback mot de passe par défaut si rien n'est renseigné
  if (!isPasswordValid && !envPassword) {
    isPasswordValid = verifyPassword(inputPassword, DEFAULT_ADMIN_PASSWORD);
  }

  if (!isPasswordValid) return false;

  const envEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();

  // Si un email est fourni dans le formulaire de connexion, vérifier la correspondance
  if (email && email.trim() !== '') {
    const normEmail = email.trim().toLowerCase();
    const isEmailValid =
      normEmail === envEmail ||
      normEmail === (creds.email || '').toLowerCase().trim() ||
      normEmail === 'twileyleslaboratoires@gmail.com' ||
      normEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      normEmail === 'admin';

    if (!isEmailValid) return false;
  }

  return true;
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
