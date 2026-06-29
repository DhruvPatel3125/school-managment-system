const express = require('express');
const router = express.Router();
const Staff = require('../models/staff');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');

// Apply auth and tenant resolution to all routes in this router
router.use(auth);
router.use(tenantResolver);

// 1. GET /api/v1/staff - List staff directory (Accessible by School Admin and Teachers)
router.get('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'school_admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ success: false, error: 'Access Denied: Unauthorized role.' });
    }

    const staff = await Staff.find({ tenantId: req.tenantId }).sort({ name: 1 });
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
});

// Helper check: Restrict modifications to School Admin (Principal) only
const isSchoolAdmin = (req, res, next) => {
  if (req.user.role !== 'school_admin') {
    return res.status(403).json({ success: false, error: 'Access Denied: Only school administrators can onboard/modify staff.' });
  }
  next();
};

// 2. POST /api/v1/staff - Onboard a new staff member
router.post('/', isSchoolAdmin, async (req, res, next) => {
  try {
    const { employeeId, name, email, designation, department, joiningDate } = req.body;

    if (!employeeId || !name || !email || !designation || !department) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    // Verify employeeId is unique within the tenant
    const existingStaff = await Staff.findOne({ employeeId, tenantId: req.tenantId });
    if (existingStaff) {
      return res.status(400).json({ success: false, error: `Employee ID "${employeeId}" already exists.` });
    }

    const newStaff = await Staff.create({
      employeeId,
      name,
      email,
      designation,
      department,
      joiningDate: joiningDate || undefined,
      tenantId: req.tenantId
    });

    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    next(error);
  }
});

// 3. PUT /api/v1/staff/:id - Edit staff details
router.put('/:id', isSchoolAdmin, async (req, res, next) => {
  try {
    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ success: false, error: 'Staff member not found.' });
    }

    res.status(200).json({ success: true, data: updatedStaff });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE /api/v1/staff/:id - Remove staff record
router.delete('/:id', isSchoolAdmin, async (req, res, next) => {
  try {
    const deletedStaff = await Staff.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!deletedStaff) {
      return res.status(404).json({ success: false, error: 'Staff member not found.' });
    }

    res.status(200).json({ success: true, message: 'Staff record deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
