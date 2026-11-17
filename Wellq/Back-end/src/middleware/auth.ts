import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type AuthClaims, type Role } from '../auth/jwt.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Claims verificados del JWT. Única fuente válida de user_id, role y client_id. */
      auth?: AuthClaims;
    }
  }
}

/** Exige `Authorization: Bearer <jwt>` válido. Sin token o con token inválido: 401. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const claims = match ? verifyToken(match[1].trim()) : null;
  if (!claims) {
    return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
  }
  req.auth = claims;
  return next();
}

/** Exige uno de los roles indicados (tras requireAuth). Rol incorrecto: 403. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN_ROLE' });
    }
    return next();
  };
}
