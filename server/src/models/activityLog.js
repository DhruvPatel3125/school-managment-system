const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  performedBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
