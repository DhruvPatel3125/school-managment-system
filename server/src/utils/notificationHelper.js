const Notification = require('../models/notification');

/**
 * Reusable helper to create notification logs
 * @param {Object} options
 * @param {string} options.tenantId
 * @param {string} [options.recipientId]
 * @param {string} [options.recipientRole]
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.type]
 * @param {string} [options.link]
 * @param {string} [options.createdBy]
 */
const createNotification = async ({
  tenantId,
  recipientId = null,
  recipientRole = 'all',
  title,
  message,
  type = 'GENERAL',
  link = null,
  createdBy = null
}) => {
  try {
    if (!tenantId || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      tenantId,
      recipientId,
      recipientRole,
      title,
      message,
      type,
      link,
      createdBy
    });

    return notification;
  } catch (error) {
    console.error('⚠️ Failed to dispatch notification:', error.message || error);
    return null;
  }
};

module.exports = {
  createNotification
};
