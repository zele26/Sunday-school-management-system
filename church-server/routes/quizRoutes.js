// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const ExamResult = require('../models/ExamResult');
const Student = require('../models/Student');
const Course = require('../models/Course');          // ← NEW

router.use(protect);

// ---------- Teacher/Admin: create quiz ----------
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher/Admin: add question to quiz ----------
router.post('/:quizId/questions', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, quiz: req.params.quizId });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- List quizzes (teacher sees own, student sees his course quizzes) ----------
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) return res.status(403).json({ message: 'Student not found' });
      query.course = { $in: student.courses };
    }
    const quizzes = await Quiz.find(query)
      .populate('course', 'name')
      .populate('createdBy', 'fullName');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Student: get questions for a quiz (without correctAnswer) ----------
router.get('/:quizId/take', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const student = await Student.findOne({ userId: req.user._id });
    if (!student || !student.courses.includes(quiz.course)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const questions = await Question.find({ quiz: req.params.quizId })
      .select('-correctAnswer')
      .sort({ order: 1 });
    res.json({ quiz, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Student: submit quiz answers ----------
router.post('/:quizId/submit', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(403).json({ message: 'Student not found' });

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const existingResult = await ExamResult.findOne({ quiz: req.params.quizId, student: student._id });
    if (existingResult) return res.status(400).json({ message: 'You have already taken this quiz' });

    const { answers } = req.body;

    const questions = await Question.find({ quiz: req.params.quizId });
    let totalScore = 0;
    const gradedAnswers = [];

    for (const ans of answers) {
      const question = questions.find(q => q._id.toString() === ans.questionId);
      let isCorrect = false;
      let pointsEarned = 0;

      if (question) {
        if (['Multiple Choice', 'True/False', 'Fill in the Blank'].includes(question.type)) {
          if (ans.selectedAnswer && ans.selectedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
            isCorrect = true;
            pointsEarned = question.points;
          }
        } else {
          pointsEarned = 0;
        }
        totalScore += pointsEarned;
      }
      gradedAnswers.push({
        question: ans.questionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect,
        pointsEarned,
      });
    }

    const result = await ExamResult.create({
      quiz: req.params.quizId,
      student: student._id,
      answers: gradedAnswers,
      totalScore,
    });

    res.json({ success: true, totalScore, result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher/Admin: view quiz details (with correct answers) ----------
router.get('/:quizId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate('course', 'name')
      .populate('createdBy', 'fullName');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quiz: req.params.quizId }).sort({ order: 1 });
    res.json({ quiz, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher/Admin: view results for a quiz (enhanced) ----------
router.get('/:quizId/results', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const results = await ExamResult.find({ quiz: req.params.quizId })
      .populate('student', 'firstName lastName studentId')
      .populate('quiz', 'title course')
      .sort({ submittedAt: -1 });

    // Attach course name manually
    const populatedResults = await Promise.all(results.map(async (r) => {
      let courseName = '';
      if (r.quiz && r.quiz.course) {
        const course = await Course.findById(r.quiz.course).select('name');
        courseName = course ? course.name : '';
      }
      return {
        ...r.toObject(),
        courseName,
      };
    }));

    const questions = await Question.find({ quiz: req.params.quizId }).sort({ order: 1 });

    res.json({ results: populatedResults, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher/Admin: update a question ----------
router.put('/:quizId/questions/:questionId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.questionId, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher/Admin: delete a question ----------
router.delete('/:quizId/questions/:questionId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.questionId);
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;