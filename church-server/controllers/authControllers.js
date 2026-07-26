const Student = require('../models/Student');
exports.login = async (req, res) => {
  try {
    const { email, phone, studentId, password } = req.body;

    if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (phone) {
      user = await User.findOne({ phone }).select('+password');
    } else if (studentId) {
      // Find user through Student collection? We'll store studentId on User or Student.
      // For simplicity, we can look up Student by studentId and then find User.
      const student = await Student.findOne({ studentId });
      if (student) user = await User.findById(student.userId).select('+password');
    } else {
      return res.status(400).json({ success: false, message: 'Email, phone, or student ID required' });
    }

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.status === 'pending') return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    if (user.status === 'rejected') return res.status(403).json({ success: false, message: 'Your account registration request was declined.' });

    const accessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({
      success: true,
      accessToken,
      user: { id: user._id, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};