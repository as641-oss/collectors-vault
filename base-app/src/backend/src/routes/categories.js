import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const rows = await query('SELECT id, name, slug, description, image_url AS imageUrl, is_active AS isActive FROM categories WHERE is_active = 1 ORDER BY name');
  res.json(rows);
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, slug, description = '', imageUrl = '' } = req.body;
  const result = await query(
    `INSERT INTO categories (name, slug, description, image_url, is_active, created_at)
     VALUES (:name, :slug, :description, :imageUrl, 1, NOW())`,
    { name, slug, description, imageUrl }
  );
  res.status(201).json({ id: result.insertId, name, slug, description, imageUrl, isActive: true });
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, slug, description = '', imageUrl = '', isActive = true } = req.body;
  await query(
    `UPDATE categories SET name=:name, slug=:slug, description=:description, image_url=:imageUrl, is_active=:isActive WHERE id=:id`,
    { id: req.params.id, name, slug, description, imageUrl, isActive: isActive ? 1 : 0 }
  );
  res.json({ success: true });
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await query('UPDATE categories SET is_active = 0 WHERE id = :id', { id: req.params.id });
  res.json({ success: true });
});

export default router;
