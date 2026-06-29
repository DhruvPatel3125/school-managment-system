const express = require('express');
const router = express.Router();
const Tenant = require('../models/tenant');
const User = require('../models/user');
const Role = require('../models/role');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/rbac');

// POST /api/v1/superadmin/tenants - Onboard a new school tenant
// Restricted to Super Admins only (possessing the "manage:tenants" permission)
router.post(
  '/tenants',
  auth,
  checkPermission('manage:tenants'),
  async (req, res, next) => {
    try {
      const {
        schoolName,
        subdomain,
        logoUrl,
        primaryColor,
        secondaryColor,
        adminName,
        adminEmail,
        adminPassword
      } = req.body;

      // Validate required inputs
      if (!schoolName || !subdomain || !adminName || !adminEmail || !adminPassword) {
        return res.status(400).json({
          success: false,
          error: 'Please fill in all required fields (schoolName, subdomain, adminName, adminEmail, adminPassword).'
        });
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
        status: 'active'
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

module.exports = router;
