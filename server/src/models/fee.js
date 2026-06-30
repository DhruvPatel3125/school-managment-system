const mongoose = require('mongoose');

// Schema for Fee management (specifically Exam Fees)
const FeeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true // e.g. "Term 1 Final Exam Fees", "Registration Fee"
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  transactionId: {
    type: String
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

FeeSchema.index({ tenantId: 1, studentId: 1 });

module.exports = mongoose.model('Fee', FeeSchema);
