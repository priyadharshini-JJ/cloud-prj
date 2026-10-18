import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Validates file type and size
 * Returns { valid: boolean, error?: string }
 */
export function validateAttachment(file) {
  if (!file) return { valid: false, error: 'No file provided' };

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 15 MB.`
    };
  }

  const isTypeAllowed =
    ALLOWED_MIME_TYPES.includes(file.type) ||
    file.type.startsWith('image/') ||
    file.type.startsWith('text/');

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: `File type "${file.type || 'unknown'}" is not supported. Please upload an image, PDF, or text document.`
    };
  }

  return { valid: true };
}

/**
 * Format bytes to readable size string
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Uploads an attachment to Firebase Storage or local demo store
 * @param {string} userId
 * @param {File} file
 * @param {Function} onProgress (percent: number) => void
 * @returns {Promise<{ storagePath: string, downloadUrl: string, fileName: string, mimeType: string, fileSize: number }>}
 */
export async function uploadAttachment(userId, file, onProgress = () => {}) {
  const validation = validateAttachment(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `users/${userId}/attachments/${timestamp}_${cleanFileName}`;

  if (isFirebaseConfigured && storage) {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              storagePath,
              downloadUrl,
              fileName: file.name,
              mimeType: file.type || 'application/octet-stream',
              fileSize: file.size,
              uploadedAt: new Date().toISOString()
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  // Demo / local preview mode with simulated upload progress
  for (let percent = 15; percent <= 100; percent += 25) {
    onProgress(percent);
    await new Promise((r) => setTimeout(r, 60));
  }

  // Create local preview blob URL
  const downloadUrl = URL.createObjectURL(file);
  return {
    storagePath: `demo_local_${storagePath}`,
    downloadUrl,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Deletes attachment from Firebase Storage
 */
export async function deleteAttachment(storagePath) {
  if (!storagePath) return;

  if (isFirebaseConfigured && storage && !storagePath.startsWith('demo_local_')) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn('Could not delete attachment from Storage:', error.message);
    }
  }
}
