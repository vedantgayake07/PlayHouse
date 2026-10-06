import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { uploadToImageKit, isImageKitConfigured } from '../services/imagekitService.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_multimedia_hub_key_2026_xyz', {
    expiresIn: '7d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, 'USER')
    `);
    const result = insertStmt.run(name.trim(), email.trim().toLowerCase(), hashedPassword);
    const userId = Number(result.lastInsertRowid);

    // Initialize user settings
    db.prepare('INSERT INTO settings (userId) VALUES (?)').run(userId);

    const token = signToken(userId);
    const user = db.prepare('SELECT id, name, email, role, avatar, bio, createdAt FROM users WHERE id = ?').get(userId);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken(user.id);
    const { password: _, ...userData } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = (req, res, next) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, avatar, bio, createdAt FROM users WHERE id = ?').get(req.user.id);
    const settings = db.prepare('SELECT theme, autoplay, playbackSpeed, notifications, volume FROM settings WHERE userId = ?').get(req.user.id) || {
      theme: 'dark',
      autoplay: 1,
      playbackSpeed: 1.0,
      notifications: 1,
      volume: 0.8
    };

    const uploadCount = db.prepare('SELECT COUNT(*) as count FROM media WHERE uploadedBy = ?').get(req.user.id)?.count || 0;
    const favoriteCount = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE userId = ?').get(req.user.id)?.count || 0;
    const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists WHERE userId = ?').get(req.user.id)?.count || 0;
    const historyCount = db.prepare('SELECT COUNT(*) as count FROM watch_history WHERE userId = ?').get(req.user.id)?.count || 0;

    res.json({
      success: true,
      data: {
        user,
        settings,
        stats: {
          uploads: uploadCount,
          favorites: favoriteCount,
          playlists: playlistCount,
          history: historyCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    db.prepare(`
      UPDATE users 
      SET name = ?, bio = ?, avatar = COALESCE(?, avatar), updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(name.trim(), bio || '', avatar || null, req.user.id);

    const updatedUser = db.prepare('SELECT id, name, email, role, avatar, bio, createdAt FROM users WHERE id = ?').get(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, req.user.id);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar image file provided.' });
    }

    let avatarUrl = `/uploads/avatars/${req.file.filename}`;

    if (isImageKitConfigured()) {
      try {
        const uploadResult = await uploadToImageKit(req.file, '/multimedia_hub/avatars');
        if (uploadResult && uploadResult.url) {
          avatarUrl = uploadResult.url;
        }
      } catch (ikErr) {
        console.warn('ImageKit avatar upload fallback to local:', ikErr.message);
      }
    }

    db.prepare('UPDATE users SET avatar = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(avatarUrl, req.user.id);

    res.json({
      success: true,
      message: 'Avatar updated successfully.',
      data: { avatar: avatarUrl }
    });
  } catch (error) {
    next(error);
  }
};
