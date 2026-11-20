import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wellq_demo';
  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      // 1,5 s en local (si no hay Mongo, pasa rápido a memoria); en Vercel/Atlas
      // conviene más margen para el primer arranque: MONGODB_TIMEOUT_MS.
      serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS) || 1500,
    });
    console.log('[MongoDB] Conectado exitosamente.'); // sin imprimir la URI: puede traer credenciales
  } catch (error) {
    console.warn('[MongoDB] Aviso: No se pudo conectar a MongoDB local/remoto.');
    console.warn('[MongoDB] Error:', (error as Error).message);
    console.warn('[MongoDB] Modo de almacenamiento local activado (sin latencia).');
  }
}
