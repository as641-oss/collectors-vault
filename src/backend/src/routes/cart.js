import { Router } from 'express';
import { pool, query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('buyer'));

router.get('/', async (req, res) => {
  try {
    const buyerId = req.user.sub;

    const rows = await query(
      `SELECT
        ci.id,
        ci.quantity,
        ci.listing_id AS listingId,
        l.title,
        l.description,
        l.price,
        l.cover_image_url AS imageUrl,
        l.quantity_available AS quantityAvailable,
        l.status,
        l.seller_id AS sellerId
       FROM cart_items ci
       JOIN listings l ON l.id = ci.listing_id
       WHERE ci.buyer_id = :buyerId
       ORDER BY ci.created_at DESC`,
      { buyerId }
    );

    const items = rows.map((item) => ({
      ...item,
      price: Number(item.price),
      quantity: Number(item.quantity),
      quantityAvailable: Number(item.quantityAvailable)
    }));

    const total = items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    return res.json({
      items,
      total
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ message: 'Failed to load cart.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const buyerId = req.user.sub;
    const listingId = Number(req.body.listingId);
    const quantity = Number(req.body.quantity ?? 1);

    if (!Number.isInteger(listingId) || listingId <= 0) {
      return res.status(400).json({ message: 'A valid listingId is required.' });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const listingRows = await query(
      `SELECT
        id,
        seller_id AS sellerId,
        title,
        quantity_available AS quantityAvailable,
        status
       FROM listings
       WHERE id = :listingId`,
      { listingId }
    );

    const listing = listingRows[0];

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (Number(listing.sellerId) === Number(buyerId)) {
      return res.status(400).json({ message: 'You cannot add your own listing to cart.' });
    }

    if (listing.status !== 'active' || Number(listing.quantityAvailable) < 1) {
      return res.status(400).json({ message: 'This listing is not available.' });
    }

    const existingRows = await query(
      `SELECT
        id,
        quantity
       FROM cart_items
       WHERE buyer_id = :buyerId
         AND listing_id = :listingId`,
      { buyerId, listingId }
    );

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      const newQuantity = Number(existing.quantity) + quantity;

      if (newQuantity > Number(listing.quantityAvailable)) {
        return res.status(400).json({ message: 'Requested quantity exceeds available stock.' });
      }

      await query(
        `UPDATE cart_items
         SET quantity = :quantity,
             updated_at = NOW()
         WHERE id = :id`,
        { quantity: newQuantity, id: existing.id }
      );

      return res.json({ message: 'Cart updated successfully.' });
    }

    if (quantity > Number(listing.quantityAvailable)) {
      return res.status(400).json({ message: 'Requested quantity exceeds available stock.' });
    }

    await query(
      `INSERT INTO cart_items (
        buyer_id,
        listing_id,
        quantity,
        created_at,
        updated_at
      ) VALUES (
        :buyerId,
        :listingId,
        :quantity,
        NOW(),
        NOW()
      )`,
      { buyerId, listingId, quantity }
    );

    return res.status(201).json({ message: 'Item added to cart.' });
    } catch (error) {
      console.error('Add to cart error:', error);
      return res.status(500).json({ message: 'Failed to add item to cart.' });
    }
});

router.put('/:id', async (req, res) => {
  try {
    const buyerId = req.user.sub;
    const cartItemId = Number(req.params.id);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({ message: 'A valid cart item id is required.' });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const rows = await query(
      `SELECT
        ci.id,
        ci.quantity,
        ci.listing_id AS listingId,
        l.title,
        l.quantity_available AS quantityAvailable,
        l.status
       FROM cart_items ci
       JOIN listings l ON l.id = ci.listing_id
       WHERE ci.id = :cartItemId
         AND ci.buyer_id = :buyerId`,
      { cartItemId, buyerId }
    );

    const item = rows[0];

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (item.status !== 'active' || Number(item.quantityAvailable) < 1) {
      return res.status(400).json({ message: 'This listing is no longer available.' });
    }

    if (quantity > Number(item.quantityAvailable)) {
      return res.status(400).json({ message: 'Requested quantity exceeds available stock.' });
    }

    await query(
      `UPDATE cart_items
       SET quantity = :quantity,
           updated_at = NOW()
       WHERE id = :cartItemId
         AND buyer_id = :buyerId`,
      { quantity, cartItemId, buyerId }
    );

    return res.json({ message: 'Cart item updated.' });
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({ message: 'Failed to update cart item.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const buyerId = req.user.sub;
    const cartItemId = Number(req.params.id);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({ message: 'A valid cart item id is required.' });
    }

    const result = await query(
      `DELETE FROM cart_items
       WHERE id = :cartItemId
         AND buyer_id = :buyerId`,
      { cartItemId, buyerId }
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    return res.json({ message: 'Cart item removed.' });
  } catch (error) {
    console.error('Delete cart error:', error);
    return res.status(500).json({ message: 'Failed to remove cart item.' });
  }
});

router.post('/checkout', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const buyerId = req.user.sub;

    const [profileRows] = await connection.query(
      `SELECT
        id,
        first_name AS firstName,
        last_name AS lastName,
        phone
       FROM users
       WHERE id = ?`,
      [buyerId]
    );

    const buyer = profileRows[0];

    if (!buyer) {
      connection.release();
      return res.status(404).json({ message: 'Buyer not found.' });
    }

    if (!buyer.firstName || !buyer.lastName || !buyer.phone) {
      connection.release();
      return res.status(400).json({
        message: 'Please complete your profile with your full name and phone number before checkout.'
      });
    }

    const [addressRows] = await connection.query(
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
       WHERE user_id = ?
       ORDER BY is_default DESC, created_at DESC
       LIMIT 1`,
      [buyerId]
    );

    const shippingAddress = addressRows[0];

    if (!shippingAddress) {
      connection.release();
      return res.status(400).json({
        message: 'Please add a shipping address before checkout.'
      });
    }

    const [cartRows] = await connection.query(
      `SELECT
        ci.id,
        ci.quantity,
        l.id AS listingId,
        l.title,
        l.price,
        l.shipping_fee AS shippingFee,
        l.condition_label AS conditionLabel,
        l.seller_id AS sellerId,
        l.quantity_available AS quantityAvailable,
        l.status
       FROM cart_items ci
       JOIN listings l ON l.id = ci.listing_id
       WHERE ci.buyer_id = ?
       ORDER BY ci.created_at ASC`,
      [buyerId]
    );

    if (!cartRows.length) {
      connection.release();
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    for (const item of cartRows) {
      if (item.status !== 'active' || Number(item.quantityAvailable) < 1) {
        connection.release();
        return res.status(400).json({
          message: `"${item.title}" is no longer available.`
        });
      }

      if (Number(item.quantity) > Number(item.quantityAvailable)) {
        connection.release();
        return res.status(400).json({
          message: `Not enough stock for "${item.title}".`
        });
      }
    }

    const groupedBySeller = new Map();

    for (const item of cartRows) {
      const sellerId = Number(item.sellerId);
      if (!groupedBySeller.has(sellerId)) {
        groupedBySeller.set(sellerId, []);
      }
      groupedBySeller.get(sellerId).push(item);
    }

    await connection.beginTransaction();

    const createdOrders = [];

    for (const [sellerId, items] of groupedBySeller.entries()) {
      const subtotal = items.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.quantity);
      }, 0);

      const shippingTotal = items.reduce((sum, item) => {
        return sum + Number(item.shippingFee || 0) * Number(item.quantity);
      }, 0);

      const grandTotal = subtotal + shippingTotal;

      const orderNumber = `ORD-${Date.now()}-${sellerId}-${Math.floor(Math.random() * 10000)}`;

      const [orderResult] = await connection.query(
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          buyerId,
          sellerId,
          orderNumber,
          'paid',
          subtotal,
          shippingTotal,
          grandTotal,
          shippingAddress.fullName,
          shippingAddress.line1,
          shippingAddress.line2 || null,
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.postalCode,
          shippingAddress.country
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of items) {
        const lineTotal = Number(item.price) * Number(item.quantity);

        await connection.query(
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
            orderId,
            item.listingId,
            item.title,
            item.conditionLabel,
            item.price,
            item.quantity,
            lineTotal
          ]
        );

        const [updateResult] = await connection.query(
          `UPDATE listings
           SET quantity_available = quantity_available - ?,
               updated_at = NOW()
           WHERE id = ?
             AND quantity_available >= ?`,
          [item.quantity, item.listingId, item.quantity]
        );

        if (!updateResult.affectedRows) {
          throw new Error(`Inventory update failed for listing ${item.listingId}`);
        }

        await connection.query(
          `UPDATE listings
           SET status = CASE
             WHEN quantity_available <= 0 THEN 'sold'
             ELSE status
           END,
           updated_at = NOW()
           WHERE id = ?`,
          [item.listingId]
        );
      }

      createdOrders.push({
        orderId,
        sellerId,
        orderNumber,
        subtotal,
        shippingTotal,
        grandTotal
      });
    }

    await connection.query(
      `DELETE FROM cart_items
       WHERE buyer_id = ?`,
      [buyerId]
    );

    await connection.commit();
    connection.release();

    return res.json({
      message: 'Checkout completed successfully.',
      orders: createdOrders
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Checkout rollback error:', rollbackError);
    }

    connection.release();
    console.error('Checkout error:', error);
    return res.status(500).json({ message: 'Checkout failed.' });
  }
});
export default router;