const mongoose = require('mongoose');

// Define Schema for School Tenant (representing individual schools)
const TenantSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#1e3a8a' // Default Tailwind Blue-800
  },
  secondaryColor: {
    type: String,
    default: '#d97706' // Default Tailwind Amber-600
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'draft'],
    default: 'active'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Maps to frontend snake_case standard
});

module.exports = mongoose.model('Tenant', TenantSchema);
