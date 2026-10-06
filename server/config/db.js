import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'multimedia.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance and integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER' CHECK(role IN ('USER', 'ADMIN')),
      avatar TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT 'Folder',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      mediaType TEXT NOT NULL CHECK(mediaType IN ('video', 'audio', 'image', 'document')),
      filePath TEXT NOT NULL,
      thumbnail TEXT DEFAULT '',
      categoryId INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      uploadedBy INTEGER REFERENCES users(id) ON DELETE CASCADE,
      duration REAL DEFAULT 0,
      size INTEGER DEFAULT 0,
      mimeType TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      rating REAL DEFAULT 0.0,
      ratingCount INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mediaId INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, mediaId)
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      isPublic INTEGER DEFAULT 1,
      thumbnail TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlistId INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
      mediaId INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      orderIndex INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(playlistId, mediaId)
    );

    CREATE TABLE IF NOT EXISTS watch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mediaId INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      progress REAL DEFAULT 0,
      completed INTEGER DEFAULT 0,
      lastPlayedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, mediaId)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mediaId INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
      review TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, mediaId)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      theme TEXT DEFAULT 'dark',
      autoplay INTEGER DEFAULT 1,
      playbackSpeed REAL DEFAULT 1.0,
      notifications INTEGER DEFAULT 1,
      volume REAL DEFAULT 0.8,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_media_type ON media(mediaType);
    CREATE INDEX IF NOT EXISTS idx_media_category ON media(categoryId);
    CREATE INDEX IF NOT EXISTS idx_media_uploadedBy ON media(uploadedBy);
    CREATE INDEX IF NOT EXISTS idx_media_createdAt ON media(createdAt);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(userId);
    CREATE INDEX IF NOT EXISTS idx_history_user ON watch_history(userId);
    CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(userId);
    CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlistId);
    CREATE INDEX IF NOT EXISTS idx_ratings_media ON ratings(mediaId);
  `);

  console.log('Database initialized successfully with full relational schema.');
}

export default db;
