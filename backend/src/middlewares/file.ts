import multer from 'multer';
import path from 'path';
import { Request, Express } from 'express';
import fs from 'fs';
import { UPLOAD_PATH_TEMP_IMEG } from '../configs';

const rootDir = path.join(__dirname, '..');
const tempDir = path.resolve(rootDir, UPLOAD_PATH_TEMP_IMEG);

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const allowedMimeTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];
const generateFileName = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}${ext}`;
};
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // _req, _file — не используются
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    // _req — не используется
    const uniqueName = generateFileName(file.originalname);
    cb(null, uniqueName);
  },
});
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 МБ
  },
});
