// routes/admin/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');                        // <-- added
const User = require('../../models/User');
const Student = require('../../models/Student');
const PasswordResetRequest = require('../../models/PasswordResetRequest');
const { AdminPanelData } = require('../../models/PanelData');

// ---------- Stats ----------
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const pendingCount = await User.countDocuments({ status: 'pending' });
    res.json({ totalUsers, totalStudents, pendingCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- All Users ----------
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Pending Approvals ----------
router.get('/pending-approvals', async (req, res) => {
  try {
    const pending = await User.find({ status: 'pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Approve a User ----------
router.put('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.status = 'approved';
    await user.save();
    res.json({ success: true, message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Reject a User ----------
router.put('/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.status = 'rejected';
    await user.save();
    res.json({ success: true, message: 'User rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Admin Panel Data ----------
router.get('/panel-data', async (req, res) => {
  try {
    let panelData = await AdminPanelData.findOne();
    if (!panelData) panelData = await AdminPanelData.create({});
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.put('/panel-data', async (req, res) => {
  try {
    const payload = req.body || {};
    let panelData = await AdminPanelData.findOne();
    if (!panelData) panelData = new AdminPanelData(payload);
    else Object.assign(panelData, payload);
    await panelData.save();
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ---------- List all teachers (for dropdown & admin list) ----------
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', status: 'approved' })
      .select('fullName email phone subject experience coursesTaught qualification city wereda kebele emergencyPersonName emergencyPhone bio createdAt');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Create a new teacher (admin only) ----------
router.post('/teachers', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      experience,
      subject,
      coursesTaught,
      qualification,
      city,
      wereda,
      kebele,
      emergencyPersonName,
      emergencyPhone,
      bio,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Check if phone exists (if provided)
    if (phone && phone.trim() !== '') {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'A user with this phone number already exists.' });
      }
    }

    // Format coursesTaught if provided as string or array
    let formattedCourses = [];
    if (Array.isArray(coursesTaught)) {
      formattedCourses = coursesTaught.map(c => c.trim()).filter(Boolean);
    } else if (typeof coursesTaught === 'string' && coursesTaught.trim() !== '') {
      formattedCourses = coursesTaught.split(',').map(c => c.trim()).filter(Boolean);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the teacher account
    const newTeacher = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      role: 'teacher',
      status: 'approved',
      mustChangePassword: true,
      experience: experience ? experience.trim() : '',
      subject: subject ? subject.trim() : '',
      coursesTaught: formattedCourses,
      qualification: qualification ? qualification.trim() : '',
      city: city ? city.trim() : '',
      wereda: wereda ? wereda.trim() : '',
      kebele: kebele ? kebele.trim() : '',
      emergencyPersonName: emergencyPersonName ? emergencyPersonName.trim() : '',
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : '',
      bio: bio ? bio.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      user: {
        id: newTeacher._id,
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        phone: newTeacher.phone,
        role: newTeacher.role,
        subject: newTeacher.subject,
        experience: newTeacher.experience,
        coursesTaught: newTeacher.coursesTaught,
        qualification: newTeacher.qualification,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Password Reset Requests (Admin Management) ----------
router.get('/password-resets', async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find()
      .populate('user', 'fullName email phone role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve Password Reset & Set Temporary Password
router.put('/password-resets/:id/approve', async (req, res) => {
  try {
    const resetReq = await PasswordResetRequest.findById(req.params.id);
    if (!resetReq) {
      return res.status(404).json({ success: false, message: 'Password reset request not found' });
    }

    const targetUser = await User.findById(resetReq.user);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Generate or use admin-provided temp password
    const tempPass = req.body.tempPassword ? req.body.tempPassword.trim() : `TempPass${Math.floor(1000 + Math.random() * 9000)}`;

    const salt = await bcrypt.genSalt(10);
    targetUser.password = await bcrypt.hash(tempPass, salt);
    targetUser.mustChangePassword = true;
    await targetUser.save();

    resetReq.status = 'approved';
    resetReq.tempPasswordIssued = tempPass;
    resetReq.adminNote = req.body.adminNote || 'Approved by Admin';
    await resetReq.save();

    res.json({
      success: true,
      message: 'የፓስዎርድ ጥያቄው ጸድቋል! ጊዜያዊ ፓስዎርድ ተዘጋጅቷል።',
      tempPassword: tempPass,
      user: {
        id: targetUser._id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        phone: targetUser.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject Password Reset
router.put('/password-resets/:id/reject', async (req, res) => {
  try {
    const resetReq = await PasswordResetRequest.findById(req.params.id);
    if (!resetReq) {
      return res.status(404).json({ success: false, message: 'Password reset request not found' });
    }

    resetReq.status = 'rejected';
    resetReq.adminNote = req.body.adminNote || 'Rejected by Admin';
    await resetReq.save();

    res.json({
      success: true,
      message: 'የፓስዎርድ ጥያቄው ውድቅ ተደርጓል (Request rejected).',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;