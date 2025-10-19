import { Router, Request, Response } from 'express';
import { db, auth } from '../config/firebase';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/users/register - called after Firebase Auth signup
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid, email, displayName, role, phone } = req.body;
    if (!uid || !email) { res.status(400).json({ success: false, message: 'Missing required fields' }); return; }

    const existing = await db.collection('users').doc(uid).get();
    if (existing.exists) { res.status(400).json({ success: false, message: 'User already registered' }); return; }

    const userRole = role === 'admin' ? 'admin' : 'user';

    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      role: userRole,
      phone: phone || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Set custom claim
    await auth.setCustomUserClaims(uid, { role: userRole });

    res.status(201).json({ success: true, message: 'User registered' });
  } catch {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// GET /api/users/me
router.get('/me', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('users').doc(req.user!.uid).get();
    if (!doc.exists) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// PUT /api/users/me
router.put('/me', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { displayName, phone, address, city, photoURL } = req.body;
    await db.collection('users').doc(req.user!.uid).update({
      displayName, phone, address, city, photoURL,
      updatedAt: new Date(),
    });
    res.json({ success: true, message: 'Profile updated' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// GET /api/users - admin only
router.get('/', verifyToken, requireRole('admin'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const snap = await db.collection('users').orderBy('createdAt', 'desc').get();
    res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// PATCH /api/users/:id/status - admin
router.patch('/:id/status', verifyToken, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive } = req.body;
    await db.collection('users').doc(req.params.id).update({ isActive, updatedAt: new Date() });
    if (!isActive) await auth.revokeRefreshTokens(req.params.id);
    res.json({ success: true, message: 'User status updated' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

export default router;
