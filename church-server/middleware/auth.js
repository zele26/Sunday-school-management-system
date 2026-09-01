// middleware/auth.js
const jwt = require('jsonwebtoken');
require('../models/Department');
const User = require('../models/User');

// Protect routes - verify token
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('departmentId', 'name code');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Grant access to specific roles (superadmin has universal access)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not authenticated'
      });
    }

    // Super Admin has unrestricted access across all roles
    if (req.user.role === 'superadmin') {
      return next();
    }

    // If 'admin' is permitted, also allow 'department_admin'
    if (roles.includes('admin') && (req.user.role === 'department_admin' || req.user.role === 'admin')) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not allowed to access this resource`,
      });
    }
    next();
  };
};

// Strict Super Admin only guard
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Access restricted to Super Admin only' });
  }
  next();
};

module.exports = { protect, authorize, requireSuperAdmin };