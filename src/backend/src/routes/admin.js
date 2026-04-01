import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/users', async (_req, res) => {
  const rows = await query(
    `SELECT
      id,
      email,
      first_name AS firstName,
      last_name AS lastName,
      role,
      phone,
      is_active AS isActive,
      created_at AS createdAt
     FROM users
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

router.put('/users/:id/role', async (req, res) => {
  const userId = Number(req.params.id);
  const { role } = req.body;

  const allowedRoles = ['buyer', 'seller', 'admin'];

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id.' });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  if (req.user.sub === userId && req.user.role === 'admin' && role !== 'admin') {
    return res.status(400).json({ message: 'You cannot remove your own admin access.' });
  }

  const existing = await query(
    `SELECT id, role, email
     FROM users
     WHERE id=:id
     LIMIT 1`,
    { id: userId }
  );

  if (!existing.length) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await query(
    `UPDATE users
     SET role=:role, updated_at=NOW()
     WHERE id=:id`,
    { id: userId, role }
  );

  const [updated] = await query(
    `SELECT
      id,
      email,
      first_name AS firstName,
      last_name AS lastName,
      role,
      phone,
      is_active AS isActive,
      created_at AS createdAt
     FROM users
     WHERE id=:id
     LIMIT 1`,
    { id: userId }
  );

  res.json({
    message: 'User role updated successfully.',
    user: updated
  });
});

router.put('/users/:id/status', async (req, res) => {
  const userId = Number(req.params.id);
  const { isActive } = req.body;

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user id.' });
  }

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive must be true or false.' });
  }

  if (req.user.sub === userId && isActive === false) {
    return res.status(400).json({ message: 'You cannot deactivate your own account.' });
  }

  const existing = await query(
    `SELECT id, is_active AS isActive, email
     FROM users
     WHERE id=:id
     LIMIT 1`,
    { id: userId }
  );

  if (!existing.length) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await query(
    `UPDATE users
     SET is_active=:isActive, updated_at=NOW()
     WHERE id=:id`,
    { id: userId, isActive: isActive ? 1 : 0 }
  );

  const [updated] = await query(
    `SELECT
      id,
      email,
      first_name AS firstName,
      last_name AS lastName,
      role,
      phone,
      is_active AS isActive,
      created_at AS createdAt
     FROM users
     WHERE id=:id
     LIMIT 1`,
    { id: userId }
  );

  res.json({
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
    user: updated
  });
});

router.get('/listings', async (_req, res) => {
  const rows = await query(
    `SELECT
      id,
      title,
      slug,
      status,
      price,
      quantity_available AS quantityAvailable,
      created_at AS createdAt
     FROM listings
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

router.get('/orders', async (_req, res) => {
  const rows = await query(
    `SELECT
      id,
      order_number AS orderNumber,
      status,
      grand_total AS grandTotal,
      created_at AS createdAt
     FROM orders
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

router.get('/stats', async (_req, res) => {
  const [users] = await query('SELECT COUNT(*) AS count FROM users');
  const [listings] = await query('SELECT COUNT(*) AS count FROM listings');
  const [orders] = await query('SELECT COUNT(*) AS count FROM orders');

  res.json({
    users: users.count,
    listings: listings.count,
    orders: orders.count
  });
});

export default router;