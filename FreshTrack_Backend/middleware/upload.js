const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    let uploadPath = uploadsDir;

    if (req.params.folder) {
      uploadPath = path.join(uploadsDir, req.params.folder);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 5 
  }
});

const formatFileForDB = (file) => {
  if (!file) return null;

  return {
    url: `/uploads/${file.filename}`, 
    publicId: file.filename           
  };
};

const deleteFile = (publicId) => {
  if (!publicId) return;

  const filePath = path.join(uploadsDir, publicId);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted file: ${publicId}`);
  }
};

module.exports = {

  single: (fieldName) => upload.single(fieldName),

  array: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),

  fields: (fieldsConfig) => upload.fields(fieldsConfig),

  none: () => upload.none(),

  formatFileForDB,
  deleteFile,

  multer: upload
};
