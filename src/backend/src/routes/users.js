import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
//
// PROFILE
//

router.get('/profile', async (req, res) => {
  const rows = await query(
    `SELECT
      id,
      email,
      first_name AS firstName,
      last_name AS lastName,
      role,
      phone
     FROM users
     WHERE id=:id
     LIMIT 1`,
    { id: req.user.sub }
  );

  res.json(rows[0] || null);
});

router.put('/profile', async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  await query(
    `UPDATE users
     SET first_name=:firstName,
         last_name=:lastName,
         phone=:phone,
         updated_at=NOW()
     WHERE id=:id`,
    {
      id: req.user.sub,
      firstName,
      lastName,
      phone
    }
  );

  res.json({ success: true });
});

//
// GET ALL ADDRESSES
//

router.get('/addresses', async (req, res) => {
  const rows = await query(
    `SELECT
      id,
      full_name AS fullName,
      line1,
      line2,
      city,
      state,
      postal_code AS postalCode,
      country,
      is_default AS isDefault
     FROM addresses
     WHERE user_id=:userId
     ORDER BY is_default DESC, created_at DESC`,
    {
      userId: req.user.sub
    }
  );

  res.json(rows);
});

//
// ADD ADDRESS
//

router.post('/addresses', async (req, res) => {
  const a = req.body;

  if (!a.fullName || !a.line1 || !a.city || !a.state || !a.postalCode || !a.country) {
    return res.status(400).json({
      message: 'fullName, line1, city, state, postalCode, and country are required.'
    });
  }

  const existing = await query(
    'SELECT id FROM addresses WHERE user_id=:userId LIMIT 1',
    {
      userId: req.user.sub
    }
  );

  const shouldBeDefault = existing.length === 0 ? 1 : (a.isDefault ? 1 : 0);

  if (shouldBeDefault) {
    await query(
      'UPDATE addresses SET is_default=0 WHERE user_id=:userId',
      {
        userId: req.user.sub
      }
    );
  }

  const result = await query(
    `INSERT INTO addresses
      (
        user_id,
        full_name,
        line1,
        line2,
        city,
        state,
        postal_code,
        country,
        is_default,
        created_at
      )
     VALUES
      (
        :userId,
        :fullName,
        :line1,
        :line2,
        :city,
        :state,
        :postalCode,
        :country,
        :isDefault,
        NOW()
      )`,
    {
      userId: req.user.sub,
      fullName: a.fullName,
      line1: a.line1,
      line2: a.line2 || '',
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: shouldBeDefault
    }
  );

  res.status(201).json({
    id: result.insertId
  });
});

//
// UPDATE ADDRESS
//

router.put('/addresses/:id', async (req, res) => {
  const a = req.body;

  if (!a.fullName || !a.line1 || !a.city || !a.state || !a.postalCode || !a.country) {
    return res.status(400).json({
      message: 'fullName, line1, city, state, postalCode, and country are required.'
    });
  }

  if (a.isDefault) {
    await query(
      'UPDATE addresses SET is_default=0 WHERE user_id=:userId',
      {
        userId: req.user.sub
      }
    );
  }

  await query(
    `UPDATE addresses
     SET
       full_name=:fullName,
       line1=:line1,
       line2=:line2,
       city=:city,
       state=:state,
       postal_code=:postalCode,
       country=:country,
       is_default=:isDefault
     WHERE id=:id
       AND user_id=:userId`,
    {
      id: req.params.id,
      userId: req.user.sub,
      fullName: a.fullName,
      line1: a.line1,
      line2: a.line2 || '',
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault ? 1 : 0
    }
  );

  res.json({
    success: true
  });
});

//
// DELETE ADDRESS
//

router.delete('/addresses/:id', async (req, res) => {
  await query(
    `DELETE FROM addresses
     WHERE id=:id
       AND user_id=:userId`,
    {
      id: req.params.id,
      userId: req.user.sub
    }
  );

  res.json({
    success: true
  });
});

export default router;
