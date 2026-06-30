const mongoose = require('mongoose');

// Schema for Assignments and Homework
const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  submissions: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'graded'],
      default: 'pending'
    },
    submittedAt: {
      type: Date
    },
    answerText: {
      type: String
    },
    grade: {
      type: String
    },
    feedback: {
      type: String
    }
  }],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

AssignmentSchema.index({ tenantId: 1, classId: 1, section: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
