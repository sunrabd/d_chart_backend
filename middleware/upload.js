const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'image/jpg',
    'text/csv',
    'application/vnd.android.package-archive', // Allow .apk files
    'video/mp4', // Allow .mp4 videos
    'video/mkv', // Allow .mkv videos
    'video/webm', // Allow .webm videos
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, CSV, APK, and video files (MP4, MKV, WEBM) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased limit to 100MB for video files
});

module.exports = upload;