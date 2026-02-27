const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/pg-photos directory if it doesn't exist
const uploadDir = 'uploads/pg-photos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) { 
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substring(7) + '-' + file.originalname;
    cb(null, uniqueName); 
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.png','.jpg','.jpeg','.gif','.webp'].includes(ext)) cb(null, true); else cb(null, false);
};

module.exports = multer({ storage, fileFilter });

