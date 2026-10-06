import db from '../config/db.js';

export const rateMedia = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { mediaId, score, review = '' } = req.body;

    if (!mediaId || score === undefined) {
      return res.status(400).json({ success: false, message: 'mediaId and score are required.' });
    }

    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({ success: false, message: 'Score must be an integer between 1 and 5.' });
    }

    const media = db.prepare('SELECT id FROM media WHERE id = ?').get(mediaId);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    // Upsert rating
    const existing = db.prepare('SELECT id FROM ratings WHERE userId = ? AND mediaId = ?').get(userId, mediaId);
    if (existing) {
      db.prepare(`
        UPDATE ratings
        SET score = ?, review = ?, createdAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(numericScore, review || '', existing.id);
    } else {
      db.prepare(`
        INSERT INTO ratings (userId, mediaId, score, review)
        VALUES (?, ?, ?, ?)
      `).run(userId, mediaId, numericScore, review || '');
    }

    // Recalculate average rating & ratingCount for the media
    const stats = db.prepare(`
      SELECT AVG(score) as avgRating, COUNT(id) as totalRatings
      FROM ratings
      WHERE mediaId = ?
    `).get(mediaId);

    const newAvg = stats?.avgRating ? Math.round(stats.avgRating * 10) / 10 : 0.0;
    const newCount = stats?.totalRatings || 0;

    db.prepare(`
      UPDATE media
      SET rating = ?, ratingCount = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newAvg, newCount, mediaId);

    res.json({
      success: true,
      message: 'Rating submitted successfully.',
      data: {
        score: numericScore,
        averageRating: newAvg,
        ratingCount: newCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMediaRatings = (req, res, next) => {
  try {
    const { mediaId } = req.params;

    const ratings = db.prepare(`
      SELECT r.id, r.score, r.review, r.createdAt, u.id as userId, u.name as userName, u.avatar as userAvatar
      FROM ratings r
      JOIN users u ON u.id = r.userId
      WHERE r.mediaId = ?
      ORDER BY r.createdAt DESC
    `).all(mediaId);

    const stats = db.prepare(`
      SELECT 
        AVG(score) as avgRating,
        COUNT(id) as totalRatings,
        SUM(CASE WHEN score = 5 THEN 1 ELSE 0 END) as stars5,
        SUM(CASE WHEN score = 4 THEN 1 ELSE 0 END) as stars4,
        SUM(CASE WHEN score = 3 THEN 1 ELSE 0 END) as stars3,
        SUM(CASE WHEN score = 2 THEN 1 ELSE 0 END) as stars2,
        SUM(CASE WHEN score = 1 THEN 1 ELSE 0 END) as stars1
      FROM ratings
      WHERE mediaId = ?
    `).get(mediaId);

    res.json({
      success: true,
      data: {
        ratings,
        stats: {
          averageRating: stats?.avgRating ? Math.round(stats.avgRating * 10) / 10 : 0.0,
          totalRatings: stats?.totalRatings || 0,
          distribution: {
            5: stats?.stars5 || 0,
            4: stats?.stars4 || 0,
            3: stats?.stars3 || 0,
            2: stats?.stars2 || 0,
            1: stats?.stars1 || 0
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
