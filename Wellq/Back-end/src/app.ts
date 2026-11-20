import express from 'express';
import cors from 'cors';
import { examsRouter } from './routes/exams.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { auditRequests } from './audit/auditLog.js';

/**
 * Construye la app Express sin conectar a la BD ni escuchar puerto,
 * para que las pruebas automatizadas puedan levantarla aislada.
 */
export function createApp() {
  const app = express();

  // Middlewares
  // Autenticación por header Bearer (no cookies): CORS no expone sesión, pero en
  // despliegue se restringe a los orígenes del frontend con CORS_ORIGINS
  // (lista separada por comas). Sin la variable (desarrollo local) queda abierto.
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint (público)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'WellMedical Backend API',
      stack: 'Node.js + Express + TypeScript + MongoDB',
      features: ['documents', 'split_screen_pdf', 'range_review', 'synthetic_only', 'jwt_auth'],
      timestamp: new Date().toISOString(),
    });
  });

  // Auditoría separada (colección audit_events) de cada request, incluidos rechazos.
  app.use(['/api/auth', '/api/exams'], auditRequests);

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/exams', examsRouter);

  return app;
}
