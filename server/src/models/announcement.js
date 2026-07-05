const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    enum: ['NOTICE', 'HOLIDAY', 'EXAM', 'EVENT', 'ACADEMIC', 'FEES'],
    default: 'NOTICE'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for fast querying by tenant
AnnouncementSchema.index({ tenantId: 1, created_at: -1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
