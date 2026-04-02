import { Router } from 'express';
import { query, pool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('buyer'), async (req, res) => {
 const profileRows = await query(
  `SELECT first_name, last_name, phone
   FROM users
   WHERE id=:id
   LIMIT 1`,
  { id: req.user.sub }
);

const profile = profileRows[0];

const addressRows = await query(
  `SELECT
    id,
    full_name AS fullName,
    line1,
    line2,
    city,
    state,
    postal_code AS postalCode,
    country
   FROM addresses
   WHERE user_id=:userId
   ORDER BY is_default DESC, created_at DESC
   LIMIT 1`,
  { userId: req.user.sub }
);

const selectedAddress = addressRows[0];

if (!profile?.phone || !selectedAddress) {
  return res.status(400).json({
    message: 'Please browse to Dashbord tab -> complete your profile with phone number and shipping address before purchasing.'
  });
}

  const { listingId, quantity = 1 } = req.body;

  const parsedListingId = Number(listingId);
  const qty = Number(quantity);

  if (!Number.isInteger(parsedListingId) || parsedListingId < 1) {
    return res.status(400).json({ message: 'Invalid listing id' });
  }

  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [listings] = await conn.execute(
      'SELECT * FROM listings WHERE id = ? FOR UPDATE',
      [parsedListingId]
    );

    const listing = listings[0];

    if (!listing || listing.status !== 'active' || listing.quantity_available < qty) {
      await conn.rollback();
      return res.status(400).json({ message: 'Listing unavailable' });
    }

    const subtotal = Number(listing.price) * qty;
    const shippingTotal = Number(listing.shipping_fee || 0);
    const grandTotal = subtotal + shippingTotal;
    const orderNumber = `CV-${Date.now()}`;

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (
        buyer_id,
        seller_id,
        order_number,
        status,
        subtotal,
        shipping_total,
        grand_total,
        shipping_name,
        shipping_line1,
        shipping_line2,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        req.user.sub,
        listing.seller_id,
        orderNumber,
        subtotal,
        shippingTotal,
        grandTotal,
        selectedAddress.fullName,
        selectedAddress.line1,
        selectedAddress.line2 || '',
        selectedAddress.city,
        selectedAddress.state,
        selectedAddress.postalCode,
        selectedAddress.country
      ]
    );

    await conn.execute(
      `INSERT INTO order_items (
        order_id,
        listing_id,
        listing_title_snapshot,
        condition_snapshot,
        unit_price,
        quantity,
        line_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderResult.insertId,
        listing.id,
        listing.title,
        listing.condition_label,
        listing.price,
        qty,
        subtotal
      ]
    );

    const remaining = Number(listing.quantity_available) - qty;

    await conn.execute(
      'UPDATE listings SET quantity_available=?, status=?, updated_at=NOW() WHERE id=?',
      [remaining, remaining === 0 ? 'sold' : 'active', listing.id]
    );

    await conn.commit();

    res.status(201).json({
      orderId: orderResult.insertId,
      orderNumber
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({
      message: 'Order creation failed',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

router.get('/me', requireRole('buyer'), async (req, res) => {
  const rows = await query(
    'SELECT * FROM orders WHERE buyer_id=:userId ORDER BY created_at DESC',
    { userId: req.user.sub }
  );

  res.json(rows);
});

router.get('/seller/list', requireRole('seller', 'admin'), async (req, res) => {
  const rows = await query(
    req.user.role === 'admin'
      ? `SELECT
           o.id,
           o.order_number AS orderNumber,
           o.buyer_id AS buyerId,
           o.seller_id AS sellerId,
           o.status,
           o.subtotal,
           o.shipping_total AS shippingTotal,
           o.grand_total AS grandTotal,
           o.tracking_number AS trackingNumber,
           o.created_at AS createdAt,
           CONCAT(u.first_name, ' ', u.last_name) AS buyerName
         FROM orders o
         LEFT JOIN users u ON u.id = o.buyer_id
         ORDER BY o.created_at DESC`
      : `SELECT
           o.id,
           o.order_number AS orderNumber,
           o.buyer_id AS buyerId,
           o.seller_id AS sellerId,
           o.status,
           o.subtotal,
           o.shipping_total AS shippingTotal,
           o.grand_total AS grandTotal,
           o.tracking_number AS trackingNumber,
           o.created_at AS createdAt,
           CONCAT(u.first_name, ' ', u.last_name) AS buyerName
         FROM orders o
         LEFT JOIN users u ON u.id = o.buyer_id
         WHERE o.seller_id = :sellerId
         ORDER BY o.created_at DESC`,
    { sellerId: req.user.sub }
  );

  res.json(rows);
});

router.put('/seller/:id/status', requireRole('seller', 'admin'), async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['paid', 'shipped', 'completed', 'cancelled', 'delivered'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  await query(
    req.user.role === 'admin'
      ? 'UPDATE orders SET status=:status, updated_at=NOW() WHERE id=:id'
      : 'UPDATE orders SET status=:status, updated_at=NOW() WHERE id=:id AND seller_id=:sellerId',
    {
      id: req.params.id,
      sellerId: req.user.sub,
      status
    }
  );

  res.json({ success: true });
});

router.get('/:id', async (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  const orderRows = await query(
    req.user.role === 'admin'
      ? `SELECT
           o.*,
           CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS buyerName,
           u.email AS buyerEmail,
           u.phone AS buyerPhone
         FROM orders o
         LEFT JOIN users u ON u.id = o.buyer_id
         WHERE o.id = :id`
      : `SELECT
           o.*,
           CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS buyerName,
           u.email AS buyerEmail,
           u.phone AS buyerPhone
         FROM orders o
         LEFT JOIN users u ON u.id = o.buyer_id
         WHERE o.id = :id
           AND (o.buyer_id = :userId OR o.seller_id = :userId)`,
    {
      id: orderId,
      userId: req.user.sub
    }
  );

  if (!orderRows.length) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const itemRows = await query(
    `SELECT
       oi.id,
       oi.order_id AS orderId,
       oi.listing_id AS listingId,
       oi.quantity,
       oi.unit_price AS unitPrice,
       oi.line_total AS lineTotal,
       l.title AS listingTitle
     FROM order_items oi
     LEFT JOIN listings l ON l.id = oi.listing_id
     WHERE oi.order_id = :orderId`,
    { orderId }
  );

  res.json({
    ...orderRows[0],
    items: itemRows
  });
});

export default router;