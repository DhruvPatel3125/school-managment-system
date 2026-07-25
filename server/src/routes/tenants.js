const express = require('express');
const router = express.Router();
const Tenant = require('../models/tenant');
const tenantResolver = require('../middlewares/tenantResolver');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/rbac');

// 1. Create a new school tenant (Super Admin operation / Dev Tool)
router.post('/', auth, checkPermission('manage:tenants'), async (req, res, next) => {
  try {
    const { schoolName, subdomain, logoUrl, primaryColor, secondaryColor } = req.body;

    if (!schoolName || !subdomain) {
      return res.status(400).json({
        success: false,
        error: 'schoolName and subdomain are required fields.'
      });
    }

    const existingTenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase() });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        error: `Subdomain '${subdomain}' is already registered.`
      });
    }

    const tenant = await Tenant.create({
      schoolName,
      subdomain: subdomain.toLowerCase(),
      logoUrl,
      primaryColor,
      secondaryColor
    });

    res.status(201).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(error);
  }
});

// 2. List tenants (Returns active school tenants; Super Admin gets all tenants including inactive)
router.get('/', async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const User = require('../models/user');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_1234567890';

    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).populate('roleId');
        if (user && user.roleId && user.roleId.name === 'super_admin') {
          const allTenants = await Tenant.find().sort({ schoolName: 1 });
          return res.status(200).json({ success: true, data: allTenants });
        }
      } catch (err) {
        // Fallback to active tenants list
      }
    }

    // Public / default response: return list of active school tenants
    const activeTenants = await Tenant.find({ status: 'active' }).sort({ schoolName: 1 });
    res.status(200).json({
      success: true,
      data: activeTenants
    });
  } catch (error) {
    next(error);
  }
});

// 3. Resolve and return active tenant details (Frontend startup check)
// This route executes the tenantResolver middleware to identify who is making the request
router.get('/current', tenantResolver, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.tenant.id,
      schoolName: req.tenant.schoolName,
      subdomain: req.tenant.subdomain,
      logoUrl: req.tenant.logoUrl,
      primaryColor: req.tenant.primaryColor,
      secondaryColor: req.tenant.secondaryColor,
      status: req.tenant.status,
      plan: req.tenant.plan,
      maxStudents: req.tenant.maxStudents
    }
  });
});

module.exports = router;
