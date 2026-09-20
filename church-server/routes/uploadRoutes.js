// church-server/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { protect } = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4', 'video/mpeg', 'audio/mpeg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// ---------- Upload Resource File (still protected) ----------
router.post('/resource', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'church-resources',
      resource_type: 'auto',
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Delete from Cloudinary (still protected) ----------
router.delete('/cloudinary/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Photo / Avatar Upload (PUBLIC or authenticated) ----------
router.post('/photo', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'ምንም ፎቶ አልተመረጠም (No photo uploaded)' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Try Cloudinary upload if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'student-photos',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
          ]
        });
        return res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary upload warning, falling back to data URI:', cloudErr.message);
      }
    }

    // Fallback: return dataURI directly if Cloudinary is not configured/fails
    res.json({
      success: true,
      url: dataURI,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Alias for image upload
router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'church-images',
          resource_type: 'image',
        });
        return res.json({ success: true, url: result.secure_url });
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary fallback for image:', cloudErr.message);
      }
    }

    res.json({ success: true, url: dataURI });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Receipt Upload (PUBLIC – no validation, just upload) ----------
router.post('/receipt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'receipts',
          resource_type: 'auto',
        });
        return res.json({ url: result.secure_url });
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary receipt upload failed, returning data URI:', cloudErr.message);
      }
    }

    res.json({ url: dataURI });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;