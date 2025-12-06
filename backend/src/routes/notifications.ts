import { Router, Request, Response } from 'express';
import { db, messaging } from '../config/firebase';
import { verifyToken } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user!.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await db.collection('notifications').doc(req.params.id).update({ isRead: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const snap = await db.collection('notifications')
      .where('userId', '==', req.user!.uid)
      .where('isRead', '==', false)
      .get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
    await batch.commit();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

// POST /api/notifications/token - save FCM token
router.post('/token', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    await db.collection('users').doc(req.user!.uid).update({ fcmToken: token });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to save token' });
  }
});

export default router;
