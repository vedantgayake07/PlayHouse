import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploadsDir = path.join(__dirname, '..', 'uploads');
const subDirs = ['videos', 'audio', 'images', 'documents', 'thumbnails', 'avatars'];

subDirs.forEach((dir) => {
  const fullPath = path.join(baseUploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const getDestination = (file) => {
  if (file.fieldname === 'thumbnail') {
    return path.join(baseUploadsDir, 'thumbnails');
  }
  if (file.fieldname === 'avatar') {
    return path.join(baseUploadsDir, 'avatars');
  }

  const mime = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  if (mime.startsWith('video/') || ['.mp4', '.webm', '.mkv', '.mov', '.avi'].includes(ext)) {
    return path.join(baseUploadsDir, 'videos');
  }
  if (mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'].includes(ext)) {
    return path.join(baseUploadsDir, 'audio');
  }
  if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
    return path.join(baseUploadsDir, 'images');
  }
  return path.join(baseUploadsDir, 'documents');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = getDestination(file);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = [
    // Video
    '.mp4', '.webm', '.ogg', '.mov', '.mkv',
    // Audio
    '.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    // Documents
    '.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.csv', '.xlsx', '.json'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Supported types: Video, Audio, Images, PDF, Word, TXT.`));
  }
};

const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10);

export const uploadMediaFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxMb * 1024 * 1024 // e.g. 100MB
  }
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

export const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Avatar must be an image (.jpg, .jpeg, .png, .webp).'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('avatar');
