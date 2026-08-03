// // routes/admin/attendanceRoutes.js
// const express = require('express');
// const router = express.Router();
// const Attendance = require('../../models/Attendance');
// const Student = require('../../models/Student');
// const Course = require('../../models/Course');

// // ---------- Scan QR and record attendance (full data stored) ----------
// router.post('/scan', async (req, res) => {
//   try {
//     const { qrCode, courseId, status: forcedStatus } = req.body;
//     if (!qrCode) return res.status(400).json({ message: 'QR code data required' });

//     const student = await Student.findOne({ qrCode });
//     if (!student) return res.status(404).json({ message: 'Invalid QR code. Student not found.' });

//     // Look up course and teacher if a courseId is provided
//     let courseName = '';
//     let teacher = null;
//     let teacherName = '';
//     if (courseId) {
//       const course = await Course.findById(courseId).populate('teacher', 'fullName');
//       if (course) {
//         courseName = course.name;
//         if (course.teacher) {
//           teacher = course.teacher._id;
//           teacherName = course.teacher.fullName;
//         }
//       }
//     }

//     // Duplicate check for today (quick check – database index is the final guard)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const alreadyMarked = await Attendance.findOne({
//       student: student._id,
//       date: { $gte: today, $lt: tomorrow },
//       ...(courseId ? { course: courseId } : {}),
//     });
//     if (alreadyMarked) {
//       return res.json({
//         success: true,
//         message: 'Attendance already recorded for today.',
//         student: {
//           id: student._id,
//           name: `${student.firstName} ${student.lastName}`,
//         },
//       });
//     }

//     // Determine academic year and semester
//     const now = new Date();
//     const month = now.getMonth(); // 0 = Jan, 11 = Dec
//     const year = now.getFullYear();
//     let academicYear, semester;
//     if (month >= 5 && month <= 11) {   // June - December
//       academicYear = `${year}/${year + 1}`;
//       semester = 'First';
//     } else {                           // January - May
//       academicYear = `${year - 1}/${year}`;
//       semester = 'Second';
//     }

//     // Create the fully populated document – use forcedStatus if provided, else default to Present
//     try {
//       await Attendance.create({
//         student: student._id,
//         studentName: `${student.firstName} ${student.lastName}`,
//         grade: student.grade || '',
//         course: courseId || null,
//         courseName,
//         teacher,
//         teacherName,
//         date: today,
//         checkInTime: new Date(),
//         status: forcedStatus || 'Present',
//         recordedBy: req.user._id,
//         academicYear,
//         semester,
//       });
//     } catch (createErr) {
//       if (createErr.code === 11000) {
//         // Duplicate key error – attendance already recorded (race condition guard)
//         return res.json({
//           success: true,
//           message: 'Attendance already recorded for today.',
//           student: {
//             id: student._id,
//             name: `${student.firstName} ${student.lastName}`,
//           },
//         });
//       }
//       throw createErr; // re-throw if it's not a duplicate error
//     }

//     res.json({
//       success: true,
//       message: 'Attendance recorded.',
//       student: {
//         id: student._id,
//         name: `${student.firstName} ${student.lastName}`,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Manual attendance (admin marks attendance without QR) ----------
// router.post('/manual', async (req, res) => {
//   try {
//     const { studentId, courseId, status: forcedStatus } = req.body;
//     if (!studentId) return res.status(400).json({ message: 'Student ID required' });

//     const student = await Student.findById(studentId);
//     if (!student) return res.status(404).json({ message: 'Student not found' });

//     // Duplicate check for today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const alreadyMarked = await Attendance.findOne({
//       student: student._id,
//       date: { $gte: today, $lt: tomorrow },
//       ...(courseId ? { course: courseId } : {}),
//     });
//     if (alreadyMarked) {
//       return res.json({
//         success: true,
//         message: 'Attendance already recorded for today.',
//         student: {
//           id: student._id,
//           name: `${student.firstName} ${student.lastName}`,
//         },
//       });
//     }

//     // Look up course and teacher if a courseId is provided
//     let courseName = '';
//     let teacher = null;
//     let teacherName = '';
//     if (courseId) {
//       const course = await Course.findById(courseId).populate('teacher', 'fullName');
//       if (course) {
//         courseName = course.name;
//         if (course.teacher) {
//           teacher = course.teacher._id;
//           teacherName = course.teacher.fullName;
//         }
//       }
//     }

//     // Determine academic year and semester (same logic as scan)
//     const now = new Date();
//     const month = now.getMonth();
//     const year = now.getFullYear();
//     let academicYear, semester;
//     if (month >= 5 && month <= 11) {
//       academicYear = `${year}/${year + 1}`;
//       semester = 'First';
//     } else {
//       academicYear = `${year - 1}/${year}`;
//       semester = 'Second';
//     }

