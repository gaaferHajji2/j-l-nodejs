const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const mime = require('mime')
const { v4: uuidv4 } = require('uuid')

const app = express()
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure the storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

// File filter - ONLY allow images
const imageFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
  ];

  // Check mime type
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed!`), false);
  }
};

// Configure multer with limits and filter
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 3,
  }
})

/**
 * POST /upload
 * Upload up to 3 images
 * Field name must be 'images'
 */
app.post('/upload', upload.array('images', 3), (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded or files were rejected (non-image types)'
      });
    }

    // Format response with file details
    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} image(s) uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during upload',
      error: error.message
    });
  }
});

/**
 * POST /upload-single
 * Upload single image (alternative endpoint)
 */
app.post('/upload-single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded or file was rejected'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during upload',
      error: error.message
    });
  }
});

app.get('/get-image/:imagename', (req, res) => {
  const imagePath = `${uploadDir}/${req.params['imagename']}`
  console.log(`imagePath: ${imagePath}`)

  if(fs.existsSync(imagePath)) {
    const t1 = new mime.Mime()
    const mimeType = t1.getType(imagePath) || 'image/png'
    res.setHeader('content-type', mimeType)
    return res.sendFile(imagePath)
  } else {
    return res.status(404).json({})
  }
})

// Multer error handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // Multer-specific errors
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum allowed is 3 images.',
        code: error.code
      });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB per file.',
        code: error.code
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }

  // Custom file filter errors
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

// General error handler
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadDir}`);
    console.log(`
Available endpoints:
  POST http://localhost:${PORT}/upload       (up to 3 images, field: 'images')
  POST http://localhost:${PORT}/upload-single (single image, field: 'image')
    `);
});

module.exports = app;