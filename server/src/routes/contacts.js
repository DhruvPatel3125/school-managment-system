const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/rbac');

// @route   POST /api/contacts
// @desc    Submit a contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const newContact = new Contact({
      firstName,
      lastName,
      email,
      message
    });

    await newContact.save();

    res.status(201).json({ message: 'Thank you for contacting us. We will get back to you soon!' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Server error while submitting contact form.' });
  }
});

// @route   GET /api/contacts
// @desc    Get all contact submissions
// @access  Protected (Super Admin only)
router.get('/', auth, checkPermission('manage:tenants'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Fetch contacts error:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching contacts.' });
  }
});

module.exports = router;