//     // Create the attendance record
//     try {
//       await Attendance.create({
//         student: student._id,
//         studentName: `${student.firstName} ${student.lastName}`,
//         grade: student.grade || '',
//         course: courseId || null,
//         courseName,
//         teacher,
//         teacherName,
//         date: today,
//         checkInTime: new Date(),
//         status: forcedStatus || 'Present',
//         recordedBy: req.user._id,
//         academicYear,
//         semester,
//       });
//     } catch (createErr) {
//       if (createErr.code === 11000) {
//         return res.json({
//           success: true,
//           message: 'Attendance already recorded for today.',
//           student: {
//             id: student._id,
//             name: `${student.firstName} ${student.lastName}`,
//           },
//         });
//       }
//       throw createErr;
//     }

//     res.json({
//       success: true,
//       message: 'Attendance recorded.',
//       student: {
//         id: student._id,
//         name: `${student.firstName} ${student.lastName}`,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Enhanced attendance report (admin) ----------
// router.get('/report', async (req, res) => {
//   try {
//     const { startDate, endDate, courseId, grade, status, teacher } = req.query;
//     const query = {};

//     if (startDate && endDate) {
//       query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }
//     if (courseId) {
//       query.course = courseId;
//     }
//     if (grade) {
//       query.grade = grade;
//     }
//     if (status) {
//       query.status = status;
//     }
//     if (teacher) {
//       query.teacher = teacher;
//     }

//     const attendances = await Attendance.find(query)
//       .populate('student', 'firstName lastName grade')
//       .populate('course', 'name')
//       .sort({ date: -1 });

//     res.json(attendances);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;







// routes/admin/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const Attendance = require('../../models/Attendance');
const Student = require('../../models/Student');
const Course = require('../../models/Course');

// All routes require authentication
router.use(protect);

