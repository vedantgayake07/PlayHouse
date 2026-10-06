import db from '../config/db.js';

export const getPlaylists = (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { userOnly } = req.query;

    let sql = `
      SELECT 
        p.*,
        u.name as creatorName,
        COUNT(pi.id) as itemCount
      FROM playlists p
      JOIN users u ON u.id = p.userId
      LEFT JOIN playlist_items pi ON pi.playlistId = p.id
    `;

    const params = [];
    if (userOnly === 'true' && userId) {
      sql += ' WHERE p.userId = ?';
      params.push(userId);
    } else if (userId) {
      sql += ' WHERE (p.userId = ? OR p.isPublic = 1)';
      params.push(userId);
    } else {
      sql += ' WHERE p.isPublic = 1';
    }

    sql += ' GROUP BY p.id ORDER BY p.updatedAt DESC';

    const playlists = db.prepare(sql).all(...params);

    res.json({
      success: true,
      data: playlists
    });
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const playlist = db.prepare(`
      SELECT p.*, u.name as creatorName, u.avatar as creatorAvatar
      FROM playlists p
      JOIN users u ON u.id = p.userId
      WHERE p.id = ?
    `).get(id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (!playlist.isPublic && (!userId || playlist.userId !== userId)) {
      return res.status(403).json({ success: false, message: 'This playlist is private.' });
    }

    // Get items in order
    const items = db.prepare(`
      SELECT 
        m.*,
        c.name as categoryName,
        u.name as uploaderName,
        pi.orderIndex,
        pi.createdAt as addedAt,
        ${userId ? '(SELECT 1 FROM favorites f WHERE f.mediaId = m.id AND f.userId = ?) as isFavorite' : '0 as isFavorite'}
      FROM playlist_items pi
      JOIN media m ON m.id = pi.mediaId
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE pi.playlistId = ?
      ORDER BY pi.orderIndex ASC, pi.createdAt ASC
    `).all(...(userId ? [userId, id] : [id]));

    res.json({
      success: true,
      data: {
        ...playlist,
        items: items.map(item => ({ ...item, isFavorite: Boolean(item.isFavorite) }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createPlaylist = (req, res, next) => {
  try {
    const { title, description, isPublic = true, thumbnail = '' } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Playlist title is required.' });
    }

    const insert = db.prepare(`
      INSERT INTO playlists (userId, title, description, isPublic, thumbnail)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      req.user.id,
      title.trim(),
      description || '',
      isPublic ? 1 : 0,
      thumbnail || ''
    );

    const newPlaylist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(Number(result.lastInsertRowid));

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully.',
      data: { ...newPlaylist, itemCount: 0 }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic, thumbnail } = req.body;

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    db.prepare(`
      UPDATE playlists
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          isPublic = COALESCE(?, isPublic),
          thumbnail = COALESCE(?, thumbnail),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      description !== undefined ? description : null,
      isPublic !== undefined ? (isPublic ? 1 : 0) : null,
      thumbnail !== undefined ? thumbnail : null,
      id
    );

    const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Playlist updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = (req, res, next) => {
  try {
    const { id } = req.params;
    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    db.prepare('DELETE FROM playlists WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Playlist deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const addPlaylistItem = (req, res, next) => {
  try {
    const { id } = req.params; // playlistId
    const { mediaId } = req.body;

    if (!mediaId) {
      return res.status(400).json({ success: false, message: 'mediaId is required.' });
    }

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    const existing = db.prepare('SELECT id FROM playlist_items WHERE playlistId = ? AND mediaId = ?').get(id, mediaId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Media is already in this playlist.' });
    }

    // Get max orderIndex
    const maxOrder = db.prepare('SELECT MAX(orderIndex) as maxO FROM playlist_items WHERE playlistId = ?').get(id)?.maxO || 0;

    db.prepare(`
      INSERT INTO playlist_items (playlistId, mediaId, orderIndex)
      VALUES (?, ?, ?)
    `).run(id, mediaId, maxOrder + 1);

    // Update playlist thumbnail if playlist doesn't have one
    if (!playlist.thumbnail) {
      const media = db.prepare('SELECT thumbnail FROM media WHERE id = ?').get(mediaId);
      if (media && media.thumbnail) {
        db.prepare('UPDATE playlists SET thumbnail = ? WHERE id = ?').run(media.thumbnail, id);
      }
    }

    db.prepare('UPDATE playlists SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    res.status(201).json({
      success: true,
      message: 'Added to playlist.'
    });
  } catch (error) {
    next(error);
  }
};

export const removePlaylistItem = (req, res, next) => {
  try {
    const { id, mediaId } = req.params;

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    db.prepare('DELETE FROM playlist_items WHERE playlistId = ? AND mediaId = ?').run(id, mediaId);
    db.prepare('UPDATE playlists SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Item removed from playlist.'
    });
  } catch (error) {
    next(error);
  }
};
