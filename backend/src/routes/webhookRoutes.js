import express from 'express';
import webhookController from '../controllers/webhookController.js';

const router = express.Router();

// Rota que o n8n chamará para devolver resultados
router.post('/n8n-response', webhookController.handleN8nResponse);

export default router;
