import express from 'express';
import certificateController from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Rotas protegidas para Gestão de Conformidade
 */
router.use(protect); // Todas as rotas abaixo requerem autenticação

router.get('/', certificateController.getAll);
router.post('/', certificateController.create);
router.post('/:id/validate', certificateController.validate);
router.delete('/:id', certificateController.delete);

export default router;
