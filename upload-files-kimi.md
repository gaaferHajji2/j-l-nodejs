 I'll create a Node.js example for uploading multiple image files with validation. This uses the popular **Multer** middleware for handling multipart/form-data.

## Project Structure

```
upload-server/
├── package.json
├── server.js
└── uploads/          (created automatically)
```

## 1. package.json

```json
{
  "name": "image-upload-server",
  "version": "1.0.0",
  "description": "Node.js server for uploading up to 3 image files",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 2. server.js (Complete Implementation)

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: uuid-originalname
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

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
        'image/svg+xml'
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
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 3 // Maximum 3 files
    }
});

// Middleware
app.use(express.static('public')); // Serve static files (HTML form)
app.use('/uploads', express.static(uploadDir)); // Serve uploaded files

// ============================================
// ROUTES
// ============================================

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

// ============================================
// ERROR HANDLING
// ============================================

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
```

## 3. HTML Test Form (public/index.html)

Create folder `public/` and add this file to test uploads:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Upload Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="file"] {
            padding: 10px;
            border: 2px dashed #ccc;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #45a049; }
        #result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            display: none;
        }
        #result.success { background: #d4edda; color: #155724; }
        #result.error { background: #f8d7da; color: #721c24; }
        .preview {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        .preview img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 5px;
            border: 2px solid #ddd;
        }
        .info {
            background: #e7f3ff;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #004085;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖼️ Image Upload Test</h1>
        
        <div class="info">
            <strong>Rules:</strong>
            <ul>
                <li>Maximum 3 files allowed</li>
                <li>Only image files accepted (JPEG, PNG, GIF, WebP, BMP, SVG)</li>
                <li>Max 5MB per file</li>
            </ul>
        </div>

        <form id="uploadForm">
            <div class="form-group">
                <label for="images">Select Images (1-3):</label>
                <input type="file" id="images" name="images" accept="image/*" multiple required>
            </div>
            
            <div class="preview" id="preview"></div>
            
            <button type="submit">Upload Images</button>
        </form>

        <div id="result"></div>
    </div>

    <script>
        const form = document.getElementById('uploadForm');
        const fileInput = document.getElementById('images');
        const preview = document.getElementById('preview');
        const result = document.getElementById('result');

        // Preview selected files
        fileInput.addEventListener('change', (e) => {
            preview.innerHTML = '';
            const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 for preview
            
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        preview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            
            // Remove extra files if more than 3 selected (client-side check)
            const files = formData.getAll('images');
            if (files.length > 3) {
                showResult('Error: Maximum 3 files allowed', false);
                return;
            }

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                
                if (data.success) {
                    showResult(`
                        <strong>Success!</strong> ${data.message}<br>
                        <ul>
                            ${data.files.map(f => `
                                <li>${f.originalName} → ${f.filename} (${(f.size/1024).toFixed(1)} KB)</li>
                            `).join('')}
                        </ul>
                    `, true);
                    form.reset();
                    preview.innerHTML = '';
                } else {
                    showResult(`<strong>Error:</strong> ${data.message}`, false);
                }
            } catch (error) {
                showResult(`<strong>Error:</strong> ${error.message}`, false);
            }
        });

        function showResult(message, isSuccess) {
            result.innerHTML = message;
            result.className = isSuccess ? 'success' : 'error';
            result.style.display = 'block';
        }
    </script>
</body>
</html>
```

## Installation & Running

```bash
# 1. Create project directory
mkdir upload-server && cd upload-server

# 2. Initialize and install dependencies
npm init -y
npm install express multer uuid

# 3. Create the files above (server.js, public/index.html)

# 4. Start server
npm start

# Or with auto-reload (install nodemon first)
npm install --save-dev nodemon
npm run dev
```

## Key Features Explained

| Feature | Implementation |
|---------|---------------|
| **Max 3 files** | `upload.array('images', 3)` + `LIMIT_FILE_COUNT` error handling |
| **Image-only filter** | `imageFilter` function checks MIME types |
| **File size limit** | `limits: { fileSize: 5 * 1024 * 1024 }` (5MB) |
| **Unique filenames** | UUID prefix prevents overwrites |
| **Security** | File type validation on server-side (not just extension) |

## Testing with cURL

```bash
# Upload single image
curl -X POST -F "images=@photo1.jpg" http://localhost:3000/upload

# Upload multiple images (up to 3)
curl -X POST \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png" \
  -F "images=@photo3.gif" \
  http://localhost:3000/upload

# Try uploading non-image (will be rejected)
curl -X POST -F "images=document.pdf" http://localhost:3000/upload

# Try uploading 4 files (will fail with LIMIT_FILE_COUNT)
curl -X POST \
  -F "images=@1.jpg" \
  -F "images=@2.jpg" \
  -F "images=@3.jpg" \
  -F "images=@4.jpg" \
  http://localhost:3000/upload
```

## External Libraries Used

1. **express** (^4.18.2) - Web server framework
2. **multer** (^1.4.5-lts.1) - Middleware for handling `multipart/form-data` (file uploads)
3. **uuid** (^9.0.0) - Generates unique identifiers for filenames

The `multer` library is the industry standard for file uploads in Node.js/Express applications, handling streaming, disk storage, and memory management efficiently.