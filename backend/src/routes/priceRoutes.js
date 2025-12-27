import express from 'express';
import { analyzePrice } from '../controllers/priceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/prices/analyze?q=...
router.get('/analyze', protect, analyzePrice);

export default router;
