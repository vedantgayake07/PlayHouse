import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';
import { uploadToImageKit, isImageKitConfigured } from '../services/imagekitService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

const inferMediaType = (mimetype, ext) => {
  const m = (mimetype || '').toLowerCase();
  const e = (ext || '').toLowerCase();
  if (m.startsWith('video/') || ['.mp4', '.webm', '.mkv', '.mov', '.avi'].includes(e)) return 'video';
  if (m.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'].includes(e)) return 'audio';
  if (m.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(e)) return 'image';
  return 'document';
};

export const getMedia = (req, res, next) => {
  try {
    const {
      mediaType,
      categoryId,
      search,
      sortBy = 'newest',
      rating,
      page = 1,
      limit = 12,
      tag
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (mediaType && mediaType !== 'all') {
      conditions.push('m.mediaType = ?');
      params.push(mediaType);
    }

    if (categoryId && categoryId !== 'all') {
      conditions.push('m.categoryId = ?');
      params.push(parseInt(categoryId, 10));
    }

    if (search && search.trim()) {
      conditions.push('(m.title LIKE ? OR m.description LIKE ? OR m.tags LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (tag && tag.trim()) {
      conditions.push('m.tags LIKE ?');
      params.push(`%${tag.trim()}%`);
    }

    if (rating) {
      conditions.push('m.rating >= ?');
      params.push(parseFloat(rating));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY m.createdAt DESC';
    if (sortBy === 'popular') {
      orderClause = 'ORDER BY m.views DESC, m.rating DESC';
    } else if (sortBy === 'top_rated') {
      orderClause = 'ORDER BY m.rating DESC, m.ratingCount DESC';
    } else if (sortBy === 'title') {
      orderClause = 'ORDER BY m.title ASC';
    } else if (sortBy === 'oldest') {
      orderClause = 'ORDER BY m.createdAt ASC';
    }

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM media m ${whereClause}`;
    const totalCount = db.prepare(countSql).get(...params)?.total || 0;

    // Items query with favorite flag and user rating if logged in
    const itemsSql = `
      SELECT 
        m.*,
        c.name as categoryName,
        c.slug as categorySlug,
        u.name as uploaderName,
        u.avatar as uploaderAvatar,
        ${currentUserId ? '(SELECT 1 FROM favorites f WHERE f.mediaId = m.id AND f.userId = ?) as isFavorite,' : '0 as isFavorite,'}
        ${currentUserId ? '(SELECT r.score FROM ratings r WHERE r.mediaId = m.id AND r.userId = ?) as userRating,' : 'NULL as userRating,'}
        ${currentUserId ? '(SELECT wh.progress FROM watch_history wh WHERE wh.mediaId = m.id AND wh.userId = ?) as watchProgress' : '0 as watchProgress'}
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const itemParams = currentUserId
      ? [currentUserId, currentUserId, currentUserId, ...params, limitNum, offset]
      : [...params, limitNum, offset];

    const items = db.prepare(itemsSql).all(...itemParams);

    res.json({
      success: true,
      data: {
        items: items.map(item => ({
          ...item,
          isFavorite: Boolean(item.isFavorite)
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMediaById = (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    // Increment view count
    db.prepare('UPDATE media SET views = views + 1 WHERE id = ?').run(id);

    const sql = `
      SELECT 
        m.*,
        c.name as categoryName,
        c.slug as categorySlug,
        u.name as uploaderName,
        u.avatar as uploaderAvatar,
        ${currentUserId ? '(SELECT 1 FROM favorites f WHERE f.mediaId = m.id AND f.userId = ?) as isFavorite,' : '0 as isFavorite,'}
        ${currentUserId ? '(SELECT r.score FROM ratings r WHERE r.mediaId = m.id AND r.userId = ?) as userRating,' : 'NULL as userRating,'}
        ${currentUserId ? '(SELECT wh.progress FROM watch_history wh WHERE wh.mediaId = m.id AND wh.userId = ?) as watchProgress' : '0 as watchProgress'}
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE m.id = ?
    `;

    const params = currentUserId ? [currentUserId, currentUserId, currentUserId, id] : [id];
    const media = db.prepare(sql).get(...params);

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    // Get recent ratings/reviews
    const ratings = db.prepare(`
      SELECT r.score, r.review, r.createdAt, u.name as userName, u.avatar as userAvatar
      FROM ratings r
      JOIN users u ON u.id = r.userId
      WHERE r.mediaId = ?
      ORDER BY r.createdAt DESC
      LIMIT 10
    `).all(id);

    // Related media in same category or same mediaType
    const related = db.prepare(`
      SELECT m.id, m.title, m.mediaType, m.filePath, m.thumbnail, m.duration, m.views, m.rating, m.ratingCount
      FROM media m
      WHERE m.id != ? AND (m.categoryId = ? OR m.mediaType = ?)
      ORDER BY m.views DESC
      LIMIT 6
    `).all(id, media.categoryId, media.mediaType);

    res.json({
      success: true,
      data: {
        ...media,
        isFavorite: Boolean(media.isFavorite),
        ratings,
        related
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMedia = async (req, res, next) => {
  try {
    const file = req.files && req.files['file'] ? req.files['file'][0] : null;
    const thumbnailFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please select a media file to upload.' });
    }

    const { title, description, categoryId, tags, duration } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Media title is required.' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const mediaType = inferMediaType(file.mimetype, ext);

    const relativeSubdir = mediaType === 'video' ? 'videos' :
      mediaType === 'audio' ? 'audio' :
      mediaType === 'image' ? 'images' : 'documents';

    let filePath = `/uploads/${relativeSubdir}/${file.filename}`;
    let thumbnail = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : '';

    if (isImageKitConfigured()) {
      try {
        const uploadResult = await uploadToImageKit(file, `/multimedia_hub/${relativeSubdir}`);
        if (uploadResult && uploadResult.url) {
          filePath = uploadResult.url;
          if (!thumbnail) {
            if (mediaType === 'image') {
              thumbnail = uploadResult.thumbnailUrl || uploadResult.url;
            } else if (mediaType === 'video') {
              thumbnail = `${uploadResult.url}/ik-thumbnail.jpg`;
            }
          }
        }

        if (thumbnailFile) {
          const thumbResult = await uploadToImageKit(thumbnailFile, '/multimedia_hub/thumbnails');
          if (thumbResult && thumbResult.url) {
            thumbnail = thumbResult.url;
          }
        }
      } catch (ikErr) {
        console.warn('ImageKit upload encountered an issue, fallback to local:', ikErr.message);
      }
    }

    const parsedDuration = duration ? parseFloat(duration) : 0;
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : null;

    const insert = db.prepare(`
      INSERT INTO media (
        title, description, mediaType, filePath, thumbnail,
        categoryId, uploadedBy, duration, size, mimeType, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title.trim(),
      description || '',
      mediaType,
      filePath,
      thumbnail,
      parsedCategoryId,
      req.user.id,
      parsedDuration,
      file.size,
      file.mimetype,
      tags || ''
    );

    const newId = Number(result.lastInsertRowid);
    const createdMedia = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE m.id = ?
    `).get(newId);

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully.',
      data: createdMedia
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, tags } = req.body;

    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to edit media.' });
    }

    const isOwner = Number(media.uploadedBy) === Number(req.user.id);
    const isAdmin = req.user.role === 'ADMIN';

    // Only admin can modify all content; individual user can only modify content uploaded by themselves
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only administrators or the owner who uploaded this media can edit it.'
      });
    }

    const file = req.files && req.files['file'] ? req.files['file'][0] : null;
    const thumbnailFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    let newFilePath = media.filePath;
    let newMimeType = media.mimeType;
    let newSize = media.size;
    let newMediaType = media.mediaType;

    if (file) {
      if (media.filePath && media.filePath.startsWith('/uploads/')) {
        const oldDiskPath = path.join(uploadsDir, '..', media.filePath);
        if (fs.existsSync(oldDiskPath)) {
          try { fs.unlinkSync(oldDiskPath); } catch (e) { console.error(e); }
        }
      }
      const ext = path.extname(file.originalname).toLowerCase();
      newMediaType = inferMediaType(file.mimetype, ext);
      const relativeSubdir = newMediaType === 'video' ? 'videos' :
        newMediaType === 'audio' ? 'audio' :
        newMediaType === 'image' ? 'images' : 'documents';

      newFilePath = `/uploads/${relativeSubdir}/${file.filename}`;
      newMimeType = file.mimetype;
      newSize = file.size;

      if (isImageKitConfigured()) {
        try {
          const uploadResult = await uploadToImageKit(file, `/multimedia_hub/${relativeSubdir}`);
          if (uploadResult && uploadResult.url) {
            newFilePath = uploadResult.url;
          }
        } catch (ikErr) {
          console.warn('ImageKit update encountered an issue:', ikErr.message);
        }
      }
    }

    let newThumbnail = media.thumbnail;
    if (thumbnailFile) {
      if (media.thumbnail && media.thumbnail.startsWith('/uploads/')) {
        const oldThumbPath = path.join(uploadsDir, '..', media.thumbnail);
        if (fs.existsSync(oldThumbPath)) {
          try { fs.unlinkSync(oldThumbPath); } catch (e) { console.error(e); }
        }
      }
      newThumbnail = `/uploads/thumbnails/${thumbnailFile.filename}`;

      if (isImageKitConfigured()) {
        try {
          const thumbResult = await uploadToImageKit(thumbnailFile, '/multimedia_hub/thumbnails');
          if (thumbResult && thumbResult.url) {
            newThumbnail = thumbResult.url;
          }
        } catch (ikErr) {
          console.warn('ImageKit thumbnail update encountered an issue:', ikErr.message);
        }
      }
    }

    db.prepare(`
      UPDATE media
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          categoryId = COALESCE(?, categoryId),
          tags = COALESCE(?, tags),
          filePath = ?,
          thumbnail = ?,
          mediaType = ?,
          mimeType = ?,
          size = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      description !== undefined ? description : null,
      categoryId !== undefined && categoryId !== '' ? parseInt(categoryId, 10) : null,
      tags !== undefined ? tags : null,
      newFilePath,
      newThumbnail,
      newMediaType,
      newMimeType,
      newSize,
      id
    );

    const updated = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE m.id = ?
    `).get(id);

    res.json({
      success: true,
      message: 'Media updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = (req, res, next) => {
  try {
    const { id } = req.params;
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to delete media.' });
    }

    const isOwner = Number(media.uploadedBy) === Number(req.user.id);
    const isAdmin = req.user.role === 'ADMIN';

    // Only admin can delete all content; individual user can only delete content uploaded by themselves
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only administrators or the owner who uploaded this media can delete it.'
      });
    }

    // Try deleting actual file from disk if it exists
    if (media.filePath && media.filePath.startsWith('/uploads/')) {
      const fullDiskPath = path.join(uploadsDir, '..', media.filePath);
      if (fs.existsSync(fullDiskPath)) {
        try { fs.unlinkSync(fullDiskPath); } catch (e) { console.error('Failed to unlink media file:', e); }
      }
    }

    if (media.thumbnail && media.thumbnail.startsWith('/uploads/')) {
      const fullThumbPath = path.join(uploadsDir, '..', media.thumbnail);
      if (fs.existsSync(fullThumbPath)) {
        try { fs.unlinkSync(fullThumbPath); } catch (e) { console.error('Failed to unlink thumbnail:', e); }
      }
    }

    // Clean up dependent records
    try {
      db.prepare('DELETE FROM favorites WHERE mediaId = ?').run(id);
      db.prepare('DELETE FROM ratings WHERE mediaId = ?').run(id);
      db.prepare('DELETE FROM watch_history WHERE mediaId = ?').run(id);
      db.prepare('DELETE FROM playlist_items WHERE mediaId = ?').run(id);
    } catch (e) {
      console.warn('Foreign key cleanup notice:', e.message);
    }

    db.prepare('DELETE FROM media WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Media deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;

    // Continue watching / listening (from watch_history)
    let continueWatching = [];
    if (currentUserId) {
      continueWatching = db.prepare(`
        SELECT m.*, wh.progress, wh.lastPlayedAt, c.name as categoryName, u.name as uploaderName
        FROM watch_history wh
        JOIN media m ON m.id = wh.mediaId
        LEFT JOIN categories c ON c.id = m.categoryId
        LEFT JOIN users u ON u.id = m.uploadedBy
        WHERE wh.userId = ? AND wh.completed = 0 AND wh.progress > 0
        ORDER BY wh.lastPlayedAt DESC
        LIMIT 6
      `).all(currentUserId);
    }

    // Trending (views + rating)
    const trending = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      ORDER BY (m.views * 2 + m.rating * 10) DESC
      LIMIT 8
    `).all();

    // Recommended
    const recommended = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      ORDER BY m.rating DESC, m.views DESC
      LIMIT 8
    `).all();

    // Recently Added
    const recentlyAdded = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      ORDER BY m.createdAt DESC
      LIMIT 8
    `).all();

    // Popular Music
    const popularMusic = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE m.mediaType = 'audio'
      ORDER BY m.views DESC, m.rating DESC
      LIMIT 6
    `).all();

    // Featured Videos
    const featuredVideos = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE m.mediaType = 'video'
      ORDER BY m.views DESC
      LIMIT 6
    `).all();

    // Image Gallery Showcase
    const imageGallery = db.prepare(`
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE m.mediaType = 'image'
      ORDER BY m.createdAt DESC
      LIMIT 8
    `).all();

    res.json({
      success: true,
      data: {
        continueWatching,
        trending,
        recommended,
        recentlyAdded,
        popularMusic,
        featuredVideos,
        imageGallery
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchMedia = (req, res, next) => {
  try {
    const { q, type } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, data: { items: [], suggestions: [], counts: {} } });
    }

    const term = `%${q.trim()}%`;

    // Suggestions (matching titles)
    const suggestions = db.prepare(`
      SELECT DISTINCT title FROM media WHERE title LIKE ? LIMIT 6
    `).all(term).map(s => s.title);

    // Counts per media type
    const countsRaw = db.prepare(`
      SELECT mediaType, COUNT(*) as count
      FROM media
      WHERE title LIKE ? OR description LIKE ? OR tags LIKE ?
      GROUP BY mediaType
    `).all(term, term, term);

    const counts = { video: 0, audio: 0, image: 0, document: 0 };
    countsRaw.forEach(c => { counts[c.mediaType] = c.count; });

    let sql = `
      SELECT m.*, c.name as categoryName, u.name as uploaderName
      FROM media m
      LEFT JOIN categories c ON c.id = m.categoryId
      LEFT JOIN users u ON u.id = m.uploadedBy
      WHERE (m.title LIKE ? OR m.description LIKE ? OR m.tags LIKE ?)
    `;
    const params = [term, term, term];

    if (type && type !== 'all') {
      sql += ' AND m.mediaType = ?';
      params.push(type);
    }

    sql += ' ORDER BY m.views DESC, m.rating DESC LIMIT 30';
    const items = db.prepare(sql).all(...params);

    res.json({
      success: true,
      data: {
        items,
        suggestions,
        counts
      }
    });
  } catch (error) {
    next(error);
  }
};
