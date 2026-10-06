import express from 'express';
import {
  getHistory,
  recordHistory,
  removeHistoryItem,
  clearHistory
} from '../controllers/historyController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getHistory);
router.post('/', recordHistory);
router.delete('/clear', clearHistory);
router.delete('/:id', removeHistoryItem);

export default router;
