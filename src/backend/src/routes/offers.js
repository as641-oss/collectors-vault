import express from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('buyer'), async (req, res) => {
  const { listingId, amount } = req.body;

  if (!listingId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Valid listingId and amount are required.' });
  }

  const listingRows = await query(
    `SELECT id, title, seller_id, price, status, quantity_available
     FROM listings
     WHERE id = :listingId
     LIMIT 1`,
    { listingId }
  );

  const listing = listingRows[0];

  if (!listing) {
    return res.status(404).json({ message: 'Listing not found.' });
  }

  if (listing.seller_id === req.user.sub) {
    return res.status(400).json({ message: 'You cannot make an offer on your own listing.' });
  }

  if (listing.status !== 'active' || Number(listing.quantity_available) < 1) {
    return res.status(400).json({ message: 'Offers can only be made on active listings.' });
  }

  const addressRows = await query(
    `SELECT id
     FROM addresses
     WHERE user_id = :userId
     ORDER BY is_default DESC, created_at DESC
     LIMIT 1`,
    { userId: req.user.sub }
  );

  const selectedAddress = addressRows[0];

  if (!selectedAddress) {
    return res.status(400).json({
      message: 'Please add a shipping address before making an offer.'
    });
  }

  const now = new Date();

  await query(
    `INSERT INTO offers (
      listing_id,
      buyer_id,
      seller_id,
      amount,
      status,
      created_at,
      updated_at
    ) VALUES (
      :listingId,
      :buyerId,
      :sellerId,
      :amount,
      'pending',
      :createdAt,
      :updatedAt
    )`,
    {
      listingId,
      buyerId: req.user.sub,
      sellerId: listing.seller_id,
      amount,
      createdAt: now,
      updatedAt: now
    }
  );

  res.status(201).json({ message: 'Offer submitted successfully.' });
});

router.get('/received', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
    const rows = await query(
    `SELECT
      o.id,
      o.listing_id AS listingId,
      o.buyer_id AS buyerId,
      o.seller_id AS sellerId,
      o.amount AS offerPrice,
      o.status,
      o.created_at AS createdAt,
      o.updated_at AS updatedAt,
      l.title AS listingTitle,
      u.email AS buyerEmail
    FROM offers o
    JOIN listings l ON o.listing_id = l.id
    JOIN users u ON o.buyer_id = u.id
    WHERE o.seller_id = :sellerId
    ORDER BY o.created_at DESC`,
    { sellerId: req.user.sub }
  );
  res.json(rows);
});

router.put('/:id/status', requireAuth, requireRole('seller', 'admin'), async (req, res) => {
  const { status } = req.body;
  const offerId = req.params.id;

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  const rows = await query(
    `SELECT
       o.*,
       l.title AS listingTitle,
       l.price,
       l.status AS listingStatus,
       l.quantity_available
     FROM offers o
     JOIN listings l ON l.id = o.listing_id
     WHERE o.id = :offerId
     LIMIT 1`,
    { offerId }
  );

  const offer = rows[0];

  if (!offer) {
    return res.status(404).json({ message: 'Offer not found.' });
  }

  if (req.user.role !== 'admin' && offer.seller_id !== req.user.sub) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  if (offer.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending offers can be updated.' });
  }

  if (offer.listingStatus !== 'active' || Number(offer.quantity_available) < 1) {
    return res.status(400).json({ message: 'Listing is no longer available.' });
  }

  const now = new Date();

  await query(
    `UPDATE offers
     SET status = :status, updated_at = :updatedAt
     WHERE id = :offerId`,
    {
      status,
      updatedAt: now,
      offerId
    }
  );

  if (status === 'accepted') {
    await query(
      `UPDATE listings
       SET status = 'sold', quantity_available = 0, updated_at = :updatedAt
       WHERE id = :listingId`,
      {
        listingId: offer.listing_id,
        updatedAt: now
      }
    );

    await query(
      `UPDATE offers
       SET status = 'expired', updated_at = :updatedAt
       WHERE listing_id = :listingId
         AND id != :offerId
         AND status = 'pending'`,
      {
        listingId: offer.listing_id,
        offerId,
        updatedAt: now
      }
    );

    const addressRows = await query(
      `SELECT
         full_name,
         line1,
         line2,
         city,
         state,
         postal_code,
         country
       FROM addresses
       WHERE user_id = :buyerId
       ORDER BY is_default DESC, created_at DESC
       LIMIT 1`,
      { buyerId: offer.buyer_id }
    );

    const selectedAddress = addressRows[0];

    if (!selectedAddress) {
      return res.status(400).json({
        message: 'Buyer must have a shipping address before this offer can be accepted.'
      });
    }

    const orderNumber = `ORD-OFFER-${Date.now()}`;
    const subtotal = Number(offer.amount);
    const shippingTotal = 0;
    const grandTotal = subtotal;

    await query(
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
        tracking_number,
        created_at,
        updated_at
      ) VALUES (
        :buyerId,
        :sellerId,
        :orderNumber,
        'paid',
        :subtotal,
        :shippingTotal,
        :grandTotal,
        :shippingName,
        :shippingLine1,
        :shippingLine2,
        :shippingCity,
        :shippingState,
        :shippingPostalCode,
        :shippingCountry,
        NULL,
        :createdAt,
        :updatedAt
      )`,
      {
        buyerId: offer.buyer_id,
        sellerId: offer.seller_id,
        orderNumber,
        subtotal,
        shippingTotal,
        grandTotal,
        shippingName: selectedAddress.full_name,
        shippingLine1: selectedAddress.line1,
        shippingLine2: selectedAddress.line2,
        shippingCity: selectedAddress.city,
        shippingState: selectedAddress.state,
        shippingPostalCode: selectedAddress.postal_code,
        shippingCountry: selectedAddress.country,
        createdAt: now,
        updatedAt: now
      }
    );
  }

  res.json({
    message: status === 'accepted'
      ? 'Offer accepted and order created successfully.'
      : 'Offer declined successfully.'
  });
});

export default router;