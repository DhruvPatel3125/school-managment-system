const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');

// Apply auth and tenant resolution to all routes in this router
router.use(auth);
router.use(tenantResolver);

// Helper check: Only allow School Admin and Teachers to access student data
const isAuthorizedStaff = (req, res, next) => {
  if (req.user.role !== 'school_admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, error: 'Unauthorized: Access restricted to staff members.' });
  }
  next();
};

// 1. GET /api/v1/students - List students (with class filter & search search)
router.get('/', isAuthorizedStaff, async (req, res, next) => {
  try {
    const filter = { tenantId: req.tenantId };
    
    // Apply Class Filter if query param is present
    if (req.query.classId) {
      filter.classId = req.query.classId;
    }
    
    // Apply Search Filter (search in name or admission number)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { admissionNo: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .populate('classId')
      .sort({ admissionNo: 1 });

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/v1/students - Admit a new student
router.post('/', isAuthorizedStaff, async (req, res, next) => {
  try {
    const { admissionNo, name, email, dob, classId, section, parentName, parentPhone } = req.body;

    if (!admissionNo || !name || !email || !classId || !section || !parentName || !parentPhone) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    // Check if admission number is already assigned under this school tenant
    const existingStudent = await Student.findOne({ admissionNo, tenantId: req.tenantId });
    if (existingStudent) {
      return res.status(400).json({ success: false, error: `Admission No. "${admissionNo}" is already assigned to a student.` });
    }

    const student = await Student.create({
      admissionNo,
      name,
      email,
      dob,
      classId,
      section,
      parentName,
      parentPhone,
      tenantId: req.tenantId
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
});

// 3. PUT /api/v1/students/:id - Update student records
router.put('/:id', isAuthorizedStaff, async (req, res, next) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    ).populate('classId');

    if (!updatedStudent) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
    next(error);
  }
});

// 4. DELETE /api/v1/students/:id - Graduate / delete student profile
router.delete('/:id', isAuthorizedStaff, async (req, res, next) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });

    if (!deletedStudent) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    res.status(200).json({ success: true, message: 'Student record deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
