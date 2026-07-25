const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const Staff = require('../models/staff');
const Attendance = require('../models/attendance');
const Fee = require('../models/fee');
const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/rbac');

// GET /api/v1/admin/dashboard - Retrieve admin dashboard metrics
router.get(
  '/dashboard',
  auth,
  checkPermission('manage:school'),
  async (req, res, next) => {
    try {
      const tenantId = req.tenantId || req.user.tenantId;
      
      // 1. Total Students
      const totalStudents = await Student.countDocuments({ tenantId });
      
      // 2. Active Teachers (Staff with role teacher/active)
      const activeTeachers = await Staff.countDocuments({ tenantId, status: 'active' });

      // 3. Daily Attendance (percentage)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const presentCount = await Attendance.countDocuments({
        tenantId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['present', 'late'] }
      });
      
      let attendancePercentage = "0.0";
      if (totalStudents > 0) {
        attendancePercentage = ((presentCount / totalStudents) * 100).toFixed(1);
      }

      // 4. Fees Collected (Current Month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const fees = await Fee.find({
        tenantId,
        status: 'paid',
        paymentDate: { $gte: startOfMonth }
      });
      
      const feesCollected = fees.reduce((sum, fee) => sum + fee.amount, 0);
      
      // Format feesCollected for display (e.g. 14.2L)
      let formattedFees = `₹${feesCollected.toLocaleString('en-IN')}`;
      if (feesCollected >= 100000) {
        formattedFees = `₹${(feesCollected / 100000).toFixed(1)}L`;
      } else if (feesCollected >= 1000) {
        formattedFees = `₹${(feesCollected / 1000).toFixed(1)}K`;
      }

      res.status(200).json({
        success: true,
        data: {
          totalStudents,
          activeTeachers,
          attendancePercentage,
          feesCollected: formattedFees,
          feesCollectedRaw: feesCollected
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
