const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const Permission = require('../models/permission');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_1234567890';

/**
 * Authentication Middleware
 * Verifies the JWT Access Token and checks for tenant alignment/isolation.
 */
const auth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Extract token from Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed. Token is missing.'
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed. Token is invalid or expired.'
      });
    }

    // 3. Find user in database with Role and Permissions loaded
    const user = await User.findById(decoded.id).populate({
      path: 'roleId',
      populate: {
        path: 'permissions'
      }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'User not found or is currently suspended.'
      });
    }

    // 4. Validate Tenant Isolation
    // - Super Admins (role name: super_admin) bypass tenant checks (they have global access)
    // - Other users must belong to the tenant they are accessing.
    const isSuperAdmin = user.roleId && user.roleId.name === 'super_admin';

    if (!isSuperAdmin) {
      // If a school tenant context is resolved by tenantResolver middleware
      if (req.tenantId && user.tenantId && user.tenantId.toString() !== req.tenantId.toString()) {
        console.warn(`🚨 SECURITY ALERT: Cross-Tenant Access Attempt! User ${user.email} (Tenant ${user.tenantId}) tried to access Tenant ${req.tenantId}`);
        return res.status(403).json({
          success: false,
          error: 'Access Denied: You do not have permission to view data for this school.'
        });
      }
    }

    // 5. Flatten permissions array for convenient route checks
    const permissions = user.roleId && user.roleId.permissions 
      ? user.roleId.permissions.map(p => p.name) 
      : [];

    // 6. Attach session info to req
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleId ? user.roleId.name : null,
      permissions,
      tenantId: user.tenantId ? user.tenantId.toString() : null,
      isSuperAdmin
    };

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication helper encountered an internal error.'
    });
  }
};

module.exports = auth;
