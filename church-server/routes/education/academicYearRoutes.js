const express = require('express');
const router = express.Router();
const AcademicYear = require('../../models/education/AcademicYear');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const SystemSetting = require('../../models/SystemSetting');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/academic-years - Get all academic years with enrollment counts
router.get('/', protect, async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1, createdAt: -1 });

    // Aggregate enrollment counts by academicYearId
    const counts = await AcademicEnrollment.aggregate([
      {
        $group: {
          _id: '$academicYearId',
          totalStudents: { $sum: 1 },
          activeStudents: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      if (c._id) {
        countMap[c._id.toString()] = {
          totalStudents: c.totalStudents,
          activeStudents: c.activeStudents,
        };
      }
    });

    const enrichedYears = years.map((y) => {
      const stats = countMap[y._id.toString()] || { totalStudents: 0, activeStudents: 0 };
      return {
        ...y.toObject(),
        totalStudents: stats.totalStudents,
        activeStudents: stats.activeStudents,
      };
    });

    res.json({ success: true, years: enrichedYears });
  } catch (err) {
    console.error('Error fetching academic years:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/academic-years - Create new academic year
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { name, startDate, endDate, status = 'active', description, setAsActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'የትምህርት ዘመን ስም ያስፈልጋል (Academic year name is required)' });
    }

    const trimmedName = name.trim();
    const existing = await AcademicYear.findOne({ name: trimmedName });
    if (existing) {
      return res.status(400).json({ success: false, message: 'ይህ የትምህርት ዘመን አስቀድሞ ተመዝግቧል (An academic year with this name already exists)' });
    }

    const finalStatus = setAsActive ? 'active' : status;

    // If marked active, set other active years to inactive
    if (finalStatus === 'active') {
      await AcademicYear.updateMany({ status: 'active' }, { status: 'inactive' });
    }

    const newYear = await AcademicYear.create({
      name: trimmedName,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: finalStatus,
      description: description ? description.trim() : undefined,
    });

    // If active, sync with SystemSetting registration
    if (finalStatus === 'active') {
      await SystemSetting.findOneAndUpdate(
        { key: 'registration' },
        { academicYear: newYear.name },
        { upsert: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'የትምህርት ዘመን በተሳካ ሁኔታ ተፈጥሯል (Academic year created successfully)',
      academicYear: newYear,
    });
  } catch (err) {
    console.error('Error creating academic year:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/education/academic-years/:id - Update academic year
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { name, startDate, endDate, status, description } = req.body;
    const year = await AcademicYear.findById(req.params.id);

    if (!year) {
      return res.status(404).json({ success: false, message: 'የትምህርት ዘመን አልተገኘም (Academic year not found)' });
    }

    if (name && name.trim() !== year.name) {
      const existing = await AcademicYear.findOne({ name: name.trim(), _id: { $ne: year._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'ይህ የትምህርት ዘመን ስም አስቀድሞ አለ (Name already taken)' });
      }
      year.name = name.trim();
    }

    if (startDate !== undefined) year.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) year.endDate = endDate ? new Date(endDate) : null;
    if (description !== undefined) year.description = description ? description.trim() : '';

    if (status) {
      const prevStatus = year.status;
      year.status = status;

      if (status === 'active' && prevStatus !== 'active') {
        // Demote other active years to inactive
        await AcademicYear.updateMany({ _id: { $ne: year._id }, status: 'active' }, { status: 'inactive' });
        // Sync with SystemSetting
        await SystemSetting.findOneAndUpdate(
          { key: 'registration' },
          { academicYear: year.name },
          { upsert: true }
        );
      }
    }

    await year.save();

    res.json({
      success: true,
      message: 'የትምህርት ዘመን በተሳካ ሁኔታ ተሻሽሏል (Academic year updated successfully)',
      academicYear: year,
    });
  } catch (err) {
    console.error('Error updating academic year:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/education/academic-years/:id/set-active - Set as active academic year
router.patch('/:id/set-active', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const year = await AcademicYear.findById(req.params.id);
    if (!year) {
      return res.status(404).json({ success: false, message: 'የትምህርት ዘመን አልተገኘም (Academic year not found)' });
    }

    // Set other active years to inactive
    await AcademicYear.updateMany({ _id: { $ne: year._id }, status: 'active' }, { status: 'inactive' });

    year.status = 'active';
    await year.save();

    // Sync SystemSetting registration academicYear
    await SystemSetting.findOneAndUpdate(
      { key: 'registration' },
      { academicYear: year.name },
      { upsert: true }
    );

    res.json({
      success: true,
      message: `${year.name} ንቁ የትምህርት ዘመን ሆኖ ተመርጧል (Academic year set as active)`,
      academicYear: year,
    });
  } catch (err) {
    console.error('Error activating academic year:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/education/academic-years/:id - Delete academic year
router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const year = await AcademicYear.findById(req.params.id);
    if (!year) {
      return res.status(404).json({ success: false, message: 'የትምህርት ዘመን አልተገኘም (Academic year not found)' });
    }

    // Safety check: is it currently attached to enrollments?
    const enrollmentCount = await AcademicEnrollment.countDocuments({ academicYearId: year._id });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `ይህ የትምህርት ዘመን ከ${enrollmentCount} ተማሪዎች ምዝገባ ጋር የተያያዘ ስለሆነ ሊሰረዝ አይችልም። ይልቁንስ ማህደር (Archive) ያድርጉት። (Cannot delete academic year with existing enrollments. Archive it instead.)`,
      });
    }

    await AcademicYear.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'የትምህርት ዘመን ተሰርዟል (Academic year deleted successfully)',
    });
  } catch (err) {
    console.error('Error deleting academic year:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;