const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { StudentProfileData } = require('../models/PanelData');

// Register New Student Form
router.post('/register', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully!" });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// Fetch All Students
router.get('/all', async (req, res) => {
  try {
    const students = await Student.find().sort({ registrationDate: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

// Student Profile Data Portal
router.get('/profile-data', async (req, res) => {
  try {
    let profileData = await StudentProfileData.findOne();
    if (!profileData) profileData = await StudentProfileData.create({});
    res.json({ data: profileData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;