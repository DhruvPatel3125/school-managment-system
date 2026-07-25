const logger = require('../utils/logger');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Tenant = require('../models/tenant');
const auth = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be set in production!');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('FATAL SECURITY ERROR: JWT_REFRESH_SECRET environment variable must be set in production!');
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_1234567890';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_key_1234567890';

// Helper to generate access and refresh tokens
const generateTokens = (user) => {
  // Access Token: carries user payload (id, email, role, and tenant scope)
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.roleId?.name, 
      tenantId: user.tenantId ? user.tenantId.toString() : null 
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );

  // Refresh Token: used only to request a fresh Access Token when it expires
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

// 1. POST /login - Authenticate user credentials and return tokens
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    
    const { email, password } = req.body;

    // Find the user by email and populate their assigned role and permissions
    const user = await User.findOne({ email: email.toLowerCase() }).populate({
      path: 'roleId',
      populate: { path: 'permissions' }
    });

    // Check if user exists and account is active
    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Verify if entered password matches hashed password in DB
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Verify tenant subdomain match (prevents cross-school portal hacking)
    // Super Admins bypass this validation as they possess global access
    const tenantSubdomain = req.headers['x-tenant-subdomain'];
    if (tenantSubdomain && user.roleId?.name !== 'super_admin') {
      const tenant = await Tenant.findOne({ subdomain: tenantSubdomain.toLowerCase(), status: 'active' });
      if (!tenant || !user.tenantId || user.tenantId.toString() !== tenant.id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: This account is not registered under this school.'
        });
      }
    }

    // Generate fresh tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token directly to user document to track active sessions
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HttpOnly, secure cookie (invisible to Javascript for safety)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    });

    // Flatten user permissions to list of string names for easier frontend matching
    const permissions = user.roleId && user.roleId.permissions 
      ? user.roleId.permissions.map(p => p.name) 
      : [];

    // Fetch plan info
    let planInfo = null;
    if (user.tenantId && user.roleId?.name !== 'super_admin') {
      const tenant = await Tenant.findById(user.tenantId);
      if (tenant) {
        const PLAN_LIMITS = require('../config/plans');
        planInfo = {
          plan: tenant.plan || 'starter',
          features: PLAN_LIMITS[tenant.plan || 'starter']?.features || []
        };
      }
    }

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roleId?.name || null,
        permissions,
        tenantId: user.tenantId ? user.tenantId.toString() : null
      },
      planInfo
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /refresh - Rotate access and refresh tokens
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Session expired. Please login again.' });
    }

    // Verify token validity
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Session expired. Please login again.' });
    }

    // Find user and populate roles/permissions
    const user = await User.findById(decoded.id).populate({
      path: 'roleId',
      populate: { path: 'permissions' }
    });

    // Ensure session hasn't been revoked (refreshToken in DB matches the cookie)
    if (!user || user.status !== 'active' || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, error: 'Session is invalid. Please login again.' });
    }

    // Generate new set of tokens (Token Rotation)
    const tokens = generateTokens(user);

    // Save new refresh token to DB
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Set new cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /logout - Terminate session
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshToken = null; // Clear from database to invalidate
          await user.save();
        }
      } catch (err) {
        // Silent catch: continue to clear client-side cookie anyway
      }
    }

    // Clear client-side HTTP cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

// 4. GET /me - Retrieve current authenticated session info
router.get('/me', auth, async (req, res, next) => {
  try {
    let planInfo = null;
    if (req.user.tenantId && req.user.role !== 'super_admin') {
      const tenant = await Tenant.findById(req.user.tenantId);
      if (tenant) {
        const PLAN_LIMITS = require('../config/plans');
        planInfo = {
          plan: tenant.plan || 'starter',
          features: PLAN_LIMITS[tenant.plan || 'starter']?.features || []
        };
      }
    }
    res.status(200).json({
      success: true,
      user: req.user,
      planInfo
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
