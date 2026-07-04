const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/rbac');
const crypto = require('crypto');

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

module.exports = router;
