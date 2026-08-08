// church-server/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Registration = require('../models/Registration');

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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

// ---------- Receipt Upload (for distance payments – PUBLIC) ----------
router.post('/receipt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { registrationNumber } = req.body;
    if (!registrationNumber) {
      return res.status(400).json({ message: 'Registration number is required' });
    }

    // Find the registration
    const registration = await Registration.findOne({ registrationNumber });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Only allow receipt upload if the status is "Pending Payment"
    if (registration.status !== 'Pending Payment') {
      return res.status(400).json({ message: 'Receipt already uploaded or registration is in an invalid state' });
    }

    // Upload file to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'receipts',
      resource_type: 'auto',
    });

    // Update the registration record
    registration.receiptUrl = result.secure_url;
    registration.status = 'Pending Verification';
    await registration.save();

    res.json({
      url: result.secure_url,
      message: 'Receipt uploaded successfully. Your registration is now pending verification.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;