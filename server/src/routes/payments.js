const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/rbac');
const crypto = require('crypto');
const Tenant = require('../models/tenant');
const ActivityLog = require('../models/activityLog');
const PLAN_LIMITS = require('../config/plans');
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 payment requests per windowMs
  message: { success: false, error: 'Too many payment requests, please try again later.' }
});
// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// POST /api/v1/payments/create-razorpay-order
// Create an order for a new school subscription
router.post(
  '/create-razorpay-order',
  auth,
  paymentLimiter,
  checkPermission('manage:tenants'),
  async (req, res, next) => {
    try {
      const { plan } = req.body;
      
      let amountInPaisa = 0;
      let planName = '';

      if (plan === 'starter') {
        amountInPaisa = 1999 * 100; // ₹1999
        planName = 'Starter';
      } else if (plan === 'professional') {
        amountInPaisa = 4499 * 100; // ₹4499
        planName = 'Professional';
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan selected. Only starter and professional plans support automated payments.'
        });
      }

      const options = {
        amount: amountInPaisa,
        currency: 'INR',
        receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: {
          plan: planName,
          generatedBy: req.user.email
        }
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        data: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency
        }
      });
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment order. Please try again.'
      });
    }
  }
);

// POST /api/v1/payments/upgrade-plan-order
// Create an order for a school admin upgrading their plan
router.post(
  '/upgrade-plan-order',
  auth,
  paymentLimiter,
  async (req, res, next) => {
    try {
      if (req.user.role !== 'school_admin' && req.user.role !== 'super_admin') {
         return res.status(403).json({ success: false, error: 'Unauthorized.' });
      }

      const { plan } = req.body;
      const tenantId = req.user.tenantId || req.body.tenantId;

      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'Tenant ID is missing.' });
      }

      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Tenant not found.' });
      }

      if (tenant.plan === plan) {
         return res.status(400).json({ success: false, error: 'You are already on this plan.' });
      }

      let amountInPaisa = 0;
      let planName = '';

      if (plan === 'professional') {
        amountInPaisa = 4499 * 100; // ₹4499
        planName = 'Professional';
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid upgrade plan selected.'
        });
      }

      const options = {
        amount: amountInPaisa,
        currency: 'INR',
        receipt: `upgrade_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: {
          plan: planName,
          generatedBy: req.user.email,
          tenantId: tenantId.toString()
        }
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        data: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency
        }
      });
    } catch (error) {
      console.error('Razorpay upgrade order creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create upgrade order. Please try again.'
      });
    }
  }
);

// POST /api/v1/payments/upgrade-plan-verify
// Verify payment and upgrade the plan
router.post(
  '/upgrade-plan-verify',
  auth,
  async (req, res, next) => {
    try {
      if (req.user.role !== 'school_admin' && req.user.role !== 'super_admin') {
         return res.status(403).json({ success: false, error: 'Unauthorized.' });
      }

      const {
        plan,
        tenantId: reqTenantId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      const tenantId = req.user.tenantId || reqTenantId;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(402).json({
          success: false,
          error: 'Payment details are missing.'
        });
      }

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

      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Tenant not found.' });
      }
      
      const newPlanLimits = PLAN_LIMITS[plan];
      if (!newPlanLimits) {
         return res.status(400).json({ success: false, error: 'Invalid plan configuration.' });
      }

      const oldPlan = tenant.plan;
      tenant.plan = plan;
      if (newPlanLimits.maxStudents !== undefined) {
         tenant.maxStudents = newPlanLimits.maxStudents;
      }
      
      await tenant.save();

      // Write Log
      await ActivityLog.create({
        action: 'TENANT_PLAN_UPGRADED',
        details: `School '${tenant.schoolName}' upgraded plan from ${oldPlan.toUpperCase()} to ${plan.toUpperCase()}.`,
        performedBy: req.user.email
      });

      res.status(200).json({
        success: true,
        message: 'Plan upgraded successfully.',
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
