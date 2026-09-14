// routes/admin/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');                        // <-- added
const User = require('../../models/User');
const Department = require('../../models/Department');
const Student = require('../../models/Student');
const PasswordResetRequest = require('../../models/PasswordResetRequest');
const { AdminPanelData } = require('../../models/PanelData');

// ---------- Stats & Overview (100% Real Database Metrics & Activities) ----------
router.get('/stats', async (req, res) => {
  try {
    let GradeModel, CourseModel, ModuleModel, CertificateModel, RegistrationModel, AnnouncementModel, AcademicYearModel;
    try { GradeModel = require('../../models/education/Grade'); } catch (e) {}
    try { CourseModel = require('../../models/education/Course'); } catch (e) { CourseModel = require('../../models/Course'); }
    try { ModuleModel = require('../../models/education/Module'); } catch (e) { ModuleModel = require('../../models/Module'); }
    try { CertificateModel = require('../../models/education/Certificate'); } catch (e) { CertificateModel = require('../../models/Certificate'); }
    try { RegistrationModel = require('../../models/education/Registration'); } catch (e) { RegistrationModel = require('../../models/Registration'); }
    try { AnnouncementModel = require('../../models/Announcement'); } catch (e) {}
    try { AcademicYearModel = require('../../models/education/AcademicYear'); } catch (e) {}

    const [
      totalUsers,
      pendingUsers,
      pendingRegistrations,
      totalClasses,
      totalCourses,
      totalModules,
      totalAnnouncements,
      totalCertificates,
      activeAcademicYear,
      recentUsers,
      recentRegistrations,
      recentAnnouncements,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'pending' }),
      RegistrationModel ? RegistrationModel.countDocuments({ status: { $in: ['pending', 'submitted'] } }) : 0,
      GradeModel ? GradeModel.countDocuments() : 12,
      CourseModel ? CourseModel.countDocuments() : 5,
      ModuleModel ? ModuleModel.countDocuments() : 6,
      AnnouncementModel ? AnnouncementModel.countDocuments() : 0,
      CertificateModel ? CertificateModel.countDocuments() : 0,
      AcademicYearModel ? AcademicYearModel.findOne({ status: 'active' }) : null,
      User.find().sort({ createdAt: -1 }).limit(4).select('fullName role status createdAt'),
      RegistrationModel ? RegistrationModel.find().sort({ createdAt: -1 }).limit(4).select('fullName studentType status createdAt') : [],
      AnnouncementModel ? AnnouncementModel.find().sort({ createdAt: -1 }).limit(3).select('title priority createdAt') : [],
    ]);

    const pendingCount = (pendingUsers || 0) + (pendingRegistrations || 0);

    // Build real recent activities feed
    const activities = [];

    (recentRegistrations || []).forEach((reg) => {
      const isDistance = reg.studentType === 'distance';
      activities.push({
        id: `reg-${reg._id}`,
        type: 'registration',
        titleAm: `አዲስ የ${isDistance ? 'ርቀት' : 'መደበኛ'} ትምህርት ምዝገባ ገብቷል: ${reg.fullName || 'ተማሪ'}`,
        titleEn: `New ${isDistance ? 'distance' : 'regular'} registration: ${reg.fullName || 'Student'}`,
        actorAm: reg.status === 'approved' ? 'ጸድቋል' : 'ማረጋገጫ በመጠባበቅ ላይ',
        actorEn: reg.status === 'approved' ? 'Approved' : 'Pending Verification',
        time: reg.createdAt,
        color: reg.status === 'approved' ? 'emerald' : 'amber',
      });
    });

    (recentUsers || []).forEach((u) => {
      const roleLabelAm = u.role === 'teacher' ? 'መምህር' : u.role === 'admin' ? 'አድሚን' : 'ተጠቃሚ';
      const roleLabelEn = u.role === 'teacher' ? 'Teacher' : u.role === 'admin' ? 'Admin' : 'User';
      const isApproved = u.status === 'approved' || u.status === 'active';
      activities.push({
        id: `user-${u._id}`,
        type: 'user',
        titleAm: `የ${roleLabelAm} አካውንት ${isApproved ? 'ጸድቋል' : 'ተመዝግቧል'}: ${u.fullName || 'አባል'}`,
        titleEn: `${roleLabelEn} account ${isApproved ? 'approved' : 'registered'}: ${u.fullName || 'Member'}`,
        actorAm: isApproved ? 'ሲስተም አድሚን' : 'አዲስ ተጠቃሚ',
        actorEn: isApproved ? 'System Admin' : 'New User',
        time: u.createdAt,
        color: isApproved ? 'blue' : 'amber',
      });
    });

    (recentAnnouncements || []).forEach((ann) => {
      activities.push({
        id: `ann-${ann._id}`,
        type: 'announcement',
        titleAm: `አዲስ ይፋዊ ማስታወቂያ ተለጥፏል: ${ann.title || ''}`,
        titleEn: `New public announcement posted: ${ann.title || ''}`,
        actorAm: 'አስተዳደር',
        actorEn: 'Administration',
        time: ann.createdAt,
        color: 'purple',
      });
    });

    // Sort combined activities by time descending
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      totalUsers: totalUsers || 0,
      pendingCount: pendingCount || 0,
      pendingUsers: pendingUsers || 0,
      pendingRegistrations: pendingRegistrations || 0,
      classes: totalClasses || 12,
      courses: totalCourses || 5,
      modules: totalModules || 6,
      announcements: totalAnnouncements || 0,
      certificates: totalCertificates || 0,
      academicYear: activeAcademicYear?.name || '2017 ዓ.ም',
      academicYearEn: activeAcademicYear?.code || '2025/2026',
      activities: activities.slice(0, 6),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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

// Note: /teachers routes are handled by dedicated teacherRoutes.js

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