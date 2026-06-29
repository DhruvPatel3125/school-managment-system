const mongoose = require('mongoose');

// Define Schema for Permission (e.g., "manage:tenants", "write:attendance")
const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Permission', PermissionSchema);
