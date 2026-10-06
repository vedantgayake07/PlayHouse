import express from 'express';
import {
  getMedia,
  getMediaById,
  uploadMedia,
  updateMedia,
  deleteMedia,
  getDashboardSummary,
  searchMedia
} from '../controllers/mediaController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { uploadMediaFiles } from '../middleware/upload.js';

const router = express.Router();

router.get('/dashboard', optionalAuth, getDashboardSummary);
router.get('/search', searchMedia);
router.get('/', optionalAuth, getMedia);
router.get('/:id', optionalAuth, getMediaById);
router.post('/', authenticate, uploadMediaFiles, uploadMedia);
router.put('/:id', authenticate, uploadMediaFiles, updateMedia);
router.delete('/:id', authenticate, deleteMedia);

export default router;
