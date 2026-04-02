import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/users', async (_req, res) => {
  const rows = await query('SELECT id, email, first_name AS firstName, last_name AS lastName, role, is_active AS isActive, created_at AS createdAt FROM users ORDER BY created_at DESC');
  res.json(rows);
});

router.get('/listings', async (_req, res) => {
  const rows = await query('SELECT id, title, slug, status, price, quantity_available AS quantityAvailable, created_at AS createdAt FROM listings ORDER BY created_at DESC');
  res.json(rows);
});

router.get('/orders', async (_req, res) => {
  const rows = await query('SELECT id, order_number AS orderNumber, status, grand_total AS grandTotal, created_at AS createdAt FROM orders ORDER BY created_at DESC');
  res.json(rows);
});

router.get('/stats', async (_req, res) => {
  const [users] = await query('SELECT COUNT(*) AS count FROM users');
  const [listings] = await query('SELECT COUNT(*) AS count FROM listings');
  const [orders] = await query('SELECT COUNT(*) AS count FROM orders');
  res.json({ users: users.count, listings: listings.count, orders: orders.count });
});

export default router;
