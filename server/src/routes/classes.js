const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');

// Apply auth and tenant resolution to all routes in this router
router.use(auth);
router.use(tenantResolver);

// Helper check: Only allow School Admin and Teachers to access academic configurations
const isAuthorizedStaff = (req, res, next) => {
  if (req.user.role !== 'school_admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Access restricted to staff members.' });
  }
  next();
};

// 1. GET /api/v1/classes - List all classes for the current tenant school
router.get('/', isAuthorizedStaff, async (req, res, next) => {
  try {
    const classes = await Class.find({ tenantId: req.tenantId }).sort({ name: 1 });
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/v1/classes - Add a new class section configuration
router.post('/', isAuthorizedStaff, async (req, res, next) => {
  try {
    const { name, sections } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Class name is required.' });
    }

    // Verify duplicate class names within the same school tenant
    const existingClass = await Class.findOne({ name: name.trim(), tenantId: req.tenantId });
    if (existingClass) {
      return res.status(400).json({ success: false, error: `Class "${name}" already exists.` });
    }

    const newClass = await Class.create({
      name: name.trim(),
      sections: sections || ['A'],
      tenantId: req.tenantId
    });

    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    next(error);
  }
});

// 3. PUT /api/v1/classes/:id - Update class naming or sections
router.put('/:id', isAuthorizedStaff, async (req, res, next) => {
  try {
    const { name, sections } = req.body;

    const updatedClass = await Class.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { name, sections },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    res.status(200).json({ success: true, data: updatedClass });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE /api/v1/classes/:id - Remove class category
router.delete('/:id', isAuthorizedStaff, async (req, res, next) => {
  try {
    const deletedClass = await Class.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!deletedClass) {
      return res.status(404).json({ success: false, error: 'Class not found.' });
    }

    res.status(200).json({ success: true, message: 'Class deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
