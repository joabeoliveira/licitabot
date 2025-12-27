import express from 'express';
import { getExternalTenders, getSavedTenders, saveTender } from '../controllers/tenderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/tenders/external - Fetch from PNCP
router.get('/external', protect, getExternalTenders);

// GET /api/tenders/saved - Fetch from MongoDB (Protected)
router.get('/saved', protect, getSavedTenders);

// POST /api/tenders - Save/Monitor a tender (Protected)
router.post('/', protect, saveTender);

export default router;
