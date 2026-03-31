import express from 'express';
import { uploadListingImage } from '../middleware/upload.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/listing-image',
  requireAuth,
  requireRole('seller', 'admin'),
  uploadListingImage.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    res.status(201).json({
      message: 'Image uploaded successfully.',
      imageUrl: `/uploads/${req.file.filename}`
    });
  }
);

export default router;