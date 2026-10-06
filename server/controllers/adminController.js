import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

export const getStats = (req, res, next) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    const totalMedia = db.prepare('SELECT COUNT(*) as count FROM media').get()?.count || 0;
    const totalVideos = db.prepare("SELECT COUNT(*) as count FROM media WHERE mediaType = 'video'").get()?.count || 0;
    const totalMusic = db.prepare("SELECT COUNT(*) as count FROM media WHERE mediaType = 'audio'").get()?.count || 0;
    const totalImages = db.prepare("SELECT COUNT(*) as count FROM media WHERE mediaType = 'image'").get()?.count || 0;
    const totalDocs = db.prepare("SELECT COUNT(*) as count FROM media WHERE mediaType = 'document'").get()?.count || 0;
    const totalPlaylists = db.prepare('SELECT COUNT(*) as count FROM playlists').get()?.count || 0;
    const totalViews = db.prepare('SELECT SUM(views) as total FROM media').get()?.total || 0;
    const totalStorageBytes = db.prepare('SELECT SUM(size) as total FROM media').get()?.total || 0;

    // Recent 10 users
    const recentUsers = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.avatar, u.createdAt,
             (SELECT COUNT(*) FROM media m WHERE m.uploadedBy = u.id) as uploadCount
      FROM users u
      ORDER BY u.createdAt DESC
      LIMIT 10
    `).all();

    // Recent 10 uploads
    const recentUploads = db.prepare(`
      SELECT m.id, m.title, m.mediaType, m.size, m.views, m.createdAt,
             u.name as uploaderName, c.name as categoryName
      FROM media m
      LEFT JOIN users u ON u.id = m.uploadedBy
      LEFT JOIN categories c ON c.id = m.categoryId
      ORDER BY m.createdAt DESC
      LIMIT 10
    `).all();

    // Media by category
    const categoryBreakdown = db.prepare(`
      SELECT c.name, COUNT(m.id) as count
      FROM categories c
      LEFT JOIN media m ON m.categoryId = c.id
      GROUP BY c.id
      ORDER BY count DESC
    `).all();

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalMedia,
          totalVideos,
          totalMusic,
          totalImages,
          totalDocs,
          totalPlaylists,
          totalViews,
          totalStorageBytes
        },
        recentUsers,
        recentUploads,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (role && role !== 'all') {
      conditions.push('role = ?');
      params.push(role);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM users ${where}`;
    const total = db.prepare(countSql).get(...params)?.total || 0;

    const usersSql = `
      SELECT id, name, email, role, avatar, bio, createdAt,
             (SELECT COUNT(*) FROM media m WHERE m.uploadedBy = users.id) as uploadCount,
             (SELECT COUNT(*) FROM favorites f WHERE f.userId = users.id) as favoriteCount,
             (SELECT COUNT(*) FROM playlists p WHERE p.userId = users.id) as playlistCount
      FROM users
      ${where}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const users = db.prepare(usersSql).all(...params, limitNum, offset);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be USER or ADMIN.' });
    }

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own admin role.' });
    }

    db.prepare('UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(role, id);

    const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(id);

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const userIdNum = parseInt(id, 10);

    if (userIdNum === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMedia = (req, res, next) => {
  try {
    const { search, mediaType, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      conditions.push('(m.title LIKE ? OR m.description LIKE ? OR m.tags LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (mediaType && mediaType !== 'all') {
      conditions.push('m.mediaType = ?');
      params.push(mediaType);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM media m ${where}`;
    const total = db.prepare(countSql).get(...params)?.total || 0;

    const itemsSql = `
      SELECT m.*, c.name as categoryName, u.name as uploaderName, u.email as uploaderEmail
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      ${where}
      ORDER BY m.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const items = db.prepare(itemsSql).all(...params, limitNum, offset);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteMedia = (req, res, next) => {
  try {
    const { id } = req.params;
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    if (media.filePath && media.filePath.startsWith('/uploads/')) {
      const fullDiskPath = path.join(uploadsDir, '..', media.filePath);
      if (fs.existsSync(fullDiskPath)) {
        try { fs.unlinkSync(fullDiskPath); } catch (e) { console.error('Failed to unlink media:', e); }
      }
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Media deleted successfully by admin.'
    });
  } catch (error) {
    next(error);
  }
};
