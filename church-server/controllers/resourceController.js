// church-server/controllers/resourceController.js
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const Student = require('../models/Student');

// ---------- Teacher: Create Resource ----------
exports.createResource = async (req, res) => {
  try {
    const { title, description, course, resourceType, fileUrl, externalLink } = req.body;

    // Validate required fields
    if (!title || !course || !resourceType) {
      return res.status(400).json({ message: 'Title, course, and resource type are required' });
    }

    // Check if the course belongs to this teacher
    const courseExists = await Course.findOne({ _id: course, teacher: req.user._id });
    if (!courseExists) {
      return res.status(403).json({ message: 'You can only add resources to your courses' });
    }

    const resource = await Resource.create({
      title,
      description,
      course,
      resourceType,
      fileUrl: fileUrl || '',
      externalLink: externalLink || '',
      uploadedBy: req.user._id,
      status: 'Pending', // Default: requires admin approval
    });

    // Populate for response
    await resource.populate('course', 'name');
    await resource.populate('uploadedBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Resource submitted for admin approval',
      resource,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Teacher: Get My Resources ----------
exports.getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user._id })
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .sort({ uploadDate: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Teacher: Update Resource ----------
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find resource and verify ownership
    const resource = await Resource.findOne({ _id: id, uploadedBy: req.user._id });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found or you do not have permission' });
    }

    // If status was 'Rejected' and teacher updates, reset to 'Pending' for re-review
    if (resource.status === 'Rejected') {
      updates.status = 'Pending';
    }

    const updatedResource = await Resource.findByIdAndUpdate(id, updates, { new: true })
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName email')
      .populate('approvedBy', 'fullName email');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      resource: updatedResource,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Teacher: Delete Resource ----------
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findOne({ _id: id, uploadedBy: req.user._id });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found or you do not have permission' });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Admin: Get All Resources (for approval) ----------
exports.getAllResourcesForAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const resources = await Resource.find(query)
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .sort({ uploadDate: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Admin: Approve/Reject Resource ----------
exports.approveResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (action === 'approve') {
      resource.status = 'Approved';
      resource.approvedBy = req.user._id;
      resource.approvedAt = new Date();
    } else if (action === 'reject') {
      resource.status = 'Rejected';
      resource.rejectionReason = rejectionReason || 'No reason provided';
      resource.approvedBy = req.user._id;
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    await resource.save();

    await resource.populate('course', 'name');
    await resource.populate('uploadedBy', 'fullName email');
    await resource.populate('approvedBy', 'fullName email');

    res.json({
      success: true,
      message: `Resource ${action}d successfully`,
      resource,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Student: Get Approved Resources for My Courses ----------
exports.getStudentResources = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(403).json({ message: 'Student record not found' });
    }

    const resources = await Resource.find({
      course: { $in: student.courses },
      status: 'Approved', // Only approved resources
    })
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName')
      .sort({ uploadDate: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};