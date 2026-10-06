import db from '../config/db.js';

export const getFavorites = (req, res, next) => {
  try {
    const { mediaType } = req.query;
    const userId = req.user.id;

    let sql = `
      SELECT 
        m.*,
        c.name as categoryName,
        u.name as uploaderName,
        1 as isFavorite,
        f.createdAt as favoritedAt
      FROM favorites f
      JOIN media m ON m.id = f.mediaId
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE f.userId = ?
    `;

    const params = [userId];

    if (mediaType && mediaType !== 'all') {
      sql += ' AND m.mediaType = ?';
      params.push(mediaType);
    }

    sql += ' ORDER BY f.createdAt DESC';

    const items = db.prepare(sql).all(...params);

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const addFavorite = (req, res, next) => {
  try {
    const { mediaId } = req.body;
    const userId = req.user.id;

    if (!mediaId) {
      return res.status(400).json({ success: false, message: 'mediaId is required.' });
    }

    const media = db.prepare('SELECT id FROM media WHERE id = ?').get(mediaId);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    // Insert or ignore if duplicate
    const existing = db.prepare('SELECT id FROM favorites WHERE userId = ? AND mediaId = ?').get(userId, mediaId);
    if (!existing) {
      db.prepare('INSERT INTO favorites (userId, mediaId) VALUES (?, ?)').run(userId, mediaId);
      db.prepare('UPDATE media SET likes = likes + 1 WHERE id = ?').run(mediaId);
    }

    res.status(201).json({
      success: true,
      message: 'Added to favorites.',
      isFavorite: true
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = (req, res, next) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const existing = db.prepare('SELECT id FROM favorites WHERE userId = ? AND mediaId = ?').get(userId, mediaId);
    if (existing) {
      db.prepare('DELETE FROM favorites WHERE userId = ? AND mediaId = ?').run(userId, mediaId);
      db.prepare('UPDATE media SET likes = MAX(0, likes - 1) WHERE id = ?').run(mediaId);
    }

    res.json({
      success: true,
      message: 'Removed from favorites.',
      isFavorite: false
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = (req, res, next) => {
  try {
    const { mediaId } = req.body;
    const userId = req.user.id;

    if (!mediaId) {
      return res.status(400).json({ success: false, message: 'mediaId is required.' });
    }

    const existing = db.prepare('SELECT id FROM favorites WHERE userId = ? AND mediaId = ?').get(userId, mediaId);
    if (existing) {
      db.prepare('DELETE FROM favorites WHERE userId = ? AND mediaId = ?').run(userId, mediaId);
      db.prepare('UPDATE media SET likes = MAX(0, likes - 1) WHERE id = ?').run(mediaId);
      return res.json({
        success: true,
        message: 'Removed from favorites.',
        isFavorite: false
      });
    } else {
      db.prepare('INSERT INTO favorites (userId, mediaId) VALUES (?, ?)').run(userId, mediaId);
      db.prepare('UPDATE media SET likes = likes + 1 WHERE id = ?').run(mediaId);
      return res.json({
        success: true,
        message: 'Added to favorites.',
        isFavorite: true
      });
    }
  } catch (error) {
    next(error);
  }
};
