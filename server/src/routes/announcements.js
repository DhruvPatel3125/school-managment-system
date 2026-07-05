const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcement');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');

router.use(auth);
router.use(tenantResolver);

const isAdmin = (req, res, next) => {
  if (!['admin', 'school_admin', 'super_admin'].includes(req.user?.role)) {
    return res.status(403).json({ success: false, error: 'Unauthorized: Admin access required.' });
  }
  next();
};

// GET /api/v1/announcements
// Get all announcements for the current tenant (Sorted by newest first)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find({ tenantId: req.tenantId })
      .sort({ created_at: -1 })
      .populate('createdBy', 'name role');
      
    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error fetching announcements' });
  }
});

// POST /api/v1/announcements
// Create a new announcement (Admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Please provide a title and description' });
    }

    const announcement = await Announcement.create({
      title,
      description,
      tag: tag || 'NOTICE',
      tenantId: req.tenantId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error creating announcement' });
  }
});

// DELETE /api/v1/announcements/:id
// Delete an announcement (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    });

    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error deleting announcement' });
  }
});

module.exports = router;
