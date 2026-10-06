import express from 'express';
import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addPlaylistItem,
  removePlaylistItem
} from '../controllers/playlistController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPlaylists);
router.get('/:id', optionalAuth, getPlaylistById);
router.post('/', authenticate, createPlaylist);
router.put('/:id', authenticate, updatePlaylist);
router.delete('/:id', authenticate, deletePlaylist);

router.post('/:id/items', authenticate, addPlaylistItem);
router.delete('/:id/items/:mediaId', authenticate, removePlaylistItem);

export default router;
