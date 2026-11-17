import crypto from 'crypto';
import mongoose, { Schema, model } from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

/**
 * Registro de auditoría separado de los exámenes (colección `audit_events`).
 *
 * Cinco dimensiones mínimas por entrada:
 *   quién      -> actor_id, actor_role
 *   qué        -> action, resource_id, method, path
 *   cuándo     -> timestamp (ISO, servidor)
 *   desde dónde-> ip, user_agent, client_id (tenant del actor)
 *   resultado  -> outcome (success | denied | failure), status_code
 *
 * ALCANCE HONESTO (simplificación pendiente, no es inmutabilidad real):
 * - Es append-only SOLO a nivel de esta aplicación: el módulo no expone
 *   update/delete, el modelo Mongoose rechaza updates/deletes y en memoria
 *   cada entrada queda congelada (Object.freeze).
 * - Quien tenga credenciales de escritura directas sobre MongoDB puede
 *   alterar o borrar la colección. Para inmutabilidad real faltan: usuario
 *   de BD con permiso solo de inserción, encadenamiento por hash (prev_hash)
 *   o almacenamiento WORM, y outbox transaccional (A-08, condicionada a ST-007).
 * - Si falla la escritura de auditoría, hoy se registra el error en consola
 *   y la operación sigue (fail-open). Un sistema clínico real debería fallar
 *   cerrado. Pendiente de decisión del equipo.
 * - En modo memoria (sin MongoDB) el registro se pierde al reiniciar.
 *
 * El campo `audit_trail` dentro de cada examen se mantiene solo como
 * historial visible para la interfaz (línea de tiempo); NO es la fuente
 * de auditoría.
 */
export type AuditOutcome = 'success' | 'denied' | 'failure';

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  actor_id: string;
  actor_role: string;
  client_id: string | null;
  action: string;
  resource_id: string | null;
  method: string;
  path: string;
  ip: string | null;
  user_agent: string | null;
  outcome: AuditOutcome;
  status_code: number;
}

const AuditEventSchema = new Schema<AuditEvent>(
  {
    event_id: { type: String, required: true, unique: true },
    timestamp: { type: String, required: true, index: true },
    actor_id: { type: String, required: true },
    actor_role: { type: String, required: true },
    client_id: { type: String, default: null, index: true },
    action: { type: String, required: true },
    resource_id: { type: String, default: null },
    method: { type: String, required: true },
    path: { type: String, required: true },
    ip: { type: String, default: null },
    user_agent: { type: String, default: null },
    outcome: { type: String, enum: ['success', 'denied', 'failure'], required: true },
    status_code: { type: Number, required: true },
  },
  { collection: 'audit_events', versionKey: false }
);

function rejectMutation(this: unknown) {
  throw new Error('audit_events es append-only: no se permite modificar ni borrar');
}
for (const op of [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'replaceOne',
  'findOneAndReplace',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
] as const) {
  AuditEventSchema.pre(op as any, rejectMutation);
}
AuditEventSchema.pre('save', function (next) {
  if (!this.isNew) return next(new Error('audit_events es append-only: no se permite modificar'));
  next();
});

const AuditEventModel = model<AuditEvent>('AuditEvent', AuditEventSchema);

const memoryLog: AuditEvent[] = [];

export async function appendAudit(event: Omit<AuditEvent, 'event_id' | 'timestamp'>): Promise<void> {
  const entry: AuditEvent = Object.freeze({
    event_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...event,
  });
  if (mongoose.connection.readyState === 1) {
    try {
      await AuditEventModel.create(entry);
      return;
    } catch (err) {
      console.error('[Audit] No se pudo escribir en MongoDB, se guarda en memoria:', (err as Error).message);
    }
  }
  memoryLog.push(entry);
}

/** Copia de solo lectura del registro en memoria (para pruebas y diagnóstico local). */
export function readMemoryAudit(): readonly AuditEvent[] {
  return memoryLog.slice();
}

function outcomeFor(status: number): AuditOutcome {
  if (status < 400) return 'success';
  if (status === 401 || status === 403 || status === 404) return 'denied';
  return 'failure';
}

/**
 * Middleware: registra una entrada por cada request bajo /api/auth y /api/exams
 * al terminar la respuesta, incluidos los rechazos (401/403/404).
 * Las rutas pueden precisar la acción con res.locals.auditAction y
 * res.locals.auditResourceId; si no, se usa método + ruta.
 */
export function auditRequests(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => {
    const auth = req.auth;
    const routePath = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.originalUrl.split('?')[0];
    void appendAudit({
      actor_id: auth?.user_id ?? (res.locals.auditActor as string | undefined) ?? 'anonymous',
      actor_role: auth?.role ?? 'anonymous',
      client_id: auth?.client_id ?? (res.locals.auditClientId as string | undefined) ?? null,
      action: (res.locals.auditAction as string | undefined) ?? `${req.method} ${routePath}`,
      resource_id: (res.locals.auditResourceId as string | undefined) ?? null,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      ip: req.ip ?? req.socket.remoteAddress ?? null,
      user_agent: (req.headers['user-agent'] as string | undefined) ?? null,
      outcome: outcomeFor(res.statusCode),
      status_code: res.statusCode,
    });
  });
  next();
}