// ---------- Scan QR and record attendance (full data stored) ----------
// Accessible by: Admin, Teacher, or any authenticated user with permission
router.post('/scan', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { qrCode, courseId, status: forcedStatus } = req.body;
    if (!qrCode) {
      return res.status(400).json({ 
        success: false,
        message: 'QR code data required' 
      });
    }

    const student = await Student.findOne({ qrCode });
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid QR code. Student not found.' 
      });
    }

    // Look up course and teacher if a courseId is provided
    let courseName = '';
    let teacher = null;
    let teacherName = '';
    if (courseId) {
      const course = await Course.findById(courseId).populate('teacher', 'fullName');
      if (course) {
        courseName = course.name;
        if (course.teacher) {
          teacher = course.teacher._id;
          teacherName = course.teacher.fullName;
        }
      }
    }

    // Duplicate check for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: { $gte: today, $lt: tomorrow },
      ...(courseId ? { course: courseId } : {}),
    });
    if (alreadyMarked) {
      return res.json({
        success: true,
        message: 'Attendance already recorded for today.',
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
        },
        alreadyRecorded: true,
      });
    }

    // Determine academic year and semester
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    const year = now.getFullYear();
    let academicYear, semester;
    if (month >= 5 && month <= 11) { // June - December
      academicYear = `${year}/${year + 1}`;
      semester = 'First';
    } else { // January - May
      academicYear = `${year - 1}/${year}`;
      semester = 'Second';
    }

    // Create the fully populated document
    try {
      await Attendance.create({
        student: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        grade: student.grade || '',
        course: courseId || null,
        courseName,
        teacher,
        teacherName,
        date: today,
        checkInTime: new Date(),
        status: forcedStatus || 'Present',
        recordedBy: req.user._id,
        academicYear,
        semester,
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        // Duplicate key error – attendance already recorded (race condition guard)
        return res.json({
          success: true,
          message: 'Attendance already recorded for today.',
          student: {
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
          },
          alreadyRecorded: true,
        });
      }
      throw createErr;
    }

    res.json({
      success: true,
      message: 'Attendance recorded successfully.',
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade || '',
      },
    });
  } catch (err) {
    console.error('Attendance scan error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ---------- Manual attendance (admin/teacher marks attendance without QR) ----------
router.post('/manual', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, courseId, status: forcedStatus, date: customDate } = req.body;
    if (!studentId) {
      return res.status(400).json({ 
        success: false,
        message: 'Student ID required' 
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Use custom date or today
    const attendanceDate = customDate ? new Date(customDate) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Duplicate check for the specified date
    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: { $gte: attendanceDate, $lt: nextDay },
      ...(courseId ? { course: courseId } : {}),
    });
    if (alreadyMarked) {
      return res.json({
        success: true,
        message: 'Attendance already recorded for this date.',
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
        },
        alreadyRecorded: true,
      });
    }

    // Look up course and teacher if a courseId is provided
    let courseName = '';
    let teacher = null;
    let teacherName = '';
    if (courseId) {
      const course = await Course.findById(courseId).populate('teacher', 'fullName');
      if (course) {
        courseName = course.name;
        if (course.teacher) {
          teacher = course.teacher._id;
          teacherName = course.teacher.fullName;
        }
      }
    }

    // Determine academic year and semester
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let academicYear, semester;
    if (month >= 5 && month <= 11) {
      academicYear = `${year}/${year + 1}`;
      semester = 'First';
    } else {
      academicYear = `${year - 1}/${year}`;
      semester = 'Second';
    }

    // Create the attendance record
    try {
      await Attendance.create({
        student: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        grade: student.grade || '',
        course: courseId || null,
        courseName,
        teacher,
        teacherName,
        date: attendanceDate,
        checkInTime: customDate ? new Date(customDate) : new Date(),
        status: forcedStatus || 'Present',
        recordedBy: req.user._id,
        academicYear,
        semester,
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        return res.json({
          success: true,
          message: 'Attendance already recorded for this date.',
          student: {
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
          },
          alreadyRecorded: true,
        });
      }
      throw createErr;
    }

    res.json({
      success: true,
      message: 'Attendance recorded successfully.',
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade || '',
      },
    });
  } catch (err) {
    console.error('Manual attendance error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ---------- Enhanced attendance report (admin/teacher) ----------
router.get('/report', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { startDate, endDate, courseId, grade, status, teacher, studentId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (courseId) {
      query.course = courseId;
    }
    if (grade) {
      query.grade = grade;
    }
    if (status) {
      query.status = status;
    }
    if (teacher) {
      query.teacher = teacher;
    }
    if (studentId) {
      query.student = studentId;
    }

    // If teacher is not admin, filter by their courses
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    const attendances = await Attendance.find(query)
      .populate('student', 'firstName lastName grade')
      .populate('course', 'name')
      .populate('teacher', 'fullName')
      .populate('recordedBy', 'fullName')
      .sort({ date: -1, checkInTime: -1 });

    // Summary statistics
    const summary = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'Present').length,
      absent: attendances.filter(a => a.status === 'Absent').length,
      late: attendances.filter(a => a.status === 'Late').length,
      excused: attendances.filter(a => a.status === 'Excused').length,
    };

    res.json({
      success: true,
      summary,
      attendances,
    });
  } catch (err) {
    console.error('Attendance report error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ---------- Get attendance by student ID ----------
router.get('/student/:studentId', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, startDate, endDate } = req.query;

    const query = { student: studentId };
    if (courseId) query.course = courseId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendances = await Attendance.find(query)
      .populate('course', 'name')
      .populate('teacher', 'fullName')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'Present').length,
      absent: attendances.filter(a => a.status === 'Absent').length,
      late: attendances.filter(a => a.status === 'Late').length,
      excused: attendances.filter(a => a.status === 'Excused').length,
      attendanceRate: attendances.length > 0 
        ? ((attendances.filter(a => a.status === 'Present' || a.status === 'Late').length / attendances.length) * 100).toFixed(2)
        : 0,
    };

    res.json({
      success: true,
      stats,
      attendances,
    });
  } catch (err) {
    console.error('Student attendance error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ---------- Get today's attendance summary ----------
router.get('/today', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      date: { $gte: today, $lt: tomorrow }
    };

    // If teacher, filter by their courses
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    const attendances = await Attendance.find(query)
      .populate('student', 'firstName lastName grade')
      .populate('course', 'name');

    // Group by course
    const grouped = {};
    attendances.forEach(att => {
      const courseId = att.course?._id || 'uncategorized';
      if (!grouped[courseId]) {
        grouped[courseId] = {
          courseName: att.course?.name || 'Uncategorized',
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      grouped[courseId].total++;
      grouped[courseId][att.status?.toLowerCase() || 'absent']++;
    });

    res.json({
      success: true,
      total: attendances.length,
      byCourse: Object.values(grouped),
      attendances,
    });
  } catch (err) {
    console.error('Today\'s attendance error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ---------- Update attendance status (admin only) ----------
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status || !['Present', 'Absent', 'Late', 'Excused'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Present, Absent, Late, Excused) is required'
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { 
        status,
        ...(note && { note }),
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('student', 'firstName lastName grade')
     .populate('course', 'name');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      attendance,
    });
  } catch (err) {
    console.error('Update attendance error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ---------- Delete attendance record (admin only) ----------
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (err) {
    console.error('Delete attendance error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// ---------- Bulk attendance (mark multiple students) ----------
router.post('/bulk', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentIds, courseId, status, date } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required'
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    const errors = [];

    for (const studentId of studentIds) {
      try {
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Check for duplicate
        const existing = await Attendance.findOne({
          student: studentId,
          date: attendanceDate,
          ...(courseId ? { course: courseId } : {}),
        });

        if (existing) {
          errors.push({ 
            studentId, 
            studentName: `${student.firstName} ${student.lastName}`,
            error: 'Already recorded' 
          });
          continue;
        }

        // Create attendance
        await Attendance.create({
          student: studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          grade: student.grade || '',
          course: courseId || null,
          date: attendanceDate,
          checkInTime: new Date(),
          status: status || 'Present',
          recordedBy: req.user._id,
        });

        results.push({
          studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          status: 'success',
        });
      } catch (err) {
        errors.push({ studentId, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk attendance processed: ${results.length} successful, ${errors.length} failed`,
      results,
      errors,
    });
  } catch (err) {
    console.error('Bulk attendance error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

module.exports = router;