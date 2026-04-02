import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const rows = await query(
    `SELECT f.id, l.id AS listingId, l.title, l.slug, l.price, l.cover_image_url AS coverImageUrl
     FROM favorites f JOIN listings l ON l.id = f.listing_id WHERE f.user_id = :userId ORDER BY f.created_at DESC`,
    { userId: req.user.sub }
  );
  res.json(rows);
});

router.post('/:listingId', async (req, res) => {
  await query('INSERT IGNORE INTO favorites (user_id, listing_id, created_at) VALUES (:userId, :listingId, NOW())', {
    userId: req.user.sub,
    listingId: req.params.listingId
  });
  res.status(201).json({ success: true });
});

router.delete('/:listingId', async (req, res) => {
  await query('DELETE FROM favorites WHERE user_id=:userId AND listing_id=:listingId', {
    userId: req.user.sub,
    listingId: req.params.listingId
  });
  res.json({ success: true });
});

export default router;
