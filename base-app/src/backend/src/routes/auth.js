import { Router } from 'express';
import { comparePassword, hashPassword, signToken } from '../auth.js';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, role = 'buyer' } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const existing = await query('SELECT id FROM users WHERE email = :email LIMIT 1', { email });
  if (existing.length) return res.status(409).json({ message: 'Email already exists' });

  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
     VALUES (:email, :passwordHash, :firstName, :lastName, :role, 1, NOW(), NOW())`,
    { email, passwordHash, firstName, lastName, role }
  );

  const user = { id: result.insertId, email, role };
  res.status(201).json({ token: signToken(user), user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = await query('SELECT * FROM users WHERE email = :email LIMIT 1', { email });
  const user = users[0];
  if (!user || !user.is_active) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name
  };

  res.json({ token: signToken(safeUser), user: safeUser });
});

router.get('/me', requireAuth, async (req, res) => {
  const users = await query(
    'SELECT id, email, first_name AS firstName, last_name AS lastName, role, phone, is_active AS isActive FROM users WHERE id = :id LIMIT 1',
    { id: req.user.sub }
  );
  res.json(users[0] || null);
});

export default router;
