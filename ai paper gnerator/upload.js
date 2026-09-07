// backend/middleware/upload.js
// Replaces the old single "syllabus PDF" upload with up to 7 reference images.
// npm install multer

const multer = require("multer");

const storage = multer.memoryStorage(); // keep in memory, we forward as base64 — no disk clutter

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 7, // hard cap: max 7 images per request
    fileSize: 8 * 1024 * 1024, // 8MB per image
  },
});

module.exports = upload;
