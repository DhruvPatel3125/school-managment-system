const mongoose = require('mongoose');

// Schema for Class (e.g., "Class 10", "Grade 5")
// Sections are stored directly as strings inside an array to keep operations simple and query-free
const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sections: {
    type: [String],
    default: ['A'] // Default to a single section "A"
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Class', ClassSchema);
