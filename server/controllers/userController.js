import db from '../config/db.js';

export const updateSettings = (req, res, next) => {
  try {
    const userId = req.user.id;
    const { theme, autoplay, playbackSpeed, notifications, volume } = req.body;

    const existing = db.prepare('SELECT id FROM settings WHERE userId = ?').get(userId);
    if (existing) {
      db.prepare(`
        UPDATE settings
        SET theme = COALESCE(?, theme),
            autoplay = COALESCE(?, autoplay),
            playbackSpeed = COALESCE(?, playbackSpeed),
            notifications = COALESCE(?, notifications),
            volume = COALESCE(?, volume),
            updatedAt = CURRENT_TIMESTAMP
        WHERE userId = ?
      `).run(
        theme !== undefined ? theme : null,
        autoplay !== undefined ? (autoplay ? 1 : 0) : null,
        playbackSpeed !== undefined ? parseFloat(playbackSpeed) : null,
        notifications !== undefined ? (notifications ? 1 : 0) : null,
        volume !== undefined ? parseFloat(volume) : null,
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO settings (userId, theme, autoplay, playbackSpeed, notifications, volume)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        theme || 'dark',
        autoplay !== undefined ? (autoplay ? 1 : 0) : 1,
        playbackSpeed !== undefined ? parseFloat(playbackSpeed) : 1.0,
        notifications !== undefined ? (notifications ? 1 : 0) : 1,
        volume !== undefined ? parseFloat(volume) : 0.8
      );
    }

    const updated = db.prepare('SELECT theme, autoplay, playbackSpeed, notifications, volume FROM settings WHERE userId = ?').get(userId);

    res.json({
      success: true,
      message: 'Settings saved successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const getSettings = (req, res, next) => {
  try {
    const userId = req.user.id;
    let settings = db.prepare('SELECT theme, autoplay, playbackSpeed, notifications, volume FROM settings WHERE userId = ?').get(userId);

    if (!settings) {
      db.prepare('INSERT INTO settings (userId) VALUES (?)').run(userId);
      settings = {
        theme: 'dark',
        autoplay: 1,
        playbackSpeed: 1.0,
        notifications: 1,
        volume: 0.8
      };
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
