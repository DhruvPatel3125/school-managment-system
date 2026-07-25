const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const auth = require('../middlewares/auth');
const tenantResolver = require('../middlewares/tenantResolver');

router.use(auth);
router.use(tenantResolver);

// 1. GET /api/v1/notifications - Get notifications for current user/role
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Filter matching user's tenantId, and either their direct recipientId or matching recipientRole / 'all'
    const filter = {
      tenantId: req.tenantId,
      $or: [
        { recipientId: userId },
        { recipientRole: userRole },
        { recipientRole: 'all' }
      ]
    };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('createdBy', 'name email');

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error) {announcementCount
    next(error);
  }
});

// 2. PUT /api/v1/notifications/:id/read - Mark single notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// 3. PUT /api/v1/notifications/read-all - Mark all user notifications as read
router.put('/read-all', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    await Notification.updateMany(
      {
        tenantId: req.tenantId,
        isRead: false,
        $or: [
          { recipientId: userId },
          { recipientRole: userRole },
          { recipientRole: 'all' }
        ]
      },
      { isRead: true, readAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/v1/notifications - Dispatch targeted notification (Admin / Teacher operation)
router.post('/', async (req, res, next) => {
  try {
    if (!['school_admin', 'teacher', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Only staff or administrators can dispatch notifications.' });
    }

    const { recipientId, recipientRole, title, message, type, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required.' });
    }

    const notification = await Notification.create({
      tenantId: req.tenantId,
      recipientId: recipientId || null,
      recipientRole: recipientRole || 'all',
      title,
      message,
      type: type || 'GENERAL',
      link: link || null,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

// 5. DELETE /api/v1/notifications/:id - Dismiss/delete notification
router.delete('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    res.status(200).json({ success: true, message: 'Notification dismissed.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
