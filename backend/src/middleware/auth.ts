import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();

    if (!userDoc.exists) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      role: userData?.role || 'user',
    };
    next();
  } catch (err: any) {
    console.error('Auth error:', err?.code, err?.message);
    res.status(401).json({ success: false, message: 'Invalid token', detail: err?.code });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
