const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null if targeted by role
  },
  recipientRole: {
    type: String,
    enum: ['super_admin', 'school_admin', 'teacher', 'student', 'parent', 'all'],
    default: 'all'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['ANNOUNCEMENT', 'ASSIGNMENT', 'ATTENDANCE', 'FEE', 'SYSTEM', 'GENERAL'],
    default: 'GENERAL'
  },
  link: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Compound index for fast user notification querying
NotificationSchema.index({ tenantId: 1, recipientId: 1, recipientRole: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
