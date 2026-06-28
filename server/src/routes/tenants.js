const express = require('express');
const router = express.Router();
const Tenant = require('../models/tenant');
const tenantResolver = require('../middlewares/tenantResolver');

// 1. Create a new school tenant (Super Admin operation / Dev Tool)
router.post('/', async (req, res, next) => {
  try {
    const { schoolName, subdomain, logoUrl, primaryColor, secondaryColor } = req.body;

    if (!schoolName || !subdomain) {
      return res.status(400).json({
        success: false,
        error: 'schoolName and subdomain are required fields.'
      });
    }

    const existingTenant = await Tenant.findOne({ where: { subdomain: subdomain.toLowerCase() } });
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

// 2. List all tenants (Super Admin operation / Dev Tool)
router.get('/', async (req, res, next) => {
  try {
    const tenants = await Tenant.findAll();
    res.status(200).json({
      success: true,
      data: tenants
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
      status: req.tenant.status
    }
  });
});

module.exports = router;
