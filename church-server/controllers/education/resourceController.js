// church-server/controllers/education/resourceController.js
const Resource = require('../../models/education/Resource');
const Course = require('../../models/education/Course');
const Student = require('../../models/Student');

// ---------- Teacher: Create Resource ----------
exports.createResource = async (req, res) => {
  try {
    const { title, description, course, resourceType, fileUrl, externalLink } = req.body;

    // Validate required fields
    if (!title || !course || !resourceType) {
      return res.status(400).json({ message: 'Title, course, and resource type are required' });
    }

    // Check if the course exists and belongs to this teacher (or admin)
    let courseExists = true;
    if (req.user.role === 'teacher') {
      const found = await Course.findOne({ _id: course, teacher: req.user._id });
      if (!found) {
        return res.status(403).json({ message: 'You can only add resources to your courses' });
      }
    }

    const resource = await Resource.create({
      title,
      description,
      course,
      resourceType,
      fileUrl: fileUrl || '',
      externalLink: externalLink || '',
      uploadedBy: req.user._id,
      status: req.user.role === 'admin' ? 'Approved' : 'Pending',
      approvedBy: req.user.role === 'admin' ? req.user._id : undefined,
      approvedAt: req.user.role === 'admin' ? new Date() : undefined,
    });

    // Populate for response
    await resource.populate('course', 'name');
    await resource.populate('uploadedBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' ? 'Resource created successfully' : 'Resource submitted for admin approval',
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

// ---------- Teacher / Admin: Update Resource ----------
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status: req.user.role === 'admin' ? req.body.status || resource.status : 'Pending' },
      { new: true }
    ).populate('course', 'name');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Teacher / Admin: Delete Resource ----------
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Admin: Get All Resources ----------
exports.getAllResourcesForAdmin = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .sort({ uploadDate: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Admin: Approve / Reject Resource ----------
exports.approveResource = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const updateData = {
      status,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    };
    if (status === 'Rejected') {
      updateData.rejectionReason = rejectionReason || 'No reason provided';
    }

    const resource = await Resource.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName email')
      .populate('approvedBy', 'fullName email');

    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    res.json({ success: true, message: `Resource ${status.toLowerCase()} successfully`, resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- Student: Get Resources for enrolled courses ----------
exports.getStudentResources = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const resources = await Resource.find({
      course: { $in: student.courses },
      status: 'Approved',
      visibility: 'Published',
    })
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName')
      .sort({ uploadDate: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
