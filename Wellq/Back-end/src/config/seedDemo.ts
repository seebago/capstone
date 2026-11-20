import { Exam } from '../models/Exam.js';
import { syntheticSeedExams } from '../routes/exams.routes.js';

/**
 * Siembra en MongoDB los mismos exámenes SINTÉTICOS que usa el modo memoria,
 * solo si la colección está vacía y solo si SEED_DEMO_DATA=1.
 *
 * Por qué: con MongoDB conectado, los exámenes 'mem-*' seguían viviendo en la
 * memoria de cada instancia; en Vercel cada instancia tiene su propia copia y
 * el estado (confirmado/validado) se perdía o divergía. Sembrados en Mongo,
 * todas las lecturas y escrituras pasan por la base de datos.
 *
 * Seguro ante instancias concurrentes: clinical_test_id es único, así que un
 * segundo intento de siembra choca (E11000) y se ignora.
 */
export async function seedDemoIfEmpty(): Promise<void> {
  if (process.env.SEED_DEMO_DATA !== '1') return;
  if ((await Exam.estimatedDocumentCount()) > 0) return;
  try {
    // throwOnValidationError: sin esto Mongoose descarta en silencio los documentos inválidos.
    await Exam.insertMany(syntheticSeedExams(), { ordered: false, throwOnValidationError: true });
    console.log('[Seed] Exámenes sintéticos de demo insertados en MongoDB.');
  } catch (err: any) {
    if (err?.code === 11000 || err?.writeErrors?.every?.((e: any) => e.code === 11000)) return;
    console.error('[Seed] No se pudo sembrar MongoDB:', err?.message);
  }
}
