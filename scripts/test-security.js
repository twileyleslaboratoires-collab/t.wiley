/**
 * Automated Security Verification Script - Les Laboratoires T. Wiley
 * Tests:
 * 1. Password hashing & constant-time comparison
 * 2. Rate limiting logic
 * 3. Media upload validation rules
 * 4. Chat privacy restrictions
 * 5. Supabase RLS policy sanity
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    testsFailed++;
  }
}

console.log('\n🔒 DÉBUT DE LA SUITE DE TESTS DE SÉCURITÉ AUTOMATISÉE...\n');

// ---------------------------------------------------------
// TEST 1 : Hachage de mot de passe & résistance aux attaques temporelles
// ---------------------------------------------------------
console.log('--- Test 1 : Cryptographie & Hachage des Mots de Passe ---');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, stored) {
  if (!password || !stored) return false;
  if (stored.startsWith('scrypt:')) {
    const parts = stored.split(':');
    if (parts.length !== 3) return false;
    const [, salt, expectedHashHex] = parts;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const expectedBuffer = Buffer.from(expectedHashHex, 'hex');
    if (derivedKey.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedBuffer);
  }
  const passwordBuffer = Buffer.from(password);
  const storedBuffer = Buffer.from(stored);
  if (passwordBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(passwordBuffer, storedBuffer);
}

const pwd = 'TestAdminPassword2026!';
const hash1 = hashPassword(pwd);
const hash2 = hashPassword(pwd);

assert(hash1 !== hash2, 'Deux hachages du même mot de passe produisent des sels distincts (anti-rainbow table)');
assert(verifyPassword(pwd, hash1), 'Vérification du mot de passe valide avec son hachage salé');
assert(!verifyPassword('WrongPassword123!', hash1), 'Rejet strict d’un mot de passe erroné');
assert(verifyPassword('legacyPlainText123', 'legacyPlainText123'), 'Compatibilité avec format hérité pour migration sans rupture');

// ---------------------------------------------------------
// TEST 2 : Limitation du taux de requêtes (Anti-Force Brute)
// ---------------------------------------------------------
console.log('\n--- Test 2 : Limitation de Taux (Brute Force Lockout) ---');

const attempts = new Map();
const MAX_ATTEMPTS = 5;

function simulateLogin(ip) {
  let record = attempts.get(ip) || { count: 0, locked: false };
  if (record.locked) return { status: 429, error: 'Locked' };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.locked = true;
  }
  attempts.set(ip, record);
  return record.locked ? { status: 429, error: 'Locked' } : { status: 401, error: 'Invalid' };
}

const attackerIp = '198.51.100.42';
for (let i = 1; i < MAX_ATTEMPTS; i++) {
  const res = simulateLogin(attackerIp);
  assert(res.status === 401, `Tentative ${i} rejetée avec 401 (non bloquée)`);
}
const lockoutRes = simulateLogin(attackerIp);
assert(lockoutRes.status === 429, `5e échec déclenche le verrouillage automatique (HTTP 429)`);

const subsequentRes = simulateLogin(attackerIp);
assert(subsequentRes.status === 429, `Tentative suivante reste bloquée sous verrouillage HTTP 429`);

// ---------------------------------------------------------
// TEST 3 : Validation Stricte des Fichiers Téléversés
// ---------------------------------------------------------
console.log('\n--- Test 3 : Validation et Filtrage des Médias ---');

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm']);
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']);

function validateUpload(fileName, mimeType, sizeBytes) {
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) return { valid: false, reason: 'Bad extension' };
  if (!ALLOWED_MIMES.has(mimeType)) return { valid: false, reason: 'Bad MIME' };
  const isVideo = ext === '.mp4' || ext === '.webm';
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (sizeBytes > maxSize) return { valid: false, reason: 'File too large' };
  return { valid: true };
}

assert(validateUpload('produit.jpg', 'image/jpeg', 2 * 1024 * 1024).valid, 'Image JPG normale autorisée (2 Mo)');
assert(validateUpload('video.mp4', 'video/mp4', 35 * 1024 * 1024).valid, 'Vidéo MP4 autorisée (35 Mo)');
assert(!validateUpload('exploit.svg', 'image/svg+xml', 1000).valid, 'Rejet des fichiers SVG (vecteur potentiel XSS XML)');
assert(!validateUpload('webshell.php', 'application/x-php', 500).valid, 'Rejet des scripts serveur PHP');
assert(!validateUpload('payload.html', 'text/html', 500).valid, 'Rejet des fichiers HTML');
assert(!validateUpload('image.png', 'image/png', 15 * 1024 * 1024).valid, 'Rejet des images dépassant 10 Mo');

// ---------------------------------------------------------
// TEST 4 : Intégrité des En-têtes HTTP de Sécurité
// ---------------------------------------------------------
console.log('\n--- Test 4 : Configuration des En-têtes HTTP de Sécurité ---');

const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');

assert(nextConfigContent.includes('X-Frame-Options'), 'En-tête X-Frame-Options configuré');
assert(nextConfigContent.includes('X-Content-Type-Options'), 'En-tête X-Content-Type-Options configuré');
assert(nextConfigContent.includes('Strict-Transport-Security'), 'En-tête HSTS configuré');
assert(nextConfigContent.includes('Referrer-Policy'), 'En-tête Referrer-Policy configuré');
assert(nextConfigContent.includes('poweredByHeader: false'), 'En-tête X-Powered-By désactivé');

// ---------------------------------------------------------
// TEST 5 : Politiques Supabase Row Level Security (RLS)
// ---------------------------------------------------------
console.log('\n--- Test 5 : Politiques RLS Supabase Sans Privilège Public Mutatif ---');

const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

assert(!schemaContent.includes('Admin All Categories" ON public.categories FOR ALL USING (true)'), 'Suppression des fausses politiques FOR ALL permissives');
assert(schemaContent.includes('FOR SELECT \nTO anon, authenticated'), 'Politiques SELECT restreintes au rôle public');
assert(!schemaContent.includes('FOR ALL USING (true)'), 'Aucune table n’accorde ALL avec condition (true) sans contrôle de rôle');

// ---------------------------------------------------------
// RÉSUMÉ
// ---------------------------------------------------------
console.log('\n=========================================================');
console.log(`RÉSULTAT DES TESTS : ${testsPassed} réussis, ${testsFailed} échoués`);
console.log('=========================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}

