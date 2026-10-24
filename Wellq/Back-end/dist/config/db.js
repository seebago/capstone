import mongoose from 'mongoose';
export async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wellq_demo';
    try {
        mongoose.set('bufferCommands', false);
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 1500,
        });
        console.log(`[MongoDB] Conectado exitosamente a: ${uri}`);
    }
    catch (error) {
        console.warn('[MongoDB] Aviso: No se pudo conectar a MongoDB local/remoto.');
        console.warn('[MongoDB] Error:', error.message);
        console.warn('[MongoDB] Modo de almacenamiento local activado (sin latencia).');
    }
}
