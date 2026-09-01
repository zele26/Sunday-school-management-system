// routes/admin/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');                        // <-- added
const User = require('../../models/User');
const Department = require('../../models/Department');
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

// ---------- All Users (with pagination, search, department population) ----------
router.get('/users', async (req, res) => {
  try {
    const { search, role, status, departmentId, page, limit } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 1000;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('departmentId', 'name code')
      .populate('assignedDepartments', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Global Stats
    const [totalCount, superadminCount, deptAdminCount, adminCount, teacherCount, studentCount, memberCount, pendingCount, approvedCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'superadmin' }),
      User.countDocuments({ role: 'department_admin' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: { $in: ['approved', 'active'] } }),
    ]);

    res.json({
      success: true,
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        total: totalCount,
        superadmin: superadminCount,
        department_admin: deptAdminCount,
        admin: adminCount,
        teacher: teacherCount,
        student: studentCount,
        member: memberCount,
        pending: pendingCount,
        approved: approvedCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Update User (Role, Department, Details with History Preservation) ----------
router.put('/users/:id', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      role,
      status,
      departmentId,
      assignedDepartments,
      gender,
      city,
      wereda,
      kebele,
      notes,
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (fullName) user.fullName = fullName.trim();
    if (email !== undefined) user.email = email ? email.toLowerCase().trim() : undefined;
    if (phone !== undefined) user.phone = phone ? phone.trim() : undefined;
    if (status) user.status = status;
    if (gender !== undefined) user.gender = gender;
    if (city !== undefined) user.city = city;
    if (wereda !== undefined) user.wereda = wereda;
    if (kebele !== undefined) user.kebele = kebele;

    // Handle department assignment
    if (departmentId !== undefined) {
      user.departmentId = departmentId || null;
    }
    if (assignedDepartments !== undefined && Array.isArray(assignedDepartments)) {
      user.assignedDepartments = assignedDepartments;
    }

    // Role Change & Lifetime History Preservation
    const previousRole = user.role || 'student';
    const isRoleChanged = role && role !== previousRole;

    if (!user.roles || user.roles.length === 0) {
      user.roles = [previousRole];
    }

    if (isRoleChanged) {
      // If roleHistory is empty, backfill the previous role entry
      if (!user.roleHistory || user.roleHistory.length === 0) {
        user.roleHistory = [
          {
            role: previousRole,
            status: 'Promoted',
            startDate: user.createdAt || new Date(),
            endDate: new Date(),
            notes: `Initial role: ${previousRole}`,
          },
        ];
      } else {
        // Close last active role entry
        const lastEntry = user.roleHistory[user.roleHistory.length - 1];
        if (lastEntry && !lastEntry.endDate) {
          lastEntry.endDate = new Date();
          lastEntry.status = 'Promoted';
        }
      }

      // Add new role to role history
      user.roleHistory.push({
        role: role,
        status: 'Active',
        departmentId: departmentId || user.departmentId || null,
        startDate: new Date(),
        notes: notes || `Role changed from ${previousRole} to ${role}`,
        changedBy: req.user?._id || null,
      });

      // Maintain multi-role array
      if (!user.roles.includes(role)) {
        user.roles.push(role);
      }
      user.role = role;

      // Auto-provision Teacher record if promoted to teacher, while preserving Student records
      if (role === 'teacher') {
        try {
          const Teacher = require('../../models/Teacher');
          let teacherDoc = await Teacher.findOne({ userId: user._id });
          if (!teacherDoc) {
            const count = await Teacher.countDocuments();
            const year = new Date().getFullYear();
            await Teacher.create({
              userId: user._id,
              teacherId: `TCH-${year}-${String(count + 1).padStart(4, '0')}`,
              phone: user.phone || '',
              email: user.email || '',
              status: 'active',
              registrationDate: new Date(),
            });
          }
        } catch (tErr) {
          console.warn('Auto teacher provisioning notice:', tErr.message);
        }
      }
    }

    await user.save();
    await user.populate('departmentId', 'name code');
    await user.populate('assignedDepartments', 'name code');

    res.json({
      success: true,
      message: 'User updated and role history preserved successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roles: user.roles,
        roleHistory: user.roleHistory,
        status: user.status,
        departmentId: user.departmentId,
        assignedDepartments: user.assignedDepartments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Member Journey & Lifetime Progression Profile ----------
router.get('/users/:id/journey', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('departmentId', 'name code')
      .populate('assignedDepartments', 'name code')
      .populate('roleHistory.departmentId', 'name code')
      .populate('roleHistory.changedBy', 'fullName email');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Historical Student profile & records (never lost upon promotion)
    const student = await Student.findOne({ userId: user._id })
      .populate('courses', 'name code grade')
      .populate('teacher', 'fullName email');

    // Historical Teacher profile & records
    let teacher = null;
    try {
      const Teacher = require('../../models/Teacher');
      teacher = await Teacher.findOne({ userId: user._id });
    } catch (e) {}

    // Historical Department Memberships
    let memberships = [];
    try {
      const DepartmentMembership = require('../../models/DepartmentMembership');
      memberships = await DepartmentMembership.find({ userId: user._id })
        .populate('departmentId', 'name code')
        .sort({ createdAt: -1 });
    } catch (e) {}

    res.json({
      success: true,
      user,
      student,
      teacher,
      memberships,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Delete User ----------
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Pending Approvals ----------
router.get('/pending-approvals', async (req, res) => {
  try {
    const pending = await User.find({ status: 'pending' })
      .select('-password')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });
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
    if (req.body.role) user.role = req.body.role;
    if (req.body.departmentId) user.departmentId = req.body.departmentId;
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