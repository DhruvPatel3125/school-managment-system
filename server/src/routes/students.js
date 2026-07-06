const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const User = require('../models/user');
const Role = require('../models/role');
const Attendance = require('../models/attendance');
const Assignment = require('../models/assignment');
const Fee = require('../models/fee');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');
const { generateTempPassword, sendCredentialsEmail } = require('../utils/mailer');

// Apply auth and tenant resolution to all routes in this router
router.use(auth);
router.use(tenantResolver);

// Helper middleware to resolve the logged-in student context based on their session email
const resolveStudentContext = async (req, res, next) => {
  try {
    const student = await Student.findOne({ 
      email: req.user.email.toLowerCase(), 
      tenantId: req.tenantId 
    }).populate('classId');

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student directory profile not found for your session account.' });
    }
    req.student = student;
    next();
  } catch (error) {
    next(error);
  }
};

// 0. GET /api/v1/students/profile - Get profile details of logged-in student
router.get('/profile', resolveStudentContext, (req, res) => {
  res.status(200).json({ success: true, data: req.student });
});

// 0a. GET /api/v1/students/portal/dashboard - Aggregate portal metrics
router.get('/portal/dashboard', resolveStudentContext, async (req, res, next) => {
  try {
    const student = req.student;

    // Get attendance stats
    const attendance = await Attendance.find({ studentId: student._id, tenantId: req.tenantId });
    const totalClasses = attendance.length;
    const presentClasses = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : "0.0";

    // Get pending assignments count
    const assignments = await Assignment.find({
      classId: student.classId?._id || student.classId,
      section: student.section,
      tenantId: req.tenantId
    });
    let pendingAssignmentsCount = 0;
    assignments.forEach(asg => {
      const sub = asg.submissions.find(s => s.studentId.toString() === student._id.toString());
      if (!sub || sub.status === 'pending') {
        pendingAssignmentsCount++;
      }
    });

    // Get pending fees count
    const pendingFeesCount = await Fee.countDocuments({
      studentId: student._id,
      status: 'pending',
      tenantId: req.tenantId
    });

    res.status(200).json({
      success: true,
      data: {
        student,
        attendanceStats: {
          percentage: attendancePercentage,
          present: attendance.filter(a => a.status === 'present').length,
          absent: attendance.filter(a => a.status === 'absent').length,
          late: attendance.filter(a => a.status === 'late').length
        },
        pendingAssignmentsCount,
        pendingFeesCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// 0b. GET /api/v1/students/portal/attendance - Get attendance logs
router.get('/portal/attendance', resolveStudentContext, async (req, res, next) => {
  try {
    const attendance = await Attendance.find({
      studentId: req.student._id,
      tenantId: req.tenantId
    }).sort({ date: -1 });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
});

// 0c. GET /api/v1/students/portal/assignments - List student assignments & submission status
router.get('/portal/assignments', resolveStudentContext, async (req, res, next) => {
  try {
    const student = req.student;
    const assignments = await Assignment.find({
      classId: student.classId?._id || student.classId,
      section: student.section,
      tenantId: req.tenantId
    }).sort({ dueDate: 1 });

    const formattedAssignments = assignments.map(asg => {
      const sub = asg.submissions.find(s => s.studentId.toString() === student._id.toString());
      return {
        _id: asg._id,
        title: asg.title,
        description: asg.description,
        dueDate: asg.dueDate,
        subject: asg.subject,
        submissionStatus: sub ? sub.status : 'pending',
        submittedAt: sub ? sub.submittedAt : null,
        answerText: sub ? sub.answerText : null,
        grade: sub ? sub.grade : null,
        feedback: sub ? sub.feedback : null
      };
    });

    res.status(200).json({ success: true, data: formattedAssignments });
  } catch (error) {
    next(error);
  }
});

// 0d. POST /api/v1/students/portal/assignments/:id/submit - Submit assignment homework
router.post('/portal/assignments/:id/submit', resolveStudentContext, async (req, res, next) => {
  try {
    const student = req.student;
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      classId: student.classId?._id || student.classId,
      section: student.section,
      tenantId: req.tenantId
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found or not allocated to your class/section.' });
    }

    const { answerText } = req.body;
    if (!answerText) {
      return res.status(400).json({ success: false, error: 'Submission text is required.' });
    }

    let submissionIndex = assignment.submissions.findIndex(s => s.studentId.toString() === student._id.toString());

    if (submissionIndex >= 0) {
      if (assignment.submissions[submissionIndex].status === 'graded') {
        return res.status(400).json({ success: false, error: 'This assignment is already evaluated and graded and cannot be resubmitted.' });
      }
      assignment.submissions[submissionIndex].status = 'submitted';
      assignment.submissions[submissionIndex].submittedAt = new Date();
      assignment.submissions[submissionIndex].answerText = answerText;
    } else {
      assignment.submissions.push({
        studentId: student._id,
        status: 'submitted',
        submittedAt: new Date(),
        answerText
      });
    }

    await assignment.save();

    res.status(200).json({ success: true, message: 'Homework submission recorded successfully.' });
  } catch (error) {
    next(error);
  }
});

// 0e. GET /api/v1/students/portal/fees - Get fee history
router.get('/portal/fees', resolveStudentContext, async (req, res, next) => {
  try {
    const fees = await Fee.find({
      studentId: req.student._id,
      tenantId: req.tenantId
    }).sort({ dueDate: 1 });

    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
});

// 0f. POST /api/v1/students/portal/fees/:id/pay - Perform mock checkout payment
router.post('/portal/fees/:id/pay', resolveStudentContext, async (req, res, next) => {
  try {
    const fee = await Fee.findOne({
      _id: req.params.id,
      studentId: req.student._id,
      tenantId: req.tenantId
    });

    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee billing record not found.' });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({ success: false, error: 'Fee item is already cleared.' });
    }

    const randomTxn = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    fee.status = 'paid';
    fee.paymentDate = new Date();
    fee.transactionId = randomTxn;

    await fee.save();

    res.status(200).json({ 
      success: true, 
      message: 'Payment completed successfully (Demo Mock Checkout).',
      data: fee
    });
  } catch (error) {
    next(error);
  }
});

// Helper check: Only allow School Admin and Teachers to access general student rosters
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
    const { admissionNo, name, email, dob, classId, section, parentName, parentPhone, profileImage } = req.body;

    if (!admissionNo || !name || !email || !classId || !section || !parentName || !parentPhone) {
      return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
    }

    // Check if admission number is already assigned under this school tenant
    const existingStudent = await Student.findOne({ admissionNo, tenantId: req.tenantId });
    if (existingStudent) {
      return res.status(400).json({ success: false, error: `Admission No. "${admissionNo}" is already assigned to a student.` });
    }

    // Check if email is already taken globally
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: `Email "${email}" is already registered in the system.` });
    }

    // Verify tenant plan limits
    const currentCount = await Student.countDocuments({ tenantId: req.tenantId });
    const PLAN_LIMITS = require('../config/plans');
    const planLimits = PLAN_LIMITS[req.tenant.plan || 'starter'];
    const maxStudentsLimit = planLimits.maxStudents;

    if (maxStudentsLimit !== Infinity && currentCount >= maxStudentsLimit) {
      return res.status(400).json({ 
        success: false, 
        error: `Admission limit reached. Under your school's plan (${(req.tenant.plan || 'starter').toUpperCase()}), you can admit a maximum of ${maxStudentsLimit} students. Please contact the platform Admin to upgrade your subscription.` 
      });
    }

    const student = await Student.create({
      admissionNo,
      name,
      email: email.toLowerCase(),
      dob,
      classId,
      section,
      parentName,
      parentPhone,
      profileImage,
      tenantId: req.tenantId
    });

    // Create a corresponding student portal User credentials
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      await Student.findByIdAndDelete(student._id);
      return res.status(500).json({ success: false, error: 'System Role "student" not found. Contact administrator.' });
    }

    const tempPassword = generateTempPassword();

    try {
      await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash: tempPassword, // hooks auto-hash
        roleId: studentRole._id,
        tenantId: req.tenantId,
        status: 'active'
      });

      // Send credentials email via Nodemailer asynchronously
      sendCredentialsEmail({
        toEmail: email.toLowerCase(),
        userName: name,
        tempPassword,
        roleName: 'student',
        schoolName: req.tenant.schoolName
      }).catch(err => {
        console.error('⚠️ Nodemailer welcome email failed to send to student:', err.message || err);
      });

    } catch (userCreationErr) {
      // Rollback
      await Student.findByIdAndDelete(student._id);
      throw userCreationErr;
    }

    res.status(201).json({ 
      success: true, 
      data: student,
      credentials: {
        email: email.toLowerCase(),
        password: tempPassword
      }
    });
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

    // Cascade delete corresponding User credentials
    await User.findOneAndDelete({ email: deletedStudent.email.toLowerCase(), tenantId: req.tenantId });

    res.status(200).json({ success: true, message: 'Student record deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
