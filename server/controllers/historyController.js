import db from '../config/db.js';

export const getHistory = (req, res, next) => {
  try {
    const userId = req.user.id;

    const history = db.prepare(`
      SELECT 
        wh.id as historyId,
        wh.progress,
        wh.completed,
        wh.lastPlayedAt,
        m.*,
        c.name as categoryName,
        u.name as uploaderName,
        (SELECT 1 FROM favorites f WHERE f.mediaId = m.id AND f.userId = ?) as isFavorite
      FROM watch_history wh
      JOIN media m ON m.id = wh.mediaId
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE wh.userId = ?
      ORDER BY wh.lastPlayedAt DESC
      LIMIT 100
    `).all(userId, userId);

    res.json({
      success: true,
      data: history.map(item => ({ ...item, isFavorite: Boolean(item.isFavorite) }))
    });
  } catch (error) {
    next(error);
  }
};

export const recordHistory = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mediaId, progress, completed = 0 } = req.body;

    if (!mediaId) {
      return res.status(400).json({ success: false, message: 'mediaId is required.' });
    }

    const media = db.prepare('SELECT id FROM media WHERE id = ?').get(mediaId);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    // Upsert into watch_history
    const existing = db.prepare('SELECT id FROM watch_history WHERE userId = ? AND mediaId = ?').get(userId, mediaId);
    if (existing) {
      db.prepare(`
        UPDATE watch_history
        SET progress = ?,
            completed = ?,
            lastPlayedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(progress || 0, completed ? 1 : 0, existing.id);
    } else {
      db.prepare(`
        INSERT INTO watch_history (userId, mediaId, progress, completed)
        VALUES (?, ?, ?, ?)
      `).run(userId, mediaId, progress || 0, completed ? 1 : 0);
    }

    res.json({
      success: true,
      message: 'History updated.'
    });
  } catch (error) {
    next(error);
  }
};

export const removeHistoryItem = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // historyId or mediaId

    // Try deleting by watch_history.id or by mediaId
    db.prepare('DELETE FROM watch_history WHERE userId = ? AND (id = ? OR mediaId = ?)').run(userId, id, id);

    res.json({
      success: true,
      message: 'History item removed.'
    });
  } catch (error) {
    next(error);
  }
};

export const clearHistory = (req, res, next) => {
  try {
    const userId = req.user.id;
    db.prepare('DELETE FROM watch_history WHERE userId = ?').run(userId);

    res.json({
      success: true,
      message: 'Watch history cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};
