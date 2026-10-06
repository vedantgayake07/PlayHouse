import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_multimedia_hub_key_2026_xyz');
    const stmt = db.prepare('SELECT id, name, email, role, avatar, bio, createdAt FROM users WHERE id = ?');
    const user = stmt.get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message
    });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_multimedia_hub_key_2026_xyz');
    const stmt = db.prepare('SELECT id, name, email, role, avatar, bio, createdAt FROM users WHERE id = ?');
    const user = stmt.get(decoded.id);
    req.user = user || null;
  } catch (error) {
    req.user = null;
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.'
    });
  }
  next();
};
