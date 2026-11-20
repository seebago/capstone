/**
 * Entrada serverless para Vercel (Vercel Functions, runtime Node).
 *
 * No cambia la lógica de negocio: envuelve la misma app de src/app.ts y solo
 * agrega lo que el entorno serverless necesita:
 *  - Esperar la conexión a MongoDB ANTES de atender (si existe MONGODB_URI).
 *    Sin esto, en un arranque en frío la primera petición caería al
 *    almacenamiento en memoria mientras Mongo aún conecta.
 *  - Reutilizar esa conexión entre invocaciones de la misma instancia.
 *  - 'trust proxy' para que la auditoría registre la IP real del cliente
 *    (Vercel reescribe X-Forwarded-For; no viene del navegador).
 *
 * En local se sigue usando src/server.ts (npm run dev).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

const app = createApp();
app.set('trust proxy', true);

let dbReady: Promise<void> | null = null;
function ensureDb(): Promise<void> {
  // Sin MONGODB_URI no se intenta conectar: modo memoria (datos sintéticos por instancia).
  if (!process.env.MONGODB_URI) return Promise.resolve();
  if (!dbReady) {
    dbReady = connectDB().catch(() => {
      dbReady = null; // reintentar en la próxima petición
    });
  }
  return dbReady;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureDb();
  return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
