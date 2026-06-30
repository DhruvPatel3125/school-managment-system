const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const auth = require('../middlewares/auth');

// Configure Multer memory storage to avoid local disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit files to 5MB max
  }
});

// POST /api/v1/upload - Onboard/upload any file to Cloudinary
// Accessible to authenticated users (e.g. Super Admin, School Admin)
router.post('/', auth, upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file was provided for upload.' });
    }

    // Set up Cloudinary write stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'educore_logos',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          return res.status(500).json({ success: false, error: 'Upload process failed. Cloudinary refused file.' });
        }
        
        // Return secure image url to the client
        res.status(200).json({
          success: true,
          url: result.secure_url
        });
      }
    );

    // Stream the file buffer to Cloudinary
    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
