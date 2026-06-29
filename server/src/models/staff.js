const mongoose = require('mongoose');

// Schema for Staff Members (Teachers, Administrators, Accountants)
const StaffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  designation: {
    type: String,
    required: true // e.g., "Teacher", "Accountant", "Registrar"
  },
  department: {
    type: String,
    required: true // e.g., "Mathematics", "Science", "Administration"
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Staff', StaffSchema);
