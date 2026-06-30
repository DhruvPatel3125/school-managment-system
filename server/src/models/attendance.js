const mongoose = require('mongoose');

// Schema for Student Attendance Logs
const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for query performance and preventing duplicates on the same day for a student
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ tenantId: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
