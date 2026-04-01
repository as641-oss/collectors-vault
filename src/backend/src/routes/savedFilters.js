import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('buyer', 'admin'), async (req, res) => {
  const rows = await query(
    `SELECT
      id,
      user_id AS userId,
      name,
      search,
      category_id AS categoryId,
      min_price AS minPrice,
      max_price AS maxPrice,
      item_condition AS itemCondition,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM saved_filters
     WHERE user_id=:userId
     ORDER BY created_at DESC`,
    { userId: req.user.sub }
  );

  res.json(rows);
});

router.post('/', requireAuth, requireRole('buyer', 'admin'), async (req, res) => {
  const { name, search, categoryId, minPrice, maxPrice, itemCondition } = req.body;

  const hasAtLeastOneFilter =
    search || categoryId || minPrice || maxPrice || itemCondition;

  if (!name?.trim()) {
    return res.status(400).json({ message: 'Filter name is required.' });
  }

  if (!hasAtLeastOneFilter) {
    return res.status(400).json({ message: 'At least one filter is required.' });
  }

  await query(
    `INSERT INTO saved_filters
      (user_id, name, search, category_id, min_price, max_price, item_condition, created_at, updated_at)
     VALUES
      (:userId, :name, :search, :categoryId, :minPrice, :maxPrice, :itemCondition, NOW(), NOW())`,
    {
      userId: req.user.sub,
      name: name.trim(),
      search: search || null,
      categoryId: categoryId || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      itemCondition: itemCondition || null
    }
  );

  res.status(201).json({ message: 'Saved filter created.' });
});

router.delete('/:id', requireAuth, requireRole('buyer', 'admin'), async (req, res) => {
  const existing = await query(
    'SELECT id FROM saved_filters WHERE id=:id AND user_id=:userId',
    {
      id: req.params.id,
      userId: req.user.sub
    }
  );

  if (!existing.length) {
    return res.status(404).json({ message: 'Saved filter not found.' });
  }

  await query(
    'DELETE FROM saved_filters WHERE id=:id AND user_id=:userId',
    {
      id: req.params.id,
      userId: req.user.sub
    }
  );

  res.json({ message: 'Saved filter deleted.' });
});

export default router;