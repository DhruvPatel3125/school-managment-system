const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');
const Staff = require('../models/staff');
const Student = require('../models/student');
const Class = require('../models/class');
const Attendance = require('../models/attendance');
const Assignment = require('../models/assignment');

// Apply auth and tenant resolution to all routes
router.use(auth);
router.use(tenantResolver);

// Ensure the caller is a Teacher, School Admin, or Super Admin
const isTeacherOrAdmin = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'school_admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, error: 'Access Denied: Only teachers or school administrators can perform this action.' });
  }
  next();
};
router.use(isTeacherOrAdmin);

// 1. GET /api/v1/teachers/portal/dashboard - Summary statistics
router.get('/portal/dashboard', async (req, res, next) => {
  try {
    const classesCount = await Class.countDocuments({ tenantId: req.tenantId });
    const studentsCount = await Student.countDocuments({ tenantId: req.tenantId });
    
    // Count today's attendance logs
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const attendanceTodayCount = await Attendance.countDocuments({
      tenantId: req.tenantId,
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    // Count ungraded submissions across all assignments
    const assignments = await Assignment.find({ tenantId: req.tenantId });
    let ungradedCount = 0;
    assignments.forEach(asg => {
      asg.submissions.forEach(sub => {
        if (sub.status === 'submitted') {
          ungradedCount++;
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        classesCount,
        studentsCount,
        attendanceTodayCount,
        ungradedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/v1/teachers/portal/classes - List all classes under tenant
router.get('/portal/classes', async (req, res, next) => {
  try {
    const classes = await Class.find({ tenantId: req.tenantId }).sort({ name: 1 });
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
});

// 3. GET /api/v1/teachers/portal/attendance - Get class roster with attendance records for a specific date
router.get('/portal/attendance', async (req, res, next) => {
  try {
    const { classId, section, date } = req.query;
    if (!classId || !section) {
      return res.status(400).json({ success: false, error: 'classId and section are required query parameters.' });
    }

    const queryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active students for this class and section
    const students = await Student.find({
      classId,
      section,
      tenantId: req.tenantId,
      status: 'active'
    }).sort({ name: 1 });

    // Get existing attendance records for the class on this day
    const attendanceRecords = await Attendance.find({
      tenantId: req.tenantId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const attendanceMap = {};
    attendanceRecords.forEach(rec => {
      attendanceMap[rec.studentId.toString()] = rec.status;
    });

    const studentRoster = students.map(stud => ({
      _id: stud._id,
      name: stud.name,
      admissionNo: stud.admissionNo,
      status: attendanceMap[stud._id.toString()] || null // 'present', 'absent', 'late', or null
    }));

    res.status(200).json({ success: true, data: studentRoster });
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/v1/teachers/portal/attendance - Record/update classroom attendance logs
router.post('/portal/attendance', async (req, res, next) => {
  try {
    const { classId, section, date, records } = req.body;
    if (!classId || !section || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'classId, section, and records array are required.' });
    }

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(12, 0, 0, 0); // Normalize to midday to prevent UTC day boundary slips

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const promises = records.map(async (rec) => {
      const { studentId, status } = rec;
      if (!studentId || !status) return;

      const existing = await Attendance.findOne({
        studentId,
        tenantId: req.tenantId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (existing) {
        existing.status = status;
        await existing.save();
      } else {
        await Attendance.create({
          studentId,
          date: queryDate,
          status,
          tenantId: req.tenantId
        });
      }
    });

    await Promise.all(promises);

    res.status(200).json({ success: true, message: 'Attendance records registered successfully.' });
  } catch (error) {
    next(error);
  }
});

// 5. GET /api/v1/teachers/portal/assignments - List created homework assignments and submissions
router.get('/portal/assignments', async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ tenantId: req.tenantId })
      .populate('classId')
      .populate('submissions.studentId', 'name admissionNo')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
});

// 6. POST /api/v1/teachers/portal/assignments - Create a new homework assignment
router.post('/portal/assignments', async (req, res, next) => {
  try {
    const { title, description, dueDate, classId, section, subject } = req.body;
    if (!title || !description || !dueDate || !classId || !section || !subject) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields (title, description, dueDate, classId, section, subject).' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      classId,
      section,
      subject,
      submissions: [],
      tenantId: req.tenantId
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
});

// 7. PUT /api/v1/teachers/portal/assignments/:assignmentId/submissions/:studentId/grade - Grade a homework submission
router.put('/portal/assignments/:assignmentId/submissions/:studentId/grade', async (req, res, next) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { grade, feedback } = req.body;

    if (!grade) {
      return res.status(400).json({ success: false, error: 'Grade is required.' });
    }

    const assignment = await Assignment.findOne({ _id: assignmentId, tenantId: req.tenantId });
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    const submission = assignment.submissions.find(sub => sub.studentId.toString() === studentId);
    if (!submission) {
      return res.status(404).json({ success: false, error: 'Student submission not found.' });
    }

    submission.status = 'graded';
    submission.grade = grade;
    if (feedback !== undefined) {
      submission.feedback = feedback;
    }

    await assignment.save();

    // Re-populate and return the updated assignment
    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('classId')
      .populate('submissions.studentId', 'name admissionNo');

    res.status(200).json({ success: true, message: 'Submission graded successfully.', data: updatedAssignment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
