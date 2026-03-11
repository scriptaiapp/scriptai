import type { Request } from 'express';

export interface AuthRequest extends Request {
  user?: { id: string };
  userRole?: 'user' | 'admin' | 'sales_rep';
}
