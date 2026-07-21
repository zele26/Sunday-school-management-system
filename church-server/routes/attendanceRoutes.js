const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Scan = require('../models/Scan');

// Attendance QR / ID Scan Endpoint
router.post('/scan', async (req, res) => {
  try {
    const { studentId } = req.body;
    let student = null;
    
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }
    if (!student) {
      student = await Student.findOne({ firstName: studentId });
    }
    if (!student) {
      return res.status(404).json({ message: "ተማሪው አልተገኘም (Student not found)" });
    }

    const newScan = new Scan({
      studentId: student._id,
      fullName: `${student.firstName} ${student.lastName}`
    });

    await newScan.save();
    res.status(201).json({ message: `ሰላም ${student.firstName}! ተመዝግቧል`, time: newScan.time });
  } catch (err) {
    console.error("Scan Error:", err);
    res.status(500).json({ message: "የቴክኒክ ስህተት (Scan failed)" });
  }
});

// Get Today's Scans
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    const list = await Scan.find({ date: today }).sort({ time: -1 });
    res.json(list || []); 
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance" });
  }
});

module.exports = router;