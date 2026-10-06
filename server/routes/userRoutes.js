import express from 'express';
import { updateSettings, getSettings } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
