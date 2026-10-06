import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { initDatabase } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Ensure database tables exist
initDatabase();

// Ensure upload subdirectories exist
const uploadsDir = path.join(__dirname, 'uploads');
['videos', 'audio', 'images', 'documents', 'thumbnails', 'avatars'].forEach(sub => {
  const dir = path.join(uploadsDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded media files with proper CORS and cache headers
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    // Enable range requests for seeking in video/audio
    res.set('Accept-Ranges', 'bytes');
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Multimedia Hub API',
    version: '1.0.0'
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Multimedia Hub Server running on port ${PORT}`);
  console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(` Uploads served at: http://localhost:${PORT}/uploads`);
  console.log(`===============================================`);
});
