/**
 * Deja los exámenes SINTÉTICOS de la demo en su estado inicial en MongoDB
 * (p. ej. la mañana de la presentación, después de haber probado el flujo).
 *
 * - Borra solo exámenes de los tenants sintéticos (clinic-alpha, clinic-beta),
 *   incluidos los subidos durante pruebas, y vuelve a sembrar los 5 iniciales.
 * - NO toca audit_events: la auditoría es append-only y se conserva.
 *
 * Uso (la URI se copia desde Atlas o desde Vercel > Storage; no se guarda en el repo):
 *   MONGODB_URI='mongodb+srv://...' npm run reset-demo -- --yes
 */
import mongoose from 'mongoose';
import { Exam } from '../src/models/Exam.js';
import { syntheticSeedExams } from '../src/routes/exams.routes.js';

const SYNTHETIC_TENANTS = ['clinic-alpha', 'clinic-beta'];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI en el entorno.');
  if (!process.argv.includes('--yes')) {
    console.log('Esto borra los exámenes de clinic-alpha y clinic-beta y siembra los 5 sintéticos.');
    console.log('Vuelve a ejecutar con --yes para confirmar.');
    return;
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const del = await Exam.deleteMany({ client_id: { $in: SYNTHETIC_TENANTS } });
  const ins = await Exam.insertMany(syntheticSeedExams(), { throwOnValidationError: true });
  console.log(`Borrados: ${del.deletedCount}. Sembrados: ${ins.length} exámenes sintéticos.`);
}

main()
  .catch((err) => {
    console.error('[reset-demo] Error:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
