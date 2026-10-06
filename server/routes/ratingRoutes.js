import express from 'express';
import { rateMedia, getMediaRatings } from '../controllers/ratingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/media/:mediaId', getMediaRatings);
router.post('/', authenticate, rateMedia);

export default router;
