import fs from 'fs';
import path from 'path';

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  actor: string;
  ip?: string;
  details?: Record<string, any>;
}

const AUDIT_LOG_FILE = path.join(process.cwd(), 'data', 'audit.log');

/**
 * Enregistre un événement de sécurité dans le journal d'audit
 */
export function logSecurityEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const fullEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Ne jamais consigner de mots de passe ou tokens dans les détails
  if (fullEntry.details) {
    const sanitized = { ...fullEntry.details };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    fullEntry.details = sanitized;
  }

  const logLine = `[${fullEntry.timestamp}] [${fullEntry.status}] [${fullEntry.action}] Actor=${fullEntry.actor} IP=${fullEntry.ip || 'unknown'} Details=${JSON.stringify(fullEntry.details || {})}\n`;

  try {
    const dir = path.dirname(AUDIT_LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(AUDIT_LOG_FILE, logLine, 'utf-8');
  } catch (err) {
    console.error('Audit log write failure:', err);
  }

  if (fullEntry.status === 'FAILURE') {
    console.warn(`[SECURITY ALERT] ${logLine.trim()}`);
  } else {
    console.info(`[SECURITY AUDIT] ${logLine.trim()}`);
  }
}

