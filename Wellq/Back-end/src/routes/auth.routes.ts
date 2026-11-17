import { Router, type Request, type Response } from 'express';
import { authenticateDemoUser } from '../auth/demoUsers.js';
import { signToken } from '../auth/jwt.js';

export const authRouter = Router();

// POST /api/auth/login  { username, password } -> { token, user }
authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const user = authenticateDemoUser(username, password);
  res.locals.auditAction = 'auth_login';
  if (!user) {
    // Se registra el usuario intentado (acotado), nunca la contraseña.
    res.locals.auditActor = `attempt:${String(username ?? '').slice(0, 64)}`;
    return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS' });
  }
  res.locals.auditActor = user.user_id;
  res.locals.auditClientId = user.client_id;
  const token = signToken(user);
  return res.json({
    success: true,
    token,
    user: {
      user_id: user.user_id,
      role: user.role,
      client_id: user.client_id,
      display_name: user.display_name,
    },
  });
});
