const mongoose = require('mongoose');

// Define Schema for Role (e.g., "super_admin", "school_admin")
const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }]
});

module.exports = mongoose.model('Role', RoleSchema);
