import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('buyer', 'seller'));

router.get('/', async (req, res) => {
  const rows = await query(
    `SELECT
      id,
      type,
      title,
      message,
      link,
      is_read AS isRead,
      created_at AS createdAt
     FROM notifications
     WHERE user_id = :userId
     ORDER BY created_at DESC`,
    { userId: req.user.sub }
  );

  res.json(rows);
});


router.get('/:id', async (req, res) => {
  const rows = await query(
    `SELECT
      id,
      type,
      title,
      message,
      link,
      is_read AS isRead,
      created_at AS createdAt
     FROM notifications
     WHERE id = :id`,
    {
      id: req.params.id,
    }
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json(rows[0]);
});

router.get('/unread-count', async (req, res) => {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM notifications
     WHERE user_id = :userId
       AND is_read = 0`,
    { userId: req.user.sub }
  );

  res.json({ count: Number(rows[0]?.count || 0) });
});

router.patch('/read-all', async (req, res) => {
  await query(
    `UPDATE notifications
     SET is_read = 1
     WHERE user_id = :userId
       AND is_read = 0`,
    { userId: req.user.sub }
  );

  res.json({ success: true });
});

router.patch('/:id/read', async (req, res) => {
  await query(
    `UPDATE notifications
     SET is_read = 1
     WHERE id = :id
       AND user_id = :userId`,
    {
      id: req.params.id,
      userId: req.user.sub
    }
  );

  res.json({ success: true });
});

export default router;