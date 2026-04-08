import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : null;
  const category = req.query.category || null;
  let sql = `SELECT l.id, l.title, l.slug, l.description, l.item_type AS itemType, l.brand_or_series AS brandOrSeries,
                    l.condition_label AS conditionLabel, l.price, l.shipping_fee AS shippingFee,
                    l.quantity_available AS quantityAvailable, l.status, l.cover_image_url AS coverImageUrl,
                    c.name AS categoryName, CONCAT(u.first_name, ' ', u.last_name) AS sellerName
             FROM listings l
             JOIN categories c ON c.id = l.category_id
             JOIN users u ON u.id = l.seller_id
             WHERE l.status = 'active'`;
  const params = {};
  if (search) {
    sql += ` AND (l.title LIKE :search OR l.brand_or_series LIKE :search OR l.description LIKE :search)`;
    params.search = search;
  }
  if (category) {
    sql += ` AND c.slug = :category`;
    params.category = category;
  }
  sql += ' ORDER BY l.created_at DESC';
  const rows = await query(sql, params);
  res.json(rows);
});

router.get('/mine/list', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  const rows = await query(
    `SELECT
      id,
      category_id AS categoryId,
      title,
      slug,
      description,
      item_type AS itemType,
      brand_or_series AS brandOrSeries,
      condition_label AS conditionLabel,
      price,
      shipping_fee AS shippingFee,
      quantity_available AS quantityAvailable,
      status,
      cover_image_url AS coverImageUrl
     FROM listings
     WHERE seller_id=:sellerId
     ORDER BY updated_at DESC`,
    { sellerId: req.user.sub }
  );
  res.json(rows);
});

router.get('/:slug', async (req, res) => {
  const rows = await query(
    `SELECT l.id, l.title, l.slug, l.description, l.item_type AS itemType, l.brand_or_series AS brandOrSeries,
            l.condition_label AS conditionLabel, l.grading_company AS gradingCompany, l.grade_value AS gradeValue,
            l.price, l.shipping_fee AS shippingFee, l.quantity_available AS quantityAvailable, l.status,
            l.cover_image_url AS coverImageUrl, c.name AS categoryName,
            CONCAT(u.first_name, ' ', u.last_name) AS sellerName, u.id AS sellerId
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.seller_id
     WHERE l.slug = :slug LIMIT 1`,
    { slug: req.params.slug }
  );
  if (!rows.length) return res.status(404).json({ message: 'Listing not found' });
  res.json(rows[0]);
});

router.post('/', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  const body = req.body;
  const result = await query(
    `INSERT INTO listings (
      seller_id, category_id, title, slug, description, item_type, brand_or_series, condition_label,
      grading_company, grade_value, price, shipping_fee, quantity_available, status, cover_image_url, created_at, updated_at
    ) VALUES (
      :sellerId, :categoryId, :title, :slug, :description, :itemType, :brandOrSeries, :conditionLabel,
      :gradingCompany, :gradeValue, :price, :shippingFee, :quantityAvailable, :status, :coverImageUrl, NOW(), NOW()
    )`,
    {
      sellerId: req.user.sub,
      categoryId: body.categoryId,
      title: body.title,
      slug: body.slug,
      description: body.description,
      itemType: body.itemType,
      brandOrSeries: body.brandOrSeries,
      conditionLabel: body.conditionLabel,
      gradingCompany: body.gradingCompany || null,
      gradeValue: body.gradeValue || null,
      price: body.price,
      shippingFee: body.shippingFee,
      quantityAvailable: body.quantityAvailable,
      status: body.status || 'active',
      coverImageUrl: body.coverImageUrl || ''
    }
  );
  res.status(201).json({ id: result.insertId });
});

router.put('/:id', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  const body = req.body;
  await query(
    `UPDATE listings
    SET category_id=:categoryId,
        title=:title,
        slug=:slug,
        description=:description,
        item_type=:itemType,
        brand_or_series=:brandOrSeries,
        condition_label=:conditionLabel,
        price=:price,
        shipping_fee=:shippingFee,
        quantity_available=:quantityAvailable,
        cover_image_url=:coverImageUrl,
        status=:status,
        updated_at=NOW()
    WHERE id=:id`,
    {
      id: req.params.id,
      categoryId: body.categoryId,
      title: body.title,
      slug: body.slug,
      description: body.description,
      itemType: body.itemType,
      brandOrSeries: body.brandOrSeries,
      conditionLabel: body.conditionLabel,
      price: body.price,
      shippingFee: body.shippingFee,
      quantityAvailable: body.quantityAvailable,
      coverImageUrl: body.coverImageUrl || '',
      status: body.status,
      sellerId: req.user.sub,
      isAdmin: req.user.role === 'admin' ? 1 : 0
    }
  );
  res.json({ success: true });
});

router.delete('/:id', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  await query(
    `UPDATE listings SET status='inactive', updated_at=NOW() WHERE id=:id AND (seller_id=:sellerId OR :isAdmin=1)`,
    { id: req.params.id, sellerId: req.user.sub, isAdmin: req.user.role === 'admin' ? 1 : 0 }
  );
  res.json({ success: true });
});

router.put('/:id/sold', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  try {
    await query(
      `UPDATE listings
       SET status = 'sold', quantity_available = 0
       WHERE id = :id AND seller_id = :sellerId`,
      { id: req.params.id, sellerId: req.user.sub }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('MARK SOLD ERROR:', error);
    res.status(500).json({ message: 'Failed to mark listing as sold' });
  }
});

export default router;
