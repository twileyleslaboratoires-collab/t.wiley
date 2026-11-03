interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes de blocage

/**
 * Nettoyage périodique de la mémoire
 */
setInterval(() => {
  const now = Date.now();
  loginAttempts.forEach((record, key) => {
    if (record.lockedUntil && record.lockedUntil < now) {
      loginAttempts.delete(key);
    } else if (now - record.firstAttempt > WINDOW_MS && !record.lockedUntil) {
      loginAttempts.delete(key);
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
  retryAfterSeconds?: number;
}

/**
 * Vérifie et incrémente les tentatives de connexion pour une IP / identifiant
 */
export function checkLoginRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }

  // Si le compte/IP est actuellement verrouillé
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil,
      retryAfterSeconds,
    };
  }

  // Si la fenêtre de temps a expiré, réinitialiser
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(identifier);
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
  };
}

/**
 * Enregistre un échec de connexion
 */
export function recordFailedLogin(identifier: string): RateLimitResult {
  const now = Date.now();
  let record = loginAttempts.get(identifier);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    record = {
      count: 1,
      firstAttempt: now,
    };
  } else {
    record.count += 1;
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    loginAttempts.set(identifier, record);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil,
      retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  loginAttempts.set(identifier, record);
  return {
    allowed: true,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.count,
  };
}

/**
 * Réinitialise le compteur après une connexion réussie
 */
export function resetLoginRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}
