// routes/education/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const Assignment = require('../../models/education/Assignment');
const Submission = require('../../models/education/Submission');
const Student = require('../../models/Student');

router.use(protect);

// ---------- Teacher / Admin: create assignment ----------
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- List assignments (teacher/admin: all, student: his course assignments) ----------
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) return res.status(403).json({ message: 'Student not found' });
      query.course = { $in: student.courses };
    } else if (req.user.role === 'teacher') {
      // Optional: filter by courses taught by this teacher (if needed)
    }
    const assignments = await Assignment.find(query)
      .populate('course', 'name')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Student: submit an answer ----------
router.post('/:id/submit', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(403).json({ message: 'Student not found' });

    const existing = await Submission.findOne({ assignment: req.params.id, student: student._id });
    if (existing) return res.status(400).json({ message: 'You have already submitted this assignment' });

    const submission = await Submission.create({
      assignment: req.params.id,
      student: student._id,
      attachmentUrl: req.body.fileUrl || req.body.attachmentUrl,
      content: req.body.comment || req.body.content,
    });
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher: view submissions for an assignment ----------
router.get('/:id/submissions', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'firstName lastName')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher: grade a submission ----------
router.put('/submission/:submissionId/grade', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { score, feedback, gradedBy: req.user._id, status: 'Graded' },
      { new: true }
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
