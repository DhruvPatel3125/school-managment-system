const express = require('express');
const router = express.Router();
const Staff = require('../models/staff');
const User = require('../models/user');
const Role = require('../models/role');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');
const { generateTempPassword, sendCredentialsEmail } = require('../utils/mailer');

// Apply auth and tenant resolution to all routes in this router
router.use(auth);
router.use(tenantResolver);

// 1. GET /api/v1/staff - List staff directory (Accessible by School Admin, Teachers, and Super Admin)
router.get('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'school_admin' && req.user.role !== 'teacher' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Access Denied: Unauthorized role.' });
    }

    const staff = await Staff.find({ tenantId: req.tenantId }).sort({ name: 1 });
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
});

// Helper check: Restrict modifications to School Admin (Principal) and Super Admin only
const isSchoolAdmin = (req, res, next) => {
  if (req.user.role !== 'school_admin' && req.user.role !== 'super_admin') {
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

    // Check if email is already taken globally
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: `Email "${email}" is already registered in the system.` });
    }

    // Verify employeeId is unique within the tenant
    const existingStaff = await Staff.findOne({ employeeId, tenantId: req.tenantId });
    if (existingStaff) {
      return res.status(400).json({ success: false, error: `Employee ID "${employeeId}" already exists under this school.` });
    }

    const isTeacher = designation.toLowerCase().includes('teacher') || !designation.toLowerCase().includes('admin');
    
    // Verify tenant plan limits for teachers
    if (isTeacher) {
      const PLAN_LIMITS = require('../config/plans');
      const planLimits = PLAN_LIMITS[req.tenant.plan || 'starter'];
      const maxTeachersLimit = planLimits.maxTeachers;
      
      if (maxTeachersLimit !== Infinity) {
        const teacherRole = await Role.findOne({ name: 'teacher' });
        if (teacherRole) {
          const currentTeacherCount = await User.countDocuments({ tenantId: req.tenantId, roleId: teacherRole._id });
          if (currentTeacherCount >= maxTeachersLimit) {
            return res.status(400).json({ 
              success: false, 
              error: `Teacher limit reached. Under your school's plan (${(req.tenant.plan || 'starter').toUpperCase()}), you can onboard a maximum of ${maxTeachersLimit} teachers. Please upgrade your subscription.` 
            });
          }
        }
      }
    }

    const newStaff = await Staff.create({
      employeeId,
      name,
      email: email.toLowerCase(),
      designation,
      department,
      joiningDate: joiningDate || undefined,
      tenantId: req.tenantId
    });

    // Auto-create User credentials based on designation
    const roleName = isTeacher ? 'teacher' : 'school_admin';
    const staffRole = await Role.findOne({ name: roleName });
    if (!staffRole) {
      await Staff.findByIdAndDelete(newStaff._id);
      return res.status(500).json({ success: false, error: `System Role "${roleName}" not found.` });
    }

    const tempPassword = generateTempPassword();

    try {
      await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash: tempPassword, // auto-hashed
        roleId: staffRole._id,
        tenantId: req.tenantId,
        status: 'active'
      });

      // Send credentials email via Nodemailer asynchronously
      sendCredentialsEmail({
        toEmail: email.toLowerCase(),
        userName: name,
        tempPassword,
        roleName: roleName,
        schoolName: req.tenant.schoolName
      }).catch(err => {
        console.error('⚠️ Nodemailer welcome email failed to send to staff:', err.message || err);
      });

    } catch (userErr) {
      await Staff.findByIdAndDelete(newStaff._id);
      throw userErr;
    }

    res.status(201).json({ 
      success: true, 
      data: newStaff,
      credentials: {
        email: email.toLowerCase(),
        password: tempPassword
      }
    });
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

    // Cascade delete corresponding User credentials
    await User.findOneAndDelete({ email: deletedStaff.email.toLowerCase(), tenantId: req.tenantId });

    res.status(200).json({ success: true, message: 'Staff record deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
