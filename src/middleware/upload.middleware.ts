import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(
  process.cwd(),
  'uploads',
  'menu-items'
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'Only JPEG, PNG, and WebP images are allowed'
        )
      );
    }

    cb(null, true);
  },
});

export default upload;
