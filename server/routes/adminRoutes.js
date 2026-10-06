import express from 'express';
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllMedia,
  adminDeleteMedia
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/media', getAllMedia);
router.delete('/media/:id', adminDeleteMedia);

export default router;
