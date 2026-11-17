import crypto from 'crypto';
import type { AuthClaims } from './jwt.js';

/**
 * Usuarios DEMO sintéticos (entorno de evaluación, sin pacientes reales).
 * No es un sistema de identidad: no hay registro, recuperación ni hashing
 * porque no hay credenciales reales que proteger. La seguridad que aporta
 * este cambio está en que el servidor firma el rol y el tenant, y luego
 * los exige en cada ruta; no en la contraseña.
 *
 * La contraseña demo es la misma para todos y se puede cambiar con
 * DEMO_PASSWORD. Dos tenants (alpha y beta) para probar aislamiento.
 */
export interface DemoUser extends AuthClaims {
  username: string;
  display_name: string;
}

export const DEMO_USERS: readonly DemoUser[] = Object.freeze([
  { username: 'paciente.alpha', user_id: 'patient-001', role: 'patient', client_id: 'clinic-alpha', display_name: 'Paciente Alpha (ficticio)' },
  { username: 'clinico.alpha', user_id: 'clinician-001', role: 'clinician', client_id: 'clinic-alpha', display_name: 'Clínico Alpha (ficticio)' },
  { username: 'paciente.beta', user_id: 'patient-101', role: 'patient', client_id: 'clinic-beta', display_name: 'Paciente Beta (ficticio)' },
  { username: 'clinico.beta', user_id: 'clinician-101', role: 'clinician', client_id: 'clinic-beta', display_name: 'Clínico Beta (ficticio)' },
]);

export const DEFAULT_DEMO_PASSWORD = 'wellq-demo';

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function authenticateDemoUser(username: unknown, password: unknown): DemoUser | null {
  if (typeof username !== 'string' || typeof password !== 'string') return null;
  const expected = process.env.DEMO_PASSWORD || DEFAULT_DEMO_PASSWORD;
  const user = DEMO_USERS.find((u) => u.username === username.trim().toLowerCase());
  // Se compara siempre (aunque el usuario no exista) para no filtrar por tiempo.
  const ok = safeEqual(password, expected);
  return user && ok ? user : null;
}
