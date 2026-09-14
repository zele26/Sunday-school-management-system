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

// Check if user has a permission string (supports wildcards e.g. attendance:*)
const hasPermission = (user, requiredPermission) => {
  if (!user) return false;
  if (user.role === 'superadmin' || user.role === 'admin') return true;

  const userPerms = Array.isArray(user.permissions) ? user.permissions : [];
  if (userPerms.includes('*') || userPerms.includes('all')) return true;
  if (userPerms.includes(requiredPermission)) return true;

  const [category] = requiredPermission.split(':');
  if (category && (userPerms.includes(`${category}:*`) || userPerms.includes(`${category}:all`))) {
    return true;
  }

  return false;
};

// Middleware to enforce specific permissions
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not authenticated',
      });
    }

    if (req.user.role === 'superadmin' || req.user.role === 'admin') {
      return next();
    }

    const hasAccess = requiredPermissions.some((p) => hasPermission(req.user, p));
    if (hasAccess) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You lack the required permission: ${requiredPermissions.join(' or ')}`,
      requiredPermissions,
    });
  };
};

// Grant access to specific roles (superadmin has universal access)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not authenticated',
      });
    }

    // Super Admin has unrestricted access across all roles
    if (req.user.role === 'superadmin') {
      return next();
    }

    // If 'admin' is permitted, also allow 'department_admin' and 'staff' (if permitted by permission)
    if (roles.includes('admin') && (req.user.role === 'department_admin' || req.user.role === 'admin' || req.user.role === 'staff')) {
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

module.exports = { protect, authorize, requireSuperAdmin, requirePermission, hasPermission };