import { Router, type Request, type Response } from 'express';
import { authenticateDemoUser } from '../auth/demoUsers.js';
import { signToken } from '../auth/jwt.js';

export const authRouter = Router();

// POST /api/auth/login  { username, password } -> { token, user }
authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  const user = authenticateDemoUser(username, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'INVALID_CREDENTIALS' });
  }
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
