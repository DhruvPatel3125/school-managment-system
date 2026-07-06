const express = require('express');
const router = express.Router();
const Tenant = require('../models/tenant');
const User = require('../models/user');
const Role = require('../models/role');
const Class = require('../models/class');
const Student = require('../models/student');
const Staff = require('../models/staff');
const ActivityLog = require('../models/activityLog');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/rbac');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

// GET /api/v1/superadmin/metrics - Retrieve platform-wide aggregate counts
router.get(
  '/metrics',
  auth,
  checkPermission('manage:tenants'),
  async (req, res, next) => {
    try {
      const schoolsCount = await Tenant.countDocuments();
      const studentsCount = await Student.countDocuments();
      const staffCount = await Staff.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          schools: schoolsCount,
          students: studentsCount,
          staff: staffCount
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/superadmin/logs - Retrieve last 50 audit activity logs
router.get(
  '/logs',
  auth,
  checkPermission('manage:tenants'),
  async (req, res, next) => {
    try {
      const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/superadmin/tenants/validate - Pre-validate tenant data before payment
router.post(
  '/tenants/validate',
  auth,
  checkPermission('manage:tenants'),
  [
    body('schoolName').notEmpty().withMessage('School name is required'),
    body('subdomain').matches(/^[a-z0-9-]+$/).withMessage('Subdomain must be lowercase alphanumeric and hyphens only'),
    body('adminName').notEmpty().withMessage('Admin name is required'),
    body('adminEmail').isEmail().withMessage('Valid admin email is required'),
    body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters long')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { subdomain, adminEmail } = req.body;

      // Check if subdomain is already registered
      const existingTenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase() });
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          error: `Subdomain '${subdomain}' is already taken by another school.`
        });
      }

      // Check if administrator email is already registered globally
      const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: `Email '${adminEmail}' is already registered in the system.`
        });
      }

      res.status(200).json({ success: true, message: 'Validation successful' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/superadmin/tenants - Onboard a new school tenant
router.post(
  '/tenants',
  auth,
  checkPermission('manage:tenants'),
  [
    body('schoolName').notEmpty().withMessage('School name is required'),
    body('subdomain').matches(/^[a-z0-9-]+$/).withMessage('Subdomain must be lowercase alphanumeric and hyphens only'),
    body('adminName').notEmpty().withMessage('Admin name is required'),
    body('adminEmail').isEmail().withMessage('Valid admin email is required'),
    body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters long')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const {
        schoolName,
        subdomain,
        logoUrl,
        primaryColor,
        secondaryColor,
        adminName,
        adminEmail,
        adminPassword,
        plan,
        maxStudents,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      // Verify Payment if a paid plan is selected
      if (plan === 'starter' || plan === 'professional') {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return res.status(402).json({
            success: false,
            error: 'Payment details are missing. Please complete the payment to subscribe to this plan.'
          });
        }

        const crypto = require('crypto');
        const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
        const generated_signature = crypto
          .createHmac('sha256', secret)
          .update(razorpay_order_id + '|' + razorpay_payment_id)
          .digest('hex');

        if (generated_signature !== razorpay_signature) {
          return res.status(400).json({
            success: false,
            error: 'Payment verification failed. Invalid digital signature.'
          });
        }
      }

      // Check if subdomain is already registered
      const existingTenant = await Tenant.findOne({ subdomain: subdomain.toLowerCase() });
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          error: `Subdomain '${subdomain}' is already taken by another school.`
        });
      }

      // Check if administrator email is already registered globally
      const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: `Email '${adminEmail}' is already registered in the system.`
        });
      }

      // Find the 'school_admin' role from the database
      const schoolAdminRole = await Role.findOne({ name: 'school_admin' });
      if (!schoolAdminRole) {
        return res.status(500).json({
          success: false,
          error: 'System Role "school_admin" was not found in the database. Please seed the roles first.'
        });
      }

      // 1. Create the School Tenant
      const tenant = await Tenant.create({
        schoolName,
        subdomain: subdomain.toLowerCase(),
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop',
        primaryColor: primaryColor || '#1e3a8a',
        secondaryColor: secondaryColor || '#d97706',
        status: 'active',
        plan: plan || 'starter',
        maxStudents: maxStudents !== undefined ? maxStudents : 10
      });

      // 2. Create the Default School Administrator
      let adminUser;
      try {
        adminUser = await User.create({
          name: adminName,
          email: adminEmail.toLowerCase(),
          passwordHash: adminPassword, // Password hashing hook runs in model pre-save
          roleId: schoolAdminRole.id,
          tenantId: tenant.id,
          status: 'active'
        });
      } catch (userCreationError) {
        // Rollback: If user creation fails, delete the newly created tenant to prevent database orphans
        await Tenant.findByIdAndDelete(tenant.id);
        throw userCreationError; // Pass to Express global error handler
      }

      // Write Log
      await ActivityLog.create({
        action: 'TENANT_ONBOARDED',
        details: `Onboarded school '${schoolName}' on subdomain '${subdomain}' (Plan: ${tenant.plan.toUpperCase()}, Limit: ${tenant.maxStudents} students).`,
        performedBy: req.user.email
      });

      res.status(201).json({
        success: true,
        message: `School '${schoolName}' onboarded successfully.`,
        data: {
          tenant: {
            id: tenant.id,
            schoolName: tenant.schoolName,
            subdomain: tenant.subdomain
          },
          admin: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/superadmin/tenants/:id - Update an existing school tenant settings
router.put(
  '/tenants/:id',
  auth,
  checkPermission('manage:tenants'),
  async (req, res, next) => {
    try {
      const { schoolName, logoUrl, primaryColor, secondaryColor, status, plan, maxStudents } = req.body;

      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'School tenant not found.'
        });
      }

      if (schoolName) tenant.schoolName = schoolName;
      if (logoUrl !== undefined) tenant.logoUrl = logoUrl;
      if (primaryColor) tenant.primaryColor = primaryColor;
      if (secondaryColor) tenant.secondaryColor = secondaryColor;
      if (status) tenant.status = status;
      if (plan) tenant.plan = plan;
      if (maxStudents !== undefined) tenant.maxStudents = maxStudents;

      await tenant.save();

      // Write Log
      await ActivityLog.create({
        action: 'TENANT_UPDATED',
        details: `Updated configurations for school '${tenant.schoolName}' (Status: ${tenant.status.toUpperCase()}, Plan: ${tenant.plan.toUpperCase()}, Limit: ${tenant.maxStudents} students).`,
        performedBy: req.user.email
      });

      res.status(200).json({
        success: true,
        message: 'School tenant configurations updated successfully.',
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/superadmin/tenants/:id - Permanently delete a school tenant and cascade clean up
router.delete(
  '/tenants/:id',
  auth,
  checkPermission('manage:tenants'),
  async (req, res, next) => {
    try {
      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'School tenant not found.'
        });
      }

      // Cascade Delete everything belonging to this school ID
      await User.deleteMany({ tenantId: tenant._id });
      await Class.deleteMany({ tenantId: tenant._id });
      await Student.deleteMany({ tenantId: tenant._id });
      await Staff.deleteMany({ tenantId: tenant._id });

      // Finally delete tenant record
      await Tenant.findByIdAndDelete(tenant._id);

      // Write Log
      await ActivityLog.create({
        action: 'TENANT_DELETED',
        details: `Permanently deleted school '${tenant.schoolName}' and cleaned up all associated users, classes, student, and staff records.`,
        performedBy: req.user.email
      });

      res.status(200).json({
        success: true,
        message: `Permanently removed school '${tenant.schoolName}' and cleaned up all users, students, and staff directory records.`
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
