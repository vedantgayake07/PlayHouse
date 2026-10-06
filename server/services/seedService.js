import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import db, { initDatabase } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploads = path.join(__dirname, '..', 'uploads');

// Ensure directories
['videos', 'audio', 'images', 'documents', 'thumbnails', 'avatars'].forEach(dir => {
  const d = path.join(baseUploads, dir);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Helper: Synthesize genuine PCM WAV audio buffer
function createWavBuffer({ durationSec = 10, sampleRate = 22050, frequencies = [261.63, 329.63, 392.00] }) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = durationSec * sampleRate;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate pleasant synthesized chord progression with envelope
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Harmonic blend
    frequencies.forEach((freq, idx) => {
      const vibrato = Math.sin(2 * Math.PI * 4 * t) * 1.5;
      const wave = Math.sin(2 * Math.PI * (freq + vibrato) * t);
      // Envelope
      const attack = Math.min(1, t / 0.5);
      const decay = Math.max(0.1, 1 - (t % 2.5) / 3.0);
      sample += wave * (0.25 / (idx + 1)) * attack * decay;
    });

    // Soft clip
    sample = Math.max(-0.95, Math.min(0.95, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

// Helper: Generate clean modern SVG image
function createSvgArtwork({ title, subtitle, bgGrad1, bgGrad2, accentColor, iconSvg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGrad1}" />
        <stop offset="100%" stop-color="${bgGrad2}" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
      </linearGradient>
      <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="40" result="blur" />
      </filter>
    </defs>
    <rect width="1200" height="800" fill="url(#bgGrad)" />
    <!-- Ambient geometric shapes -->
    <circle cx="200" cy="200" r="180" fill="${accentColor}" opacity="0.15" filter="url(#blurFilter)" />
    <circle cx="1000" cy="600" r="240" fill="${bgGrad1}" opacity="0.25" filter="url(#blurFilter)" />
    <polygon points="600,150 780,450 420,450" fill="none" stroke="${accentColor}" stroke-width="3" opacity="0.3" />
    <circle cx="600" cy="400" r="140" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.2" />
    <circle cx="600" cy="400" r="80" fill="url(#glowGrad)" opacity="0.8" />
    
    <!-- Central Icon/Symbol -->
    <g transform="translate(560, 360) scale(1.6)" fill="#ffffff">
      ${iconSvg}
    </g>

    <!-- Typography -->
    <text x="600" y="580" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" fill="#ffffff" letter-spacing="1.5">
      ${title}
    </text>
    <text x="600" y="630" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#cbd5e1" letter-spacing="0.5">
      ${subtitle}
    </text>
  </svg>`;
}

// Helper: Generate genuine valid PDF buffer
function createPdfBuffer({ title, author, content }) {
  const lines = content.split('\n');
  let streamContent = `BT /F1 20 Tf 50 720 Td (${title}) Tj ET\n`;
  streamContent += `BT /F2 12 Tf 50 695 Td (Author: ${author} | Multimedia Hub Technical Library) Tj ET\n`;
  streamContent += `BT /F2 11 Tf 50 660 Td\n`;

  lines.forEach((line, index) => {
    const safeLine = line.replace(/[\\()]/g, '');
    streamContent += `(${safeLine}) ' \n`;
  });
  streamContent += `ET\n`;

  const streamLength = Buffer.byteLength(streamContent);

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000340 00000 n 
0000000418 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
490
%%EOF`;

  return Buffer.from(pdf);
}

// Helper: Download file safely with fallback
async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    console.log(`Downloaded: ${path.basename(destPath)}`);
    return true;
  } catch (err) {
    console.warn(`Could not download ${url}: ${err.message}. Using synthetic fallback.`);
    return false;
  }
}

export async function runSeed() {
  console.log('--- Commencing Multimedia Hub Database Seeding ---');
  initDatabase();

  // 1. Clear existing seed data if any
  db.exec(`
    DELETE FROM ratings;
    DELETE FROM watch_history;
    DELETE FROM playlist_items;
    DELETE FROM playlists;
    DELETE FROM favorites;
    DELETE FROM media;
    DELETE FROM categories;
    DELETE FROM settings;
    DELETE FROM users;
  `);

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, bio, avatar)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const adminResult = insertUser.run(
    'Alex Vance (Administrator)',
    'admin@multimediahub.com',
    adminPasswordHash,
    'ADMIN',
    'Platform architect and lead system administrator for Multimedia Hub.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );
  const adminId = Number(adminResult.lastInsertRowid);

  const userResult = insertUser.run(
    'Sarah Connor',
    'user@multimediahub.com',
    userPasswordHash,
    'USER',
    'Audiophile, digital media producer, and visual artist exploring modern creative hubs.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );
  const userId = Number(userResult.lastInsertRowid);

  // Settings
  db.prepare('INSERT INTO settings (userId, theme, autoplay, playbackSpeed) VALUES (?, ?, ?, ?)').run(adminId, 'dark', 1, 1.0);
  db.prepare('INSERT INTO settings (userId, theme, autoplay, playbackSpeed) VALUES (?, ?, ?, ?)').run(userId, 'dark', 1, 1.0);

  // 3. Create Categories
  const categoriesData = [
    { name: 'Movies & Cinema', slug: 'movies', description: 'Feature films, shorts, trailers, and cinematic masterpieces.', icon: 'Film' },
    { name: 'Music & Audio', slug: 'music', description: 'Lossless audio tracks, beats, podcasts, and instrumental compositions.', icon: 'Music' },
    { name: 'Video Clips', slug: 'videos', description: 'Curated creative video clips, tutorials, and short format videos.', icon: 'Video' },
    { name: 'Digital Art & Photography', slug: 'images', description: 'High-definition digital photography, wallpapers, and conceptual artwork.', icon: 'Image' },
    { name: 'Documents & Research', slug: 'documents', description: 'PDF whitepapers, technical guides, specifications, and books.', icon: 'FileText' },
    { name: 'Technology & AI', slug: 'technology', description: 'Innovations in computing, multimedia codecs, neural systems, and tech news.', icon: 'Cpu' },
    { name: 'Nature & Exploration', slug: 'nature', description: 'Wonders of nature, wildlife showcases, and planetary landscapes.', icon: 'Compass' }
  ];

  const insertCategory = db.prepare('INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)');
  const catMap = {};

  categoriesData.forEach(cat => {
    const res = insertCategory.run(cat.name, cat.slug, cat.description, cat.icon);
    catMap[cat.slug] = Number(res.lastInsertRowid);
  });

  // 4. Generate/Download Media Files

  // Videos
  const video1Path = path.join(baseUploads, 'videos', 'nature-blooming.mp4');
  const video2Path = path.join(baseUploads, 'videos', 'bunny-teaser.mp4');

  await downloadFile('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', video1Path);
  await downloadFile('https://www.w3schools.com/html/mov_bbb.mp4', video2Path);

  // Audio files (real synthesized WAV files)
  const audioTracks = [
    {
      fileName: 'ambient-glow.wav',
      frequencies: [220.00, 277.18, 329.63, 440.00], // A Major chord
      durationSec: 15,
      title: 'Ambient Glow (A Major Synthesis)',
      description: 'An ethereal harmonic soundscape generated with multi-oscillator frequency modulations.',
      tags: 'ambient,synth,chill,relax',
      category: catMap['music']
    },
    {
      fileName: 'lofi-midnight-drift.wav',
      frequencies: [174.61, 220.00, 261.63, 349.23], // F Major 7th
      durationSec: 18,
      title: 'Midnight Drift (Lo-Fi Chords)',
      description: 'Warm analog-style harmonic pads designed for deep focus and late-night coding sessions.',
      tags: 'lofi,focus,beats,analog',
      category: catMap['music']
    },
    {
      fileName: 'cyberpunk-neon-pulse.wav',
      frequencies: [146.83, 174.61, 220.00, 293.66], // D Minor synthwave
      durationSec: 14,
      title: 'Cyberpunk Neon Pulse',
      description: 'High-energy electronic frequency sweep with resonant pulse width modulation.',
      tags: 'cyberpunk,electronic,synthwave,retro',
      category: catMap['music']
    }
  ];

  audioTracks.forEach(track => {
    const target = path.join(baseUploads, 'audio', track.fileName);
    const wavBuf = createWavBuffer({ durationSec: track.durationSec, frequencies: track.frequencies });
    fs.writeFileSync(target, wavBuf);
  });

  // Image files (High-res SVG artwork)
  const imageAssets = [
    {
      fileName: 'cyberpunk-skyline.svg',
      title: 'Neo-Tokyo Horizon',
      subtitle: 'Digital Concept Art & Cyberpunk Aesthetic',
      bg1: '#0f172a', bg2: '#311042', accent: '#ec4899',
      tags: 'cyberpunk,digital art,wallpaper,neon',
      category: catMap['images'],
      icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ffffff" stroke-width="2" fill="none"/>'
    },
    {
      fileName: 'minimal-mountains.svg',
      title: 'Alpine Twilight',
      subtitle: 'Vector Landscape & Geometric Sunset',
      bg1: '#1e293b', bg2: '#0f766e', accent: '#38bdf8',
      tags: 'landscape,minimalist,mountains,nature',
      category: catMap['images'],
      icon: '<polygon points="12,2 2,22 22,22" stroke="#ffffff" stroke-width="2" fill="none"/>'
    },
    {
      fileName: 'quantum-core.svg',
      title: 'Quantum Processor Matrix',
      subtitle: 'Next-Generation Neural Computing & Hardware',
      bg1: '#030712', bg2: '#1e1b4b', accent: '#6366f1',
      tags: 'technology,quantum,abstract,computing',
      category: catMap['technology'],
      icon: '<rect x="4" y="4" width="16" height="16" rx="2" stroke="#ffffff" stroke-width="2" fill="none"/><line x1="9" y1="9" x2="15" y2="15" stroke="#ffffff" stroke-width="2"/>'
    },
    {
      fileName: 'nebula-voyage.svg',
      title: 'Orion Stellar Nursery',
      subtitle: 'Deep Space Hubble Astrophotography',
      bg1: '#09090b', bg2: '#4c0519', accent: '#f43f5e',
      tags: 'space,nebula,astronomy,stars',
      category: catMap['nature'],
      icon: '<circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" fill="#ffffff"/>'
    }
  ];

  imageAssets.forEach(img => {
    const target = path.join(baseUploads, 'images', img.fileName);
    const thumbTarget = path.join(baseUploads, 'thumbnails', `thumb-${img.fileName}`);
    const svgData = createSvgArtwork({
      title: img.title,
      subtitle: img.subtitle,
      bgGrad1: img.bg1,
      bgGrad2: img.bg2,
      accentColor: img.accent,
      iconSvg: img.icon
    });
    fs.writeFileSync(target, svgData);
    fs.writeFileSync(thumbTarget, svgData);
  });

  // Generate generic thumbnails for videos & audio
  const videoThumbSvg = createSvgArtwork({
    title: 'Cinematic Clip',
    subtitle: 'High Definition Motion Video',
    bgGrad1: '#18181b', bgGrad2: '#27272a', accent: '#8b5cf6',
    iconSvg: '<polygon points="5,3 19,12 5,21" fill="#ffffff"/>'
  });
  fs.writeFileSync(path.join(baseUploads, 'thumbnails', 'thumb-video-default.svg'), videoThumbSvg);

  const audioThumbSvg = createSvgArtwork({
    title: 'Studio Master',
    subtitle: 'High Fidelity Audio Track',
    bgGrad1: '#022c22', bgGrad2: '#064e3b', accent: '#10b981',
    iconSvg: '<path d="M9 18V5l12-2v13" stroke="#ffffff" stroke-width="2" fill="none"/><circle cx="6" cy="18" r="3" fill="#ffffff"/><circle cx="18" cy="16" r="3" fill="#ffffff"/>'
  });
  fs.writeFileSync(path.join(baseUploads, 'thumbnails', 'thumb-audio-default.svg'), audioThumbSvg);

  // Documents
  const doc1Path = path.join(baseUploads, 'documents', 'multimedia-architecture-whitepaper.pdf');
  const doc1Content = `MULTIMEDIA HUB: ARCHITECTURE SPECIFICATION
Section 1: Distributed Content Processing and Storage
Modern multimedia engines demand low-latency streaming pipelines.
This whitepaper specifies how node-based buffer streaming handles range headers.
Audio and video content is delivered with byte-range capability.

Section 2: Database Schema & Relational Integrity
The system employs full relational foreign-key cascades across users, media,
favorites, playlists, and watch histories.

Section 3: Zero-Latency Client Architecture
With client-side state synchronizers and responsive HTML5 media controllers,
media playback persists seamlessly across page transitions.`;

  const pdfBuf = createPdfBuffer({
    title: 'Multimedia Hub Architecture Whitepaper',
    author: 'Chief Engineering Architect',
    content: doc1Content
  });
  fs.writeFileSync(doc1Path, pdfBuf);

  const doc2Path = path.join(baseUploads, 'documents', 'modern-web-audio-api.txt');
  const doc2Content = `# Modern Web Audio API & Multimedia Systems Guide

Welcome to the Multimedia Hub developer documentation.

## Core Capabilities
1. Lossless PCM Audio playback via standard HTML5 Audio and Web Audio API.
2. Progressive MP4 and WebM video rendering with seekable buffer pipelines.
3. In-browser responsive PDF viewing with native byte streaming.
4. Relational tracking of watch progress, likes, ratings, and custom playlists.

## Supported Formats
- Video: MP4, WebM, MKV, MOV
- Audio: MP3, WAV, FLAC, OGG, AAC
- Images: SVG, PNG, JPG, WebP
- Documents: PDF, TXT, DOCX, MD

Created by Multimedia Hub Engineering Team.`;
  fs.writeFileSync(doc2Path, doc2Content);

  // 5. Insert Media Records into Database
  const insertMedia = db.prepare(`
    INSERT INTO media (
      title, description, mediaType, filePath, thumbnail,
      categoryId, uploadedBy, duration, size, mimeType, tags, views, likes, rating, ratingCount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Video 1
  insertMedia.run(
    'Blooming Nature Blossom (4K Macro)',
    'Spectacular time-lapse footage revealing the delicate blooming of a flower petal in rich macro detail.',
    'video',
    '/uploads/videos/nature-blooming.mp4',
    '/uploads/thumbnails/thumb-video-default.svg',
    catMap['nature'],
    adminId,
    5.0,
    fs.existsSync(video1Path) ? fs.statSync(video1Path).size : 500000,
    'video/mp4',
    'nature,macro,timelapse,flower,blooming',
    1420,
    38,
    4.8,
    12
  );

  // Video 2
  insertMedia.run(
    'Big Buck Bunny Animation Teaser',
    'Open-source creative commons animation film showcase exploring forest adventures and lovable cartoon characters.',
    'video',
    '/uploads/videos/bunny-teaser.mp4',
    '/uploads/thumbnails/thumb-video-default.svg',
    catMap['movies'],
    userId,
    10.0,
    fs.existsSync(video2Path) ? fs.statSync(video2Path).size : 600000,
    'video/mp4',
    'animation,cartoon,open source,cinema,teaser',
    2150,
    84,
    4.9,
    27
  );

  // Audio Tracks
  audioTracks.forEach(track => {
    const filePath = `/uploads/audio/${track.fileName}`;
    const fullPath = path.join(baseUploads, 'audio', track.fileName);
    const size = fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 100000;

    insertMedia.run(
      track.title,
      track.description,
      'audio',
      filePath,
      '/uploads/thumbnails/thumb-audio-default.svg',
      track.category,
      adminId,
      track.durationSec,
      size,
      'audio/wav',
      track.tags,
      Math.floor(Math.random() * 800) + 150,
      Math.floor(Math.random() * 50) + 10,
      4.7,
      8
    );
  });

  // Images
  imageAssets.forEach(img => {
    const filePath = `/uploads/images/${img.fileName}`;
    const thumbPath = `/uploads/thumbnails/thumb-${img.fileName}`;
    const fullPath = path.join(baseUploads, 'images', img.fileName);
    const size = fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 15000;

    insertMedia.run(
      img.title,
      img.subtitle,
      'image',
      filePath,
      thumbPath,
      img.category,
      userId,
      0,
      size,
      'image/svg+xml',
      img.tags,
      Math.floor(Math.random() * 1200) + 300,
      Math.floor(Math.random() * 90) + 20,
      4.9,
      15
    );
  });

  // Documents
  insertMedia.run(
    'Multimedia Hub Systems Architecture (Whitepaper)',
    'Complete technical whitepaper outlining media distribution, streaming protocols, relational integrity, and UI/UX performance.',
    'document',
    '/uploads/documents/multimedia-architecture-whitepaper.pdf',
    '/uploads/thumbnails/thumb-video-default.svg',
    catMap['documents'],
    adminId,
    0,
    fs.existsSync(doc1Path) ? fs.statSync(doc1Path).size : 25000,
    'application/pdf',
    'whitepaper,architecture,pdf,engineering,spec',
    490,
    24,
    5.0,
    6
  );

  insertMedia.run(
    'Modern Web Audio API & Codec Reference',
    'Comprehensive reference guide covering Web Audio nodes, PCM WAV buffers, spatial panning, and browser audio graphs.',
    'document',
    '/uploads/documents/modern-web-audio-api.txt',
    '/uploads/thumbnails/thumb-audio-default.svg',
    catMap['technology'],
    userId,
    0,
    fs.existsSync(doc2Path) ? fs.statSync(doc2Path).size : 4000,
    'text/plain',
    'audio,codecs,reference,guide,text',
    310,
    18,
    4.6,
    4
  );

  // 6. Create Sample Playlists
  const insertPlaylist = db.prepare(`
    INSERT INTO playlists (userId, title, description, isPublic, thumbnail)
    VALUES (?, ?, ?, 1, ?)
  `);

  const p1Res = insertPlaylist.run(
    adminId,
    'Late Night Lo-Fi & Ambient Study',
    'Curated synthesizer chords and soothing frequencies crafted for programming, reading, and deep creative flow.',
    '/uploads/thumbnails/thumb-audio-default.svg'
  );
  const p1Id = Number(p1Res.lastInsertRowid);

  const p2Res = insertPlaylist.run(
    userId,
    'Visual Odyssey & Digital Showcase',
    'An inspiring compilation of motion design, digital scenery, and futuristic artwork.',
    '/uploads/thumbnails/thumb-cyberpunk-skyline.svg'
  );
  const p2Id = Number(p2Res.lastInsertRowid);

  // Add items to playlists
  const allMedia = db.prepare('SELECT id, mediaType FROM media').all();
  const audioIds = allMedia.filter(m => m.mediaType === 'audio').map(m => m.id);
  const visualIds = allMedia.filter(m => m.mediaType === 'video' || m.mediaType === 'image').map(m => m.id);

  const insertPlaylistItem = db.prepare('INSERT INTO playlist_items (playlistId, mediaId, orderIndex) VALUES (?, ?, ?)');
  audioIds.forEach((mId, idx) => {
    insertPlaylistItem.run(p1Id, mId, idx + 1);
  });

  visualIds.forEach((mId, idx) => {
    insertPlaylistItem.run(p2Id, mId, idx + 1);
  });

  // 7. Watch History & Favorites for Demo Users
  const insertHistory = db.prepare('INSERT INTO watch_history (userId, mediaId, progress, completed) VALUES (?, ?, ?, ?)');
  if (allMedia.length > 0) {
    insertHistory.run(adminId, allMedia[0].id, 3.2, 0);
    insertHistory.run(userId, allMedia[0].id, 5.0, 1);
  }
  if (allMedia.length > 1) {
    insertHistory.run(adminId, allMedia[1].id, 4.5, 0);
  }

  // Favorites
  const insertFav = db.prepare('INSERT OR IGNORE INTO favorites (userId, mediaId) VALUES (?, ?)');
  if (allMedia.length > 0) insertFav.run(adminId, allMedia[0].id);
  if (allMedia.length > 2) insertFav.run(adminId, allMedia[2].id);
  if (allMedia.length > 4) insertFav.run(adminId, allMedia[4].id);
  if (allMedia.length > 1) insertFav.run(userId, allMedia[1].id);
  if (allMedia.length > 3) insertFav.run(userId, allMedia[3].id);

  // Sample Ratings
  const insertRating = db.prepare('INSERT OR IGNORE INTO ratings (userId, mediaId, score, review) VALUES (?, ?, ?, ?)');
  if (allMedia.length > 0) {
    insertRating.run(adminId, allMedia[0].id, 5, 'Superb high-definition footage! Crisp colors and flawless playback.');
    insertRating.run(userId, allMedia[0].id, 4, 'Really peaceful macro visuals. Loved it.');
  }
  if (allMedia.length > 2) {
    insertRating.run(userId, allMedia[2].id, 5, 'Awesome synth harmonics, ideal ambient background music.');
  }

  console.log('✅ Seeding completed successfully!');
  console.log('--- Credentials ---');
  console.log('ADMIN: admin@multimediahub.com / AdminPassword123!');
  console.log('USER:  user@multimediahub.com  / UserPassword123!');
  console.log('Total Categories:', categoriesData.length);
  console.log('Total Media seeded:', allMedia.length);
  console.log('Total Playlists:', 2);
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seedService.js')) {
  runSeed().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
