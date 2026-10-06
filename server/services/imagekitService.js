import ImageKit from 'imagekit';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let imagekitInstance = null;

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (publicKey && privateKey && urlEndpoint && !publicKey.includes('your_')) {
  try {
    imagekitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint
    });
    console.log('✓ ImageKit service initialized successfully for CDN storage.');
  } catch (err) {
    console.warn('! Failed to initialize ImageKit:', err.message);
  }
} else {
  console.log('ℹ ImageKit credentials not configured. Falling back to local disk storage.');
}

export const isImageKitConfigured = () => Boolean(imagekitInstance);

/**
 * Upload a Multer file to ImageKit
 * @param {Object} file - Multer file object
 * @param {string} folder - Destination folder on ImageKit (e.g. '/multimedia_hub/videos')
 * @returns {Promise<{ url: string, fileId?: string, thumbnailUrl?: string }>}
 */
export async function uploadToImageKit(file, folder = '/multimedia_hub') {
  if (!imagekitInstance || !file) {
    return null;
  }

  try {
    let fileContent;
    if (file.buffer) {
      fileContent = file.buffer;
    } else if (file.path && fs.existsSync(file.path)) {
      fileContent = fs.createReadStream(file.path);
    } else {
      throw new Error('File content not found for ImageKit upload.');
    }

    const cleanName = (file.originalname || 'upload').replace(/[^a-zA-Z0-9.-]/g, '_');

    const result = await imagekitInstance.upload({
      file: fileContent,
      fileName: `${Date.now()}_${cleanName}`,
      folder,
      useUniqueFileName: true
    });

    // Cleanup local temp file if it exists on disk
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupErr) {
        // Non-critical cleanup warning
      }
    }

    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl || result.url
    };
  } catch (error) {
    console.error('ImageKit upload error:', error.message || error);
    throw error;
  }
}

/**
 * Delete a file from ImageKit by fileId
 * @param {string} fileId
 */
export async function deleteFromImageKit(fileId) {
  if (!imagekitInstance || !fileId) return false;
  try {
    await imagekitInstance.deleteFile(fileId);
    return true;
  } catch (error) {
    console.warn('Failed to delete file from ImageKit:', error.message);
    return false;
  }
}

export default {
  isConfigured: isImageKitConfigured,
  upload: uploadToImageKit,
  delete: deleteFromImageKit
};
