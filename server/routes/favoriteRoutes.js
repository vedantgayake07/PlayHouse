import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite
} from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.post('/toggle', toggleFavorite);
router.delete('/:mediaId', removeFavorite);

export default router;
