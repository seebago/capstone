import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export type Role = 'patient' | 'clinician';

/** Claims que el backend firma y luego exige. client_id sale SOLO de aquí. */
export interface AuthClaims {
  user_id: string;
  role: Role;
  client_id: string;
}

const ISSUER = 'wellq-demo';
const EXPIRES_IN = '2h';

let cachedSecret: string | null = null;

/**
 * JWT_SECRET viene del entorno (.env, nunca versionado).
 * En desarrollo, si falta, se genera uno aleatorio por proceso: los tokens
 * dejan de servir al reiniciar el servidor, lo que es aceptable en la demo.
 * En producción, sin JWT_SECRET el servidor no arranca.
 */
function getSecret(): string {
  if (cachedSecret) return cachedSecret;
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.length >= 32) {
    cachedSecret = fromEnv;
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET ausente o menor a 32 caracteres en producción');
  } else {
    if (fromEnv) console.warn('[Auth] JWT_SECRET demasiado corto (<32); se usa uno aleatorio.');
    else console.warn('[Auth] JWT_SECRET no definido; se usa uno aleatorio por proceso (solo dev).');
    cachedSecret = crypto.randomBytes(48).toString('hex');
  }
  return cachedSecret;
}

export function signToken(claims: AuthClaims): string {
  return jwt.sign(
    { user_id: claims.user_id, role: claims.role, client_id: claims.client_id },
    getSecret(),
    { algorithm: 'HS256', expiresIn: EXPIRES_IN, issuer: ISSUER, subject: claims.user_id }
  );
}

/** Devuelve los claims si el token es válido; null si no. Nunca lanza. */
export function verifyToken(token: string): AuthClaims | null {
  try {
    const payload = jwt.verify(token, getSecret(), { algorithms: ['HS256'], issuer: ISSUER });
    if (typeof payload !== 'object' || payload === null) return null;
    const { user_id, role, client_id } = payload as Record<string, unknown>;
    if (typeof user_id !== 'string' || typeof client_id !== 'string') return null;
    if (role !== 'patient' && role !== 'clinician') return null;
    return { user_id, role, client_id };
  } catch {
    return null;
  }
}
