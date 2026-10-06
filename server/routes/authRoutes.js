import express from 'express';
import { register, login, getMe, updateProfile, changePassword, uploadAvatarHandler } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/avatar', authenticate, uploadAvatar, uploadAvatarHandler);

export default router;
